# AGENTS.md

Guidelines for agentic coding agents working in this repository.

## Project Overview

Real-time collaborative personal site with cursor sharing. YoRHa-inspired aesthetic from NieR: Automata.

**Architecture:**
- `web/` - SvelteKit 5 frontend (Cloudflare Pages)
- `cursor-server/` - WebSocket server (Cloudflare Workers + Durable Objects)

---

## Build Commands

```bash
# Web (SvelteKit Frontend)
cd web && npm install
npm run dev          # Development server (http://localhost:5173)
npm run check        # Type checking
npm run build        # Production build
npm run preview      # Preview production build

# Cursor Server (Cloudflare Workers)
cd cursor-server && npm install
npm run dev          # Development server (http://localhost:8787)
npm run check        # Type checking
npm run deploy       # Deploy to Cloudflare
```

### Running Locally
1. Start cursor-server: `cd cursor-server && npm run dev`
2. Start web: `cd web && npm run dev`
3. Open http://localhost:5173

---

## Test Commands

**No test framework configured.** Manual testing required.

---

## Code Style Guidelines

### TypeScript
- **Strict mode:** Both projects use `"strict": true`
- **ES modules:** `"type": "module"` in package.json
- **No comments:** Keep code self-documenting

### Imports
```typescript
// SvelteKit $lib alias
import { something } from '$lib/stores/something';
import Component from '$lib/components/Component.svelte';

// External imports first, then internal
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
```

### Svelte 5 Runes
Always use runes instead of legacy reactivity:
```svelte
<script lang="ts">
    let count = $state(0);
    let doubled = $derived(count * 2);
    $effect(() => {
        console.log(count);
        return () => { /* cleanup */ };
    });
</script>
```

### Store Pattern
Use factory functions:
```typescript
function createSocketStore() {
    const { subscribe, set, update } = writable<WSStatus>('disconnected');
    return {
        subscribe,
        connect: (url: string) => { /* ... */ },
        disconnect: () => { /* ... */ }
    };
}
export const socketStore = createSocketStore();
```

### Interfaces
Define at top of files:
```typescript
export interface RemoteCursor {
    id: number;
    x: number;
    y: number;
}
```

### Error Handling
- Early returns for validation
- Validate external data before use
```typescript
function validateNumber(value: unknown, min: number, max: number): number | null {
    if (typeof value !== 'number' || !isFinite(value)) return null;
    return Math.max(min, Math.min(max, value));
}
```

### WebSocket Protocol
Compact JSON with short keys:
```typescript
// Client -> Server
{ "t": "m", "x": 0.523, "y": 0.124 }  // move
{ "t": "hide" }                        // hide cursor
{ "t": "show", "x": 0.5, "y": 0.5 }   // show cursor

// Server -> Client
{ "t": "init", "id": 1, "count": 5 }
{ "t": "sync", "users": [...] }
{ "t": "join", "id": 2, "x": 0.5, "y": 0.5 }
{ "t": "m", "id": 2, "x": 0.3, "y": 0.4 }
{ "t": "leave", "id": 2 }
```

### CSS Styling
- Use scoped `<style>` blocks in Svelte components
- YoRHa theme: Background `#dcd8c0`, Border `#bab5a1`, Text `#454138`, Header `rgba(100, 98, 86, 0.8)`

### API Routes (SvelteKit)
```typescript
export async function GET({ platform }) {
    const env = platform?.env;
    if (!env?.ANALYTICS) {
        return new Response(JSON.stringify({ error: 'Not configured' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    return handleRequest(env);
}
```

### Cloudflare Workers
```typescript
export interface Env {
    CURSOR_ROOM: DurableObjectNamespace;
    ALLOWED_ORIGINS: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> { /* ... */ }
};
```

---

## Project Structure

```
├── web/
│   ├── src/routes/           # SvelteKit routes (+page.svelte, +server.ts)
│   ├── src/lib/components/   # Svelte components
│   ├── src/lib/stores/       # Svelte stores (socket, cursors)
│   ├── src/lib/data/         # Static data (links, projects)
│   ├── src/content/transmissions/  # Markdown blog posts
│   └── vite-plugin-transmissions.ts
├── cursor-server/
│   ├── src/index.ts          # Durable Object + WebSocket handling
│   └── wrangler.toml
└── README.md, DEPLOYMENT.md, tech-spec.md
```

---

## Adding Blog Posts

Create `web/src/content/transmissions/005-new-post.md`:
```markdown
---
title: Your Title
date: 2024-03-01
description: "A short description"
---
Content here...
```
Filename becomes URL slug: `005-new-post.md` → `/transmissions/005-new-post`

---

## Important Notes

- **No linting/formatting tools** - Follow existing patterns
- **No test framework** - Manual testing required
- Run `npm run check` in both `web/` and `cursor-server/` after changes
- Cursor coordinates normalized (0.0-1.0) for resolution independence
- WebSocket messages throttled to 50ms client-side
