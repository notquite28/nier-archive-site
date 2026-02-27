const { WebSocketServer } = require('ultimate-ws');

const PORT = process.env.WS_PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:4173', 'https://yourdomain.com'];

const wss = new WebSocketServer({ port: PORT });

const users = new Map();
let userIdCounter = 0;

function isOriginAllowed(origin) {
    if (!origin) return true;
    return ALLOWED_ORIGINS.some(allowed => 
        origin === allowed || origin.startsWith(allowed)
    );
}

wss.on('connection', (ws, req) => {
    const origin = req.headers.origin;
    
    if (!isOriginAllowed(origin)) {
        console.warn(`[WS] Rejected connection from unauthorized origin: ${origin}`);
        ws.close();
        return;
    }

    const id = ++userIdCounter;
    ws.id = id;
    const user = { ws, x: 0, y: 0, lastMove: Date.now(), visible: true };
    users.set(id, user);

    console.log(`[WS] User ${id} connected. Total: ${users.size}`);

    ws.send(JSON.stringify({ t: 'init', id, count: users.size }));

    const existingUsers = [];
    for (const [uid, u] of users) {
        if (uid !== id && u.visible) {
            existingUsers.push({ id: uid, x: u.x, y: u.y });
        }
    }
    if (existingUsers.length > 0) {
        ws.send(JSON.stringify({ t: 'sync', users: existingUsers }));
    }

    broadcast({ t: 'join', id, x: 0, y: 0 }, ws);

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            const user = users.get(id);
            if (!user) return;

            if (msg.t === 'm') {
                if (typeof msg.x !== 'number' || typeof msg.y !== 'number') {
                    console.warn(`[WS] Invalid move message from user ${id}`);
                    return;
                }
                const x = Math.max(0, Math.min(1, msg.x));
                const y = Math.max(0, Math.min(1, msg.y));
                user.x = x;
                user.y = y;
                user.lastMove = Date.now();
                if (user.visible) {
                    broadcast({ t: 'm', id, x, y }, ws);
                }
            } else if (msg.t === 'hide') {
                user.visible = false;
                broadcast({ t: 'leave', id }, ws);
            } else if (msg.t === 'show') {
                if (typeof msg.x === 'number' && typeof msg.y === 'number') {
                    user.x = Math.max(0, Math.min(1, msg.x));
                    user.y = Math.max(0, Math.min(1, msg.y));
                }
                user.visible = true;
                broadcast({ t: 'join', id, x: user.x, y: user.y }, ws);
            }
        } catch (e) {
            console.error(`[WS] Failed to parse message from user ${id}:`, e.message);
        }
    });

    ws.on('close', () => {
        users.delete(id);
        console.log(`[WS] User ${id} disconnected. Total: ${users.size}`);
        broadcast({ t: 'leave', id }, null);
    });

    ws.on('error', (err) => {
        console.error(`[WS] Error for user ${id}:`, err.message);
        users.delete(id);
        broadcast({ t: 'leave', id }, null);
    });
});

function broadcast(msg, exclude) {
    const data = JSON.stringify(msg);
    for (const user of users.values()) {
        if (user.ws !== exclude && user.ws.readyState === 1) {
            user.ws.send(data);
        }
    }
}

const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [id, user] of users) {
        if (now - user.lastMove > 120000) {
            console.log(`[WS] Cleaning up inactive user ${id}`);
            user.ws.close();
            users.delete(id);
            broadcast({ t: 'leave', id }, null);
        }
    }
}, 60000);

process.on('SIGTERM', () => {
    console.log('[WS] Shutting down...');
    clearInterval(cleanup);
    for (const user of users.values()) {
        user.ws.close();
    }
    wss.close();
});

console.log(`[WS] Server running on ws://localhost:${PORT}`);
console.log(`[WS] Allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
