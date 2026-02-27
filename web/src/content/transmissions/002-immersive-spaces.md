---
title: Building Immersive Spaces
date: 2024-02-20
description: Thoughts on creating web experiences that feel alive
---

## The Vision

Traditional websites feel static and lonely. You visit alone, browse alone, leave alone. But what if the web could feel more like a shared space?

### The Cursor Experiment

When you see other cursors moving in real-time, something changes:

1. **Presence** - You're not alone
2. **Awareness** - Others are exploring too  
3. **Connection** - A subtle bond forms

> "The best interfaces disappear. The best experiences linger."

### Technical Implementation

We use normalized coordinates (0-1) so cursors appear correctly on any screen size:

```typescript
const x = e.clientX / window.innerWidth;
const y = e.clientY / window.innerHeight;
```

The server broadcasts these positions to all connected units via WebSocket.

### What's Next

This is just the beginning. Imagine:

- Leaving messages for future visitors
- Drawing together on a shared canvas
- Seeing heatmaps of popular areas

The Archive is a work in progress.
