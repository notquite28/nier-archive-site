---
title: "System Architecture"
description: "How the shared cursor system works"
date: 2024-11-15
---

# System Architecture

## The Network

This proof of concept is built on a simple premise: strangers on the internet, connected through cursors, experiencing a space together.

The architecture consists of three main components working in harmony:

- **Frontend**: SvelteKit application running in the browser
- **WebSocket Server**: Real-time communication relay
- **Cursor State**: Synchronized across all connected units

## Data Flow

When you move your cursor, your position is normalized to viewport coordinates (0-1 range) and broadcast to the server. The server then relays this position to all other connected units. Each unit renders foreign cursors with a slight fade-in animation.

```
Your Cursor → WebSocket → Server → Broadcast → Other Units
```

This creates the illusion of shared presence - other visitors exploring alongside you, just as in Ending E of Nier Automata.

## Presence Protocol

Each unit broadcasts:

- Normalized X/Y position
- Visibility state (hidden when tab is inactive)
- Unique identifier (randomly generated per session)

No personal data is collected. This is about shared experience, not surveillance.

Cheers! <br>
quiet🌸
