Technical Spec: High-Concurrency Cursor Tracking

1. Architectural Overview
   The system follows a Pub/Sub (Publish-Subscribe) pattern over WebSockets. To minimize latency, the server acts as a thin "broadcast" layer with minimal processing.

Transport: WebSockets (WS) for full-duplex, low-latency communication.

Server Engine: uWebSockets.js or Socket.io (uWebSockets is preferred for performance).

Data Format: Compact JSON or Binary (Protocol Buffers/Uint8Array) for minimal MTU impact.

2. The Communication Protocol
   To handle hundreds of concurrent users, messages must be as small as possible.

Client to Server (The Update):
Sent every time the local user moves their mouse (throttled).

JSON
{ "t": "m", "x": 0.523, "y": 0.124 }
t: Message type ("m" for move).

x/y: Normalized coordinates (0.0 to 1.0) rather than pixels. This ensures the cursor appears in the correct relative position regardless of the observer's screen resolution.

Server to Client (The Broadcast):
The server appends a unique id to the message and broadcasts it to all other connected sockets.

JSON
{ "t": "m", "id": "user_99", "x": 0.523, "y": 0.124 } 3. Server-Side Logic (Node.js / uWebSockets)
The server maintains a map of active connections and handles the broadcast logic.

JavaScript
// Pseudocode for the broadcast loop
const users = new Map();

ws.on('message', (message) => {
const data = JSON.parse(message);
if (data.t === 'm') {
// Broadcast to all other clients
server.publish('cursors', JSON.stringify({
t: 'm',
id: ws.id,
x: data.x,
y: data.y
}), false);
}
}); 4. Client-Side Implementation
The client must handle three critical tasks: Throttling, Normalization, and Interpolation.

A. Throttling & Normalization
Sending a packet for every single pixel moved will overwhelm the CPU and network.

Throttle: Send updates every 30ms–50ms.

Normalize: Divide clientX by window.innerWidth.

JavaScript
let lastSend = 0;
window.addEventListener('mousemove', (e) => {
const now = Date.now();
if (now - lastSend > 50) { // 50ms throttle
const x = e.clientX / window.innerWidth;
const y = e.clientY / window.innerHeight;
socket.send(JSON.stringify({ t: 'm', x, y }));
lastSend = now;
}
});
B. Rendering & Smoothing (CSS Transitions)
Instead of manually calculating frame-by-frame movement, use CSS for hardware-accelerated smoothing.

Cursor Element: Create a div for each new ID received.

Smoothing: Apply transition: transform 0.1s linear; to the cursor class.

Update: When a message arrives, update the transform: translate(x, y) property.

5. Performance Optimization Checklist
   To replicate the "snappiness" of dimden.dev, implement the following:

Binary Packs: Use MessagePack or raw ArrayBuffers instead of JSON strings to reduce payload size by ~60%.

Offscreen Cleanup: If a user hasn't moved for 60 seconds, remove their cursor from the DOM to save memory.

Canvas Fallback: If the user count exceeds 500, switch from individual div elements to a single <canvas> render loop using requestAnimationFrame.

6. Summary of Skills Required
   \textbf{Frontend:} JavaScript (ES6+), CSS Transforms, WebSocket API.
   \textbf{Backend:} Node.js, uWebSockets.js (for high throughput), or Go/Bun.
   \textbf{DevOps:} A server with high PPS (Packets Per Second) capability and low-latency routing.
