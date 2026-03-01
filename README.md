# The Archive

Real-time collaborative personal site with cursor sharing, powered by Cloudflare's edge infrastructure. Features YoRHa-inspired aesthetics from NieR: Automata.

## Overview

The Archive is a multiplayer web experience where visitors can see each other's cursors in real-time. It combines a SvelteKit frontend with a WebSocket server built on Cloudflare Workers + Durable Objects for stateful, low-latency connections.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ SvelteKit 5 │    │ WebSocket    │    │ CSS Transforms   │   │
│  │ (Runes)     │───▶│ Client       │───▶│ (Interpolation)  │   │
│  └─────────────┘    └──────────────┘    └──────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ wss://
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cloudflare Workers + Durable Objects               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CursorServer (Durable Object)                           │  │
│  │  - Maintains connected clients                           │  │
│  │  - Broadcasts cursor positions (normalized 0.0-1.0)      │  │
│  │  - Tracks viewer count                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Cloudflare Pages + KV                         │
│  ┌──────────────┐    ┌───────────────┐    ┌────────────────┐   │
│  │ SvelteKit    │    │ Analytics API │    │ KV Namespace   │   │
│  │ Static Assets│    │ (Edge Funcs)  │───▶│ (Visit Stats)  │   │
│  └──────────────┘    └───────────────┘    └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## How It Works

### Cursor Sharing Protocol

1. **Client → Server**: Mouse position is throttled (50ms) and normalized (0.0-1.0) for resolution independence
   ```json
   { "t": "m", "x": 0.523, "y": 0.124 }
   ```

2. **Server → Clients**: Broadcast includes unique client ID
   ```json
   { "t": "m", "id": "user_99", "x": 0.523, "y": 0.124 }
   ```

3. **Rendering**: CSS transforms with transitions provide hardware-accelerated smoothing

### Blog System (Transmissions)

A custom Vite plugin parses markdown files at build time:
- Frontmatter extracted via `gray-matter`
- Content rendered to HTML via `marked`
- Bundled as a virtual module for Svelte consumption

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | SvelteKit 5 + Runes | Reactive UI with $state, $derived |
| WebSocket | Cloudflare Workers + Durable Objects | Stateful real-time connections |
| Hosting | Cloudflare Pages | Edge deployment, static + functions |
| Analytics | Cloudflare KV | Key-value store for visit tracking |
| Build | Vite + Custom Plugin | Markdown → virtual module |
| Styling | Custom CSS (YoRHa theme) | Beige/cream palette |

## Project Structure

```
├── cursor-server/           # WebSocket server
│   ├── src/index.ts         # Durable Object + WebSocket handling
│   └── wrangler.toml        # Cloudflare Workers config
│
├── web/                     # SvelteKit frontend
│   ├── src/
│   │   ├── routes/          # Page routes + API endpoints
│   │   ├── lib/
│   │   │   ├── stores/      # Svelte stores (socket, cursors)
│   │   │   └── data/        # Static data (links, projects)
│   │   └── content/
│   │       └── transmissions/  # Markdown blog posts
│   ├── vite-plugin-transmissions.ts  # Build-time MD parser
│   └── package.json
│
├── README.md                # This file
└── DEPLOYMENT.md            # Deployment guide
```

## Features

- **Live cursor sharing** — See other visitors' cursors in real-time
- **Viewer count** — Active users on page
- **Visit analytics** — Total visits + top referrers (KV-backed)
- **Blog system** — Markdown-based transmissions
- **YoRHa theme** — NieR: Automata inspired design
- **Easter eggs** — Konami code, rapid-click achievements
- **Background music** — Toggleable audio

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### 1. Start the Cursor Server
```bash
cd cursor-server
npm install
npm run dev
```

### 2. Start the Frontend
```bash
cd web
npm install
npm run dev
```

### 3. Open http://localhost:5173

Open multiple tabs to see cursor sharing in action.

## Adding Blog Posts

Create a markdown file in `web/src/content/transmissions/`:

```markdown
---
title: Your Title
date: 2024-03-01
description: "A short description"
---

Your markdown content here...
```

Filename becomes the URL slug: `005-new-post.md` → `/transmissions/005-new-post`

## Development Commands

```bash
# Type checking
cd web && npm run check
cd cursor-server && npm run check

# Build
cd web && npm run build

# Preview production build
cd web && npm run preview
```

## Credits

- **[YoRHa Theme](https://metakirby5.github.io/yorha/)** by metakirby5 — CSS styling and color palette
- **[NieR List Template](https://hoanganhdinhngoc.github.io/cdn/)** — Accordion navigation pattern
- **[Daniele Avolio](https://www.danieleavolio.it/)** — Design inspiration

---

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
