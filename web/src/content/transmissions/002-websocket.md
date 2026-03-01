---
title: "WebSocket Implementation"
description: "Real-time cursor synchronization"
date: 2024-11-17
---

# WebSocket Implementation

## The Connection

At the heart of this experience lies a WebSocket connection. Unlike HTTP's request-response model, WebSockets provide a persistent, bidirectional channel - essential for real-time cursor tracking.

## Message Types

The protocol uses a simple message format:

```json
{
  "type": "move",
  "x": 0.5,
  "y": 0.3
}
```

```json
{
  "type": "hide"
}
```

```json
{
  "type": "show"
}
```

## Server Implementation

The server is a minimal WebSocket relay built for Cloudflare Workers. It maintains a set of active connections and broadcasts cursor updates to all connected units except the sender.

Key features:

- Connection management with unique IDs
- Graceful disconnection handling
- Message validation
- Broadcast optimization

## Why This Matters

In Nier Automata's Ending E, players sacrifice their save data to help others. Here, you sacrifice nothing - only your cursor's presence joins the collective. Every visitor becomes part of the installation.

Cheers! <br>
quiet🌸
