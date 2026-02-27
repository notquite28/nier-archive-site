---
title: The NieR Inspiration
date: 2024-02-15
description: How NieR: Automata influenced this project
---

## A Different Kind of Ending

NieR: Automata's **Ending E** changed how I think about multiplayer experiences. In it, players help each other through an impossible challenge. When you fail, other players' data appears to assist you.

### The Connection

This site draws from that philosophy:

- **Shared Presence**: Other cursors represent real visitors
- **Collective Experience**: We're all exploring together
- **Persistence**: Visits are tracked, you leave a mark

### The Aesthetic

The 8-bit segment of NieR's soundtrack inspired the visual direction:

- Pixel fonts
- Dark terminals
- Scanline backgrounds
- Weight of the World playing softly

### Technical Notes

The cursor system uses:

```
Client → WebSocket → Server → Broadcast → All Clients
```

Positions update every 50ms with throttling to prevent flooding.

---

*We fight not alone, but together.*
