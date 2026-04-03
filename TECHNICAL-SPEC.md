# Technical Specification: nier-archive-site

## Table of Contents

- [1. High-Level Overview](#1-high-level-overview)
- [2. Architecture Diagram](#2-architecture-diagram)
- [3. Technology Stack](#3-technology-stack)
- [4. The Two Projects](#4-the-two-projects)
- [5. Cursor Server (Backend) — Deep Dive](#5-cursor-server-backend--deep-dive)
  - [5.1 Entry Point and Request Routing](#51-entry-point-and-request-routing)
  - [5.2 Origin Validation (Security)](#52-origin-validation-security)
  - [5.3 Durable Object: CursorRoom](#53-durable-object-cursorroom)
  - [5.4 WebSocket Lifecycle](#54-websocket-lifecycle)
  - [5.5 The WebSocket Protocol](#55-the-websocket-protocol)
  - [5.6 Broadcast Mechanism](#56-broadcast-mechanism)
- [6. Web Frontend — Deep Dive](#6-web-frontend--deep-dive)
  - [6.1 SvelteKit + Cloudflare Pages](#61-sveltekit--cloudflare-pages)
  - [6.2 Build-Time Blog System (Transmissions)](#62-build-time-blog-system-transmissions)
  - [6.3 Store Architecture](#63-store-architecture)
  - [6.4 WebSocket Client (socket store)](#64-websocket-client-socket-store)
  - [6.5 Cursor Store](#65-cursor-store)
  - [6.6 Window Manager Store](#66-window-manager-store)
  - [6.7 Component Architecture](#67-component-architecture)
  - [6.8 Page Rendering Flow](#68-page-rendering-flow)
  - [6.9 Analytics System](#69-analytics-system)
- [7. Complete Data Flow Walkthrough](#7-complete-data-flow-walkthrough)
- [8. Key Design Decisions](#8-key-design-decisions)
- [9. Deployment Architecture](#9-deployment-architecture)
- [10. Interview Cheat Sheet](#10-interview-cheat-sheet)

---

## 1. High-Level Overview

This is a **real-time collaborative personal website** where visitors can see each other's mouse cursors moving on the page simultaneously. The concept is inspired by **Ending E of NieR: Automata**, where players sacrifice their save data to help strangers — here, visitors contribute their cursor presence to a shared experience.

The system has two independent deployables:

1. **`cursor-server/`** — A stateless Cloudflare Worker that delegates to a **Durable Object** which maintains persistent WebSocket connections and broadcasts cursor positions between all connected clients in real time.

2. **`web/`** — A **SvelteKit 5** single-page application deployed to **Cloudflare Pages** that renders the UI, manages cursor overlays, tracks analytics via KV, and serves a markdown-based blog.

The two communicate exclusively over **WebSocket** (`wss://`).

---

## 2. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │ SvelteKit 5  │  │ socketStore      │  │ CursorOverlay         │  │
│  │ App          │──│ (WS client +     │──│ (renders remote       │  │
│  │              │  │  reconnect)      │  │  cursors as divs)     │  │
│  └──────────────┘  └────────┬─────────┘  └───────────────────────┘  │
│         │                    │                                       │
│    mousemove event     wss:// WebSocket                              │
│    (throttled 50ms)    JSON messages                                 │
│         │                    │                                       │
└─────────┼────────────────────┼───────────────────────────────────────┘
          │                    │
          │  normalized x,y   │  WebSocket upgrade
          ▼                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE WORKER (cursor-server)                       │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Default export (fetch handler)                                │  │
│  │  1. Checks Origin header against ALLOWED_ORIGINS               │  │
│  │  2. Routes /ws to Durable Object                               │  │
│  │  3. Routes /health to 200 OK                                   │  │
│  └──────────────────────────┬─────────────────────────────────────┘  │
│                             │ idFromName('global')                    │
│                             ▼                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  CursorRoom Durable Object                                     │  │
│  │  - Map<id, WebSocket> of all connected users                   │  │
│  │  - Assigns sequential user IDs                                 │  │
│  │  - On connect: sends init + sync, broadcasts join              │  │
│  │  - On message: validates, clamps coords, broadcasts move      │  │
│  │  - On disconnect: removes user, broadcasts leave               │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
          │
          │  Also in Cloudflare's edge network (separate deployment)
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│              CLOUDFLARE PAGES (web)                                  │
│                                                                      │
│  ┌──────────────────┐  ┌───────────────┐  ┌──────────────────────┐  │
│  │ Static Assets    │  │ SvelteKit     │  │ KV Namespace         │  │
│  │ (HTML, JS, CSS)  │  │ Server Routes │──│ (ANALYTICS binding)  │  │
│  │ served from CDN  │  │ (/api/*)      │  │                      │  │
│  └──────────────────┘  └───────────────┘  └──────────────────────┘  │
│                                                                      │
│  Build-time:                                                         │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  vite-plugin-transmissions                                     │  │
│  │  reads src/content/transmissions/*.md → gray-matter + marked   │  │
│  │  → exposes as virtual:transmissions-data (ES module)           │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | What It Does |
|-------|-----------|-------------|
| **Frontend Framework** | SvelteKit 5 (with Runes) | Reactive component-based UI. Uses `$state`, `$derived`, `$effect` runes instead of legacy `$:` syntax. |
| **Frontend Adapter** | `@sveltejs/adapter-cloudflare` | Compiles SvelteKit app into Cloudflare Pages-compatible output (static assets + edge functions). |
| **Backend Runtime** | Cloudflare Workers | Serverless edge functions. Runs the cursor-server WebSocket handler at Cloudflare's edge (V8 isolate, not Node.js). |
| **Stateful Backend** | Cloudflare Durable Objects | A single-server-per-room stateful compute. The `CursorRoom` DO holds all WebSocket connections in memory for one "global" room. |
| **Real-time Transport** | WebSocket (`WebSocketPair` API) | Full-duplex, persistent connections. Cloudflare's hibernatable WebSockets API. |
| **Analytics Storage** | Cloudflare KV | Globally distributed key-value store. Stores visit counts and referrer data with TTL-based expiration. |
| **Blog Engine** | Custom Vite Plugin + `gray-matter` + `marked` | Markdown files are parsed at build time into a virtual ES module. No server-side markdown rendering. |
| **HTML Sanitization** | DOMPurify | Prevents XSS when rendering user-facing HTML (blog content, window content). |
| **Build Tool** | Vite 7 | Bundler and dev server. Runs the custom transmissions plugin and SvelteKit plugin. |
| **Language** | TypeScript (strict mode) | Both projects use `"strict": true` with ES2022 target. |
| **Styling** | Scoped CSS (Svelte `<style>` blocks) | YoRHa theme palette: background `#dcd8c0`, borders `#bab5a1`, text `#454138`. |

---

## 4. The Two Projects

### `cursor-server/` — WebSocket Relay

```
cursor-server/
├── src/
│   └── index.ts          # Everything: Worker fetch handler + CursorRoom Durable Object
├── wrangler.toml         # Cloudflare config: DO binding, ALLOWED_ORIGINS
├── package.json          # Dev deps: wrangler, typescript, @cloudflare/workers-types
└── tsconfig.json         # Strict TS targeting ES2022
```

- No runtime dependencies (zero npm production deps)
- Single file (`src/index.ts`, ~170 lines) contains:
  - `Env` interface
  - `CursorRoom` class (the Durable Object)
  - Default export (the Worker `fetch` handler)
  - `isOriginAllowed` helper

### `web/` — SvelteKit Frontend

```
web/
├── src/
│   ├── app.html                  # HTML shell
│   ├── app.d.ts                  # TypeScript declarations (Platform env, virtual module)
│   ├── lib/
│   │   ├── stores/
│   │   │   ├── socket.ts         # WebSocket client store (connect/reconnect/send)
│   │   │   ├── cursors.ts        # Remote cursor state + viewer count
│   │   │   └── windows.ts        # Draggable window manager + DOMPurify
│   │   ├── data/
│   │   │   ├── links.ts          # External links
│   │   │   ├── projects.ts       # Project cards
│   │   │   └── transmissions.ts  # Re-exports from virtual:transmissions-data
│   │   ├── analytics-server.ts   # Shared analytics handlers (GET/POST/DELETE)
│   │   └── components/
│   │       ├── CursorOverlay.svelte    # Renders remote cursors as positioned <div>s
│   │       ├── ViewerCount.svelte      # Online user count (top-right)
│   │       ├── VisitCounter.svelte     # Total visits (bottom-left)
│   │       ├── MusicPlayer.svelte      # Toggleable background audio
│   │       ├── secrets/
│   │       │   └── EasterEggs.svelte   # Konami code + rapid-click achievements
│   │       ├── sections/
│   │       │   ├── Whoami.svelte       # About section
│   │       │   ├── Projects.svelte     # Project cards
│   │       │   ├── Transmissions.svelte# Blog post list
│   │       │   └── Network.svelte      # Links section
│   │       ├── terminal/
│   │       │   └── Terminal.svelte     # Terminal-style nav (used by old windowed UI)
│   │       └── window/
│   │           ├── Window.svelte       # Draggable/resizable window component
│   │           └── WindowManager.svelte# Renders open windows
│   ├── content/
│   │   └── transmissions/        # Markdown blog posts (001-architecture.md, etc.)
│   └── routes/
│       ├── +layout.svelte        # Global styles, custom cursor
│       ├── +page.svelte          # Main page (accordion sections + cursor overlay)
│       ├── +error.svelte         # Error page
│       ├── api/
│       │   ├── analytics/+server.ts        # GET/POST/DELETE visit analytics
│       │   └── transmissions/
│       │       ├── +server.ts              # GET list of transmissions
│       │       └── [slug]/+server.ts       # GET single transmission
│       └── transmissions/
│           └── [slug]/+page.svelte         # Blog post page
├── vite-plugin-transmissions.ts  # Build-time markdown → virtual module
├── wrangler.toml                 # KV binding, VITE_WS_URL
├── svelte.config.js              # adapter-cloudflare config
├── vite.config.ts                # plugins: transmissions + sveltekit
└── package.json                  # SvelteKit, dompurify, gray-matter, marked
```

---

## 5. Cursor Server (Backend) — Deep Dive

### 5.1 Entry Point and Request Routing

The default export in `src/index.ts` is a standard Cloudflare Worker `fetch` handler:

```typescript
export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (url.pathname === '/ws' && request.headers.get('Upgrade') === 'websocket') {
            // Validate origin, then forward to Durable Object
            const origin = request.headers.get('Origin');
            if (!isOriginAllowed(origin, env.ALLOWED_ORIGINS)) {
                return new Response('Forbidden', { status: 403 });
            }
            const id = env.CURSOR_ROOM.idFromName('global');
            const stub = env.CURSOR_ROOM.get(id);
            return stub.fetch(request);
        }

        if (url.pathname === '/health') return new Response('OK', { status: 200 });
        return new Response('Not Found', { status: 404 });
    }
};
```

**What happens step by step:**
1. A client sends `GET /ws` with `Upgrade: websocket` header.
2. The Worker checks the `Origin` header against the `ALLOWED_ORIGINS` env var (CORS protection).
3. It resolves the Durable Object stub using `idFromName('global')` — meaning **all users connect to the same Durable Object instance** (a single global room).
4. It forwards the request to the Durable Object's `fetch` method.

### 5.2 Origin Validation (Security)

```typescript
function isOriginAllowed(origin: string | null, allowedOrigins: string): boolean {
    if (!origin) return false;
    const allowed = allowedOrigins.split(',').map(s => s.trim());
    return allowed.some(a => {
        if (origin === a || origin.startsWith(a)) return true;
        try {
            const originHost = new URL(origin).hostname;
            const allowedHost = new URL(a).hostname;
            return originHost === allowedHost || originHost.endsWith('.' + allowedHost);
        } catch { return false; }
    });
}
```

This prevents unauthorized websites from connecting to the WebSocket server. The allowed origins are hardcoded in `wrangler.toml`:
```toml
ALLOWED_ORIGINS = "http://localhost:5173,...,https://quietillust.cafe"
```

### 5.3 Durable Object: CursorRoom

**What is a Durable Object?** It's a Cloudflare primitive that gives you a **single-threaded, stateful compute instance** identified by a name. Unlike a stateless Worker (which can run on any edge node), a Durable Object runs in one location and maintains in-memory state.

The `CursorRoom` class:

```typescript
export class CursorRoom implements DurableObject {
    private state: DurableObjectState;
    private users: Map<number, WebSocketWithData> = new Map();
    private userIdCounter = 0;
    // ...
}
```

- `users` — In-memory map of `{ userId → WebSocket }` for all connected clients.
- `userIdCounter` — Sequential counter for assigning unique IDs.
- All state is in-memory (no persistence needed — cursor positions are ephemeral).

### 5.4 WebSocket Lifecycle

**On Connection (`handleWebSocket`):**

1. Creates a `WebSocketPair` (Cloudflare's API: `new WebSocketPair()` returns `[client, server]`).
2. Calls `this.state.acceptWebSocket(server)` — tells the DO to handle WebSocket events via the `webSocketMessage`/`webSocketClose`/`webSocketError` methods.
3. Creates a `User` object with `id = ++userIdCounter`, initial position `(0.5, 0.5)`, `visible = true`.
4. Stores `user` data on the WebSocket object itself (`server.userData = user`).
5. Sends the **init** message to the new user: `{ t: 'init', id, count }`.
6. Sends a **sync** message listing all existing visible cursors to the new user.
7. Broadcasts a **join** message to all OTHER users about the new user.
8. Returns `Response(null, { status: 101, webSocket: client })` — the HTTP 101 Switching Protocols response that hands the client-side WebSocket to the browser.

**On Message (`webSocketMessage`):**

The Durable Object receives messages and routes by type:

| Message Type | Server Action |
|---|---|
| `{ t: 'm', x, y }` | Clamp coordinates to `[0, 1]`, update user position, broadcast `{ t: 'm', id, x, y }` to all other users |
| `{ t: 'hide' }` | Set user invisible, broadcast `{ t: 'leave', id }` to all others |
| `{ t: 'show', x, y }` | Set user visible, update position, broadcast `{ t: 'join', id, x, y }` to all others |
| `{ t: 'ping' }` | Reply with `{ t: 'pong' }` (keepalive) |

**On Disconnect (`webSocketClose` / `webSocketError`):**

1. Remove user from the `users` map.
2. Broadcast `{ t: 'leave', id }` to all remaining users.

### 5.5 The WebSocket Protocol

All messages are compact JSON with short keys to minimize payload size:

**Client → Server:**
```json
{ "t": "m", "x": 0.523, "y": 0.124 }    // Move cursor
{ "t": "hide" }                           // Tab hidden, stop showing cursor
{ "t": "show", "x": 0.5, "y": 0.5 }      // Tab visible again, resume showing
{ "t": "ping" }                           // Keepalive
```

**Server → Client:**
```json
{ "t": "init", "id": 1, "count": 5 }      // Assigned user ID + current room size
{ "t": "sync", "users": [...] }            // List of existing cursors (on join)
{ "t": "join", "id": 2, "x": 0.5, "y": 0.5 }  // New user appeared
{ "t": "m", "id": 2, "x": 0.3, "y": 0.4 }      // User moved
{ "t": "leave", "id": 2 }                        // User disconnected
{ "t": "pong" }                                  // Keepalive response
```

**Why normalized coordinates (0.0-1.0)?** A cursor at `(0.5, 0.5)` appears in the center of any screen regardless of resolution. The frontend converts: `x = clientX / window.innerWidth`, `y = clientY / window.innerHeight`. Rendering does the inverse: `left: x * 100%`, `top: y * 100%`.

### 5.6 Broadcast Mechanism

```typescript
private broadcast(msg: object, excludeId: number | null): void {
    const data = JSON.stringify(msg);
    for (const [id, ws] of this.users) {
        if (id !== excludeId && ws.readyState === WebSocket.OPEN) {
            ws.send(data);
        }
    }
}
```

This is a simple fan-out: iterate all connected WebSockets, skip the sender (`excludeId`), and send the serialized message. The broadcast runs synchronously in the Durable Object's single-threaded context, so there are no race conditions.

---

## 6. Web Frontend — Deep Dive

### 6.1 SvelteKit + Cloudflare Pages

SvelteKit is a meta-framework for Svelte that provides:
- **File-based routing** (`src/routes/` directory structure maps to URLs)
- **Server-side API routes** (`+server.ts` files export GET/POST/etc handlers)
- **Page components** (`+page.svelte` files)
- **Layouts** (`+layout.svelte` wraps all pages)

The `@sveltejs/adapter-cloudflare` adapter compiles the SvelteKit app into:
- **Static HTML/JS/CSS** for client-side navigation
- **Edge functions** (Cloudflare Workers) for server routes (`/api/*`)

These are deployed to **Cloudflare Pages**, which serves static assets from CDN and runs server-side code at the edge.

### 6.2 Build-Time Blog System (Transmissions)

The `vite-plugin-transmissions.ts` is a **custom Vite plugin** that:

1. **Runs at build start** (`buildStart` hook):
   - Reads all `.md` files from `src/content/transmissions/`
   - Parses frontmatter with `gray-matter` (extracts `title`, `date`, `description`)
   - Converts markdown body to HTML with `marked`
   - Sorts by date (newest first)
   - Serializes to a JS string: `export const transmissionsData = [...]`

2. **Creates a virtual module** (`virtual:transmissions-data`):
   - `resolveId` intercepts `import ... from 'virtual:transmissions-data'`
   - `load` returns the generated JS code
   - Declared in `app.d.ts` so TypeScript knows the types

3. **Consumed by** `src/lib/data/transmissions.ts`:
   - `loadTransmissions()` → returns all posts
   - `loadTransmission(slug)` → returns one post by slug

**Why build-time?** Cloudflare Workers (where server routes run) don't support `eval()`, which `gray-matter` and `marked` may use. By parsing markdown at build time in Node.js, the runtime only deals with pre-compiled HTML strings.

### 6.3 Store Architecture

The app uses **Svelte stores** (from `svelte/store`) wrapped in **factory functions** for encapsulation:

```typescript
function createSocketStore() {
    let socket: WebSocket | null = null;     // private state
    let lastSend = 0;                         // private state
    const { subscribe, set, update } = writable<WSStatus>('disconnected');

    // ... private methods that close over the mutable state ...

    return { subscribe, connect, sendMove, sendHide, sendShow, disconnect };
}
export const socketStore = createSocketStore();
```

This pattern provides:
- **Encapsulation** — `socket`, `lastSend`, `lastX`, `lastY` are private to the closure
- **Reactive subscription** — components use `$socketStore` to reactively bind to the status
- **Singleton** — the exported store is a single instance shared across all components

There are three stores:

| Store | File | State | Purpose |
|---|---|---|---|
| `socketStore` | `stores/socket.ts` | `WSStatus` writable | WebSocket lifecycle (connect/disconnect/reconnect), message handling |
| `cursors` | `stores/cursors.ts` | `Map<number, RemoteCursor>` | All remote cursor positions |
| `viewerCount` | `stores/cursors.ts` | `number` | Number of connected users |
| `windowManager` | `stores/windows.ts` | `WindowState[]` | Open draggable windows (for the terminal-based UI variant) |

### 6.4 WebSocket Client (socket store)

**File:** `src/lib/stores/socket.ts`

**Connection lifecycle:**

1. **`connect(url)`** — Creates a `new WebSocket(url)`, sets status to `'connecting'`.
2. **`onopen`** — Sets status to `'connected'`, resets reconnect counter.
3. **`onclose`** — Sets status to `'disconnected'` or `'reconnecting'`, triggers `attemptReconnect()`.
4. **`onerror`** — Logs error (close handler will trigger reconnect).

**Reconnection strategy:**
- Exponential backoff: starts at 1000ms, doubles each attempt, max 30 seconds.
- `reconnectAttempts` counter persists across attempts.
- `attemptReconnect()` sets a timeout that calls `connect(currentUrl)`.

**Throttling:**
```typescript
function sendMove(x: number, y: number) {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const now = Date.now();
    if (now - lastSend < THROTTLE_MS) return;   // 50ms throttle
    lastSend = now;
    socket.send(JSON.stringify({ t: 'm', x, y }));
}
```
Mouse events fire ~60 times/second. Without throttling, this would generate 60 messages/sec per user. With 50ms throttle, it's max 20 messages/sec.

**Message handling (`handleMessage`):**
Every message from the server is validated with `validateNumber()` before being applied to the cursor store. This prevents malformed data from breaking the UI.

### 6.5 Cursor Store

**File:** `src/lib/stores/cursors.ts`

```typescript
function createCursorStore() {
    const { subscribe, set, update } = writable<Map<number, RemoteCursor>>(new Map());

    return {
        subscribe,
        addCursor: (cursor) => update(map => { map.set(cursor.id, cursor); return map; }),
        updateCursor: (id, x, y) => update(map => { if (map.has(id)) map.set(id, { id, x, y }); return map; }),
        removeCursor: (id) => update(map => { if (map.has(id)) map.delete(id); return map; }),
        syncCursors: (cursors) => set(new Map(cursors.map(c => [c.id, c]))),
        clear: () => set(new Map())
    };
}
```

Uses a `Map<number, RemoteCursor>` for O(1) lookups by user ID. The `cursorList` derived store converts it to an array for iteration in templates.

### 6.6 Window Manager Store

**File:** `src/lib/stores/windows.ts`

This powers an alternative UI where content opens in **draggable, resizable windows** (like a desktop OS). Each window has:
- Position (x, y), size (width, height)
- z-index for stacking order (brought to front on focus)
- Minimized state
- Focused state

The `sanitizeHtml` function uses **DOMPurify** to strip dangerous HTML when rendering content inside windows.

### 6.7 Component Architecture

```
+layout.svelte                         # Global: YoRHa CSS, custom cursor
└── +page.svelte                       # Main page
    ├── ViewerCount.svelte             # Fixed position: top-right
    ├── MusicPlayer.svelte             # Fixed position: top-right (below viewer count)
    ├── CursorOverlay.svelte           # Fixed position: full-screen overlay
    ├── VisitCounter.svelte            # Fixed position: bottom-left
    ├── EasterEggs.svelte              # No UI (listens for Konami code + rapid clicks)
    └── Accordion sections:
        ├── Whoami.svelte              # About section
        ├── Projects.svelte            # Project list
        ├── Transmissions.svelte       # Blog post list (fetches from /api/transmissions)
        └── Network.svelte             # Links
```

**CursorOverlay.svelte** — The key component:
```svelte
{#each cursors as cursor (cursor.id)}
    <div class="remote-cursor" style="left: {cursor.x * 100}%; top: {cursor.y * 100}%;">
        <img src="/assets/cursor.svg" style="filter: {getTint(cursor.id)}" />
    </div>
{/each}
```
- Iterates over `cursorList` (derived from `cursors` store)
- Positions each cursor using percentage-based `left`/`top`
- CSS `transition: left 0.08s linear, top 0.08s linear` provides hardware-accelerated smoothing
- Each cursor gets a unique hue-rotate filter based on its ID (for visual distinction)

### 6.8 Page Rendering Flow

**When a user visits the site:**

1. **`+layout.svelte`** renders — sets global CSS (YoRHa theme, grid background, button styles, custom cursor URL).
2. **`+page.svelte`** renders — mounts all components.
3. **`$effect`** in `+page.svelte` runs on mount:
   - Reads `VITE_WS_URL` from environment (or falls back to `ws://localhost:8787/ws`).
   - Calls `socketStore.connect(wsUrl)` — opens WebSocket.
   - Registers `mousemove` listener → calls `socketStore.sendMove(x, y)` with normalized coords.
   - Registers `visibilitychange` listener → sends `hide` when tab is hidden, `show` when visible.
4. **WebSocket connects** → server sends `init` (user ID, room count) + `sync` (existing cursors).
5. **socketStore** parses messages → calls `cursors.addCursor()`, `cursors.updateCursor()`, etc.
6. **CursorOverlay** reactively renders all cursors from the `cursorList` store.
7. **VisitCounter** mounts → POSTs to `/api/analytics` (records visit), GETs current count.
8. **Transmissions** section mounts → fetches `/api/transmissions` for blog post list.

### 6.9 Analytics System

**How it works:**

1. **VisitCounter.svelte** fires `POST /api/analytics` on mount with `{ referrer: document.referrer }`.
2. **SvelteKit server route** (`src/routes/api/analytics/+server.ts`) delegates to `analytics-server.ts`.
3. The handler:
   - Rate-limits by IP (max 10 requests/minute, stored in KV with 60s TTL).
   - Increments `total_visits` key in KV.
   - Extracts the referrer domain and increments a counter in `referrers:YYYY-MM-DD` key (30-day TTL).
4. **GET** endpoint reads `total_visits` and aggregates referrer data from the last 7 days.
5. **DELETE** endpoint resets all analytics (requires `Authorization: Bearer <token>` with timing-safe comparison).

**KV data structure:**
```
total_visits             → "1234"
referrers:2024-11-15     → '{"google.com": 50, "twitter.com": 30}'
ratelimit:192.168.1.1    → "3" (with 60s TTL)
```

---

## 7. Complete Data Flow Walkthrough

### Scenario: User A moves their mouse, User B sees it

```
TIME    USER A (Browser)                          CURSOR SERVER (Durable Object)              USER B (Browser)
────    ──────────────────                        ──────────────────────────────              ─────────────────
T0      mousemove event fires
T1      x = e.clientX / innerWidth                (DO is idle)
        y = e.clientY / innerHeight
        → x=0.623, y=0.451
T2      socketStore.sendMove(0.623, 0.451)
T3      Throttle check: 45ms since last send
        → SKIP (50ms minimum)
T4      ... 5ms later ...
T5      mousemove fires again
T6      Throttle check: 50ms ✓
T7      socket.send('{"t":"m","x":0.624,"y":0.452}')
T8                                                webSocketMessage() fires
T9                                                Parse JSON → {t:'m', x:0.624, y:0.452}
T10                                               Clamp: x=max(0,min(1,0.624))=0.624
T11                                               Update user.userData.x, .y
T12                                               broadcast({t:'m', id:1, x:0.624, y:0.452}, excludeId=1)
T13                                               Iterate users map:
                                                   → user 2: ws.send('{"t":"m","id":1,...}')
                                                   → user 3: ws.send(...)
                                                   (skip user 1 = sender)
T14                                                                                          socket.onmessage fires
T15                                                                                          handleMessage({t:'m', id:1, x:0.624, y:0.452})
T16                                                                                          cursors.updateCursor(1, 0.624, 0.452)
T17                                                                                          Map updates → store notifies subscribers
T18                                                                                          CursorOverlay re-renders:
                                                                                             <div style="left:62.4%; top:45.2%">
T19                                                                                          CSS transition animates 80ms linear
```

**Latency budget:**
- Client throttle: max 50ms
- Network to Cloudflare edge: ~10-50ms (varies)
- Durable Object processing: <1ms (parse + broadcast)
- Network back to other clients: ~10-50ms
- CSS transition smoothing: 80ms
- **Total perceived latency: ~150-230ms** (acceptable for cursor sharing)

---

## 8. Key Design Decisions

### Why Cloudflare Durable Objects instead of a plain WebSocket server?

| Concern | Plain Worker | Durable Object |
|---|---|---|
| State | Stateless (no in-memory map) | Stateful (Map lives in memory) |
| Coordination | Would need external state (KV/D1) | Single-threaded, no coordination needed |
| WebSocket lifetime | Tied to single request | Survives across requests |
| Race conditions | Possible with concurrent requests | Impossible (single-threaded) |

A plain Worker can't hold a `Map<id, WebSocket>` because each invocation may run on a different machine. The Durable Object guarantees all connections to `idFromName('global')` hit the same instance.

### Why normalized coordinates?

Screen sizes vary wildly (320px phone to 3840px 4K monitor). Raw pixel coordinates would make cursors appear in wrong positions across devices. Normalizing to `[0, 1]` and rendering with `left: x * 100%` ensures resolution independence.

### Why build-time markdown instead of server-side rendering?

Cloudflare Workers run in V8 isolates, not Node.js. Libraries like `gray-matter` and `marked` may use `eval()` or Node APIs that aren't available. By parsing at build time, the runtime only serves pre-compiled HTML strings.

### Why exponential backoff for reconnection?

Network interruptions are common (mobile, Wi-Fi drops). Linear retries would hammer the server. Exponential backoff (1s → 2s → 4s → ... → 30s max) is the standard approach.

### Why a single global room (`idFromName('global')`)?

This is a personal site, not a chat app with thousands of rooms. All visitors share one room. The Durable Object name `'global'` ensures everyone connects to the same instance. If scaling were needed, you'd shard by geographic region or use multiple rooms.

---

## 9. Deployment Architecture

```
GitHub Repository
├── cursor-server/  ──wrangler deploy──▸  Cloudflare Worker
│                                         (cursor-server.<sub>.workers.dev)
│                                         ├── Durable Object: CursorRoom
│                                         └── Routes: /ws, /health
│
└── web/           ──wrangler pages───▸  Cloudflare Pages
                                          (archive-site.pages.dev)
                                          ├── Static assets (HTML/JS/CSS/SVG/MP3)
                                          ├── Edge Functions (SvelteKit server routes)
                                          │   ├── /api/analytics
                                          │   └── /api/transmissions/*
                                          └── KV Namespace binding (ANALYTICS)
```

**Build pipeline:**
1. `cd web && npm run build` → Vite builds SvelteKit → output to `.svelte-kit/cloudflare/`
2. `npx wrangler pages deploy .svelte-kit/cloudflare --project-name=archive-site`
3. `cd cursor-server && npm run deploy` → Wrangler uploads Worker code to Cloudflare

**Environment variables:**
- `VITE_WS_URL` — Baked into the client JS bundle at build time (Vite's `import.meta.env`). Points to the Worker URL.
- `ALLOWED_ORIGINS` — Set in `cursor-server/wrangler.toml`. The Worker checks this at runtime.
- `ANALYTICS_ADMIN_TOKEN` — Secret for resetting analytics (set via Cloudflare dashboard).

---

## 10. Interview Cheat Sheet

**Q: What does this project do?**
A real-time collaborative personal website where visitors see each other's cursors. Inspired by NieR: Automata's Ending E.

**Q: What's the architecture?**
Two independent Cloudflare deployments: a SvelteKit 5 frontend on Cloudflare Pages, and a WebSocket relay on Cloudflare Workers using Durable Objects for stateful connections.

**Q: Why Durable Objects?**
Plain Workers are stateless — each request may hit a different machine. Cursor sharing requires maintaining a Map of all active WebSocket connections in memory. Durable Objects provide single-threaded, stateful compute at the edge, so all users connect to the same in-memory room.

**Q: How does the WebSocket protocol work?**
Compact JSON with short keys. Clients send `{t:'m', x:0.5, y:0.5}` (normalized 0-1 coordinates). Server broadcasts to all other users with the sender's ID attached. The server handles join/leave/sync for connection lifecycle, and ping/pong for keepalives.

**Q: Why normalized coordinates?**
Resolution independence. A cursor at (0.5, 0.5) is center-screen on any device. Client normalizes by dividing `clientX / innerWidth`, server stores as-is, receiver renders with `left: x * 100%`.

**Q: How is the blog system implemented?**
A custom Vite plugin reads markdown files at build time, parses frontmatter with gray-matter, renders to HTML with marked, and exposes the data as a virtual ES module (`virtual:transmissions-data`). This avoids running markdown parsers in Cloudflare Workers (which don't support eval).

**Q: How does analytics work?**
Cloudflare KV stores visit counts and referrer data. The frontend POSTs to `/api/analytics` on mount. The server rate-limits by IP (10 req/min via KV TTL), increments a global counter, and aggregates referrers daily. GET returns total visits + top 5 referrers from last 7 days.

**Q: How is cursor rendering smoothed?**
CSS transitions on the `left` and `top` properties (80ms linear). This provides hardware-accelerated interpolation between position updates without manual frame-by-frame animation.

**Q: How does reconnection work?**
Exponential backoff starting at 1 second, doubling each attempt, maxing at 30 seconds. The store tracks the URL and reconnect counter in closure state.

**Q: What security measures exist?**
- Origin validation on WebSocket connections (ALLOWED_ORIGINS)
- Input validation on all WebSocket messages (validateNumber with clamping)
- DOMPurify sanitization on all rendered HTML
- Rate limiting on analytics endpoints
- Timing-safe token comparison for admin actions
- No personal data collected (only ephemeral cursor positions)
