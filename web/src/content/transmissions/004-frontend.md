---
title: "Frontend Stack"
description: "Technologies powering the experience"
date: 2025-04-20
---

# Frontend Stack

## Building Blocks

This proof of concept is built with care, using modern web technologies:

### SvelteKit

The application framework. SvelteKit provides:

- Server-side rendering for fast initial loads
- Reactive state management
- File-based routing
- TypeScript support out of the box

### WebSocket Integration

Custom stores handle the WebSocket connection lifecycle:

```typescript
socketStore.connect(wsUrl);
socketStore.sendMove(x, y);
socketStore.disconnect();
```

The store pattern ensures cursor state is reactive - when new positions arrive, the UI updates automatically.

### Styling

The aesthetic is deliberately retro-terminal:

- Monospace typography
- Muted earth tones
- Pixel-perfect borders
- No rounded corners (intentional)

### Deployment

Designed for edge deployment:

- Cloudflare Pages for the frontend
- Cloudflare Workers for the WebSocket server
- Minimal latency worldwide

## The Result

A lightweight, real-time, shared experience. No frameworks heavier than needed. No unnecessary complexity. Just cursors, connecting strangers.

Cheers! <br>
quiet🌸
