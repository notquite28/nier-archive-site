const { WebSocketServer } = require('ultimate-ws');

const wss = new WebSocketServer({ port: 3001 });

const users = new Map();
let userIdCounter = 0;

wss.on('connection', (ws) => {
    const id = ++userIdCounter;
    ws.id = id;
    const user = { ws, x: 0, y: 0, lastMove: Date.now(), visible: true };
    users.set(id, user);

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
                user.x = msg.x;
                user.y = msg.y;
                user.lastMove = Date.now();
                if (user.visible) {
                    broadcast({ t: 'm', id, x: msg.x, y: msg.y }, ws);
                }
            } else if (msg.t === 'hide') {
                user.visible = false;
                broadcast({ t: 'leave', id }, ws);
            } else if (msg.t === 'show') {
                user.visible = true;
                user.x = msg.x;
                user.y = msg.y;
                broadcast({ t: 'join', id, x: msg.x, y: msg.y }, ws);
            }
        } catch (e) {}
    });

    ws.on('close', () => {
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
            user.ws.close();
            users.delete(id);
            broadcast({ t: 'leave', id }, null);
        }
    }
}, 60000);

console.log('WebSocket server running on ws://localhost:3001');
