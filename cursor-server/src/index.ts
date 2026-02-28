export interface Env {
	CURSOR_ROOM: DurableObjectNamespace;
	ALLOWED_ORIGINS: string;
}

interface User {
	id: number;
	x: number;
	y: number;
	visible: boolean;
	lastMove: number;
}

interface WebSocketWithData extends WebSocket {
	userData?: User;
}

export class CursorRoom implements DurableObject {
	private state: DurableObjectState;
	private users: Map<number, WebSocketWithData> = new Map();
	private userIdCounter = 0;

	constructor(state: DurableObjectState) {
		this.state = state;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		
		if (url.pathname === '/ws' && request.headers.get('Upgrade') === 'websocket') {
			return this.handleWebSocket(request);
		}
		
		return new Response('Not Found', { status: 404 });
	}

	private async handleWebSocket(request: Request): Promise<Response> {
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair) as [WebSocket, WebSocketWithData];

		this.state.acceptWebSocket(server);
		
		const id = ++this.userIdCounter;
		server.userData = {
			id,
			x: 0.5,
			y: 0.5,
			visible: true,
			lastMove: Date.now()
		};
		
		this.users.set(id, server);
		
		server.send(JSON.stringify({ t: 'init', id, count: this.users.size }));
		
		const existingUsers: { id: number; x: number; y: number }[] = [];
		for (const [uid, ws] of this.users) {
			if (uid !== id && ws.userData?.visible) {
				existingUsers.push({ id: uid, x: ws.userData.x, y: ws.userData.y });
			}
		}
		if (existingUsers.length > 0) {
			server.send(JSON.stringify({ t: 'sync', users: existingUsers }));
		}
		
		this.broadcast({ t: 'join', id, x: 0.5, y: 0.5 }, id);

		return new Response(null, { status: 101, webSocket: client });
	}

	async webSocketMessage(ws: WebSocketWithData, message: string | ArrayBuffer): Promise<void> {
		if (typeof message !== 'string') return;
		
		const user = ws.userData;
		if (!user) return;

		try {
			const msg = JSON.parse(message);
			
			if (msg.t === 'm') {
				if (typeof msg.x !== 'number' || typeof msg.y !== 'number') return;
				
				user.x = Math.max(0, Math.min(1, msg.x));
				user.y = Math.max(0, Math.min(1, msg.y));
				user.lastMove = Date.now();
				
				if (user.visible) {
					this.broadcast({ t: 'm', id: user.id, x: user.x, y: user.y }, user.id);
				}
			} else if (msg.t === 'hide') {
				user.visible = false;
				this.broadcast({ t: 'leave', id: user.id }, user.id);
			} else if (msg.t === 'show') {
				if (typeof msg.x === 'number' && typeof msg.y === 'number') {
					user.x = Math.max(0, Math.min(1, msg.x));
					user.y = Math.max(0, Math.min(1, msg.y));
				}
				user.visible = true;
				this.broadcast({ t: 'join', id: user.id, x: user.x, y: user.y }, user.id);
			} else if (msg.t === 'ping') {
				ws.send(JSON.stringify({ t: 'pong' }));
			}
		} catch {
			console.error('Failed to parse WebSocket message');
		}
	}

	async webSocketClose(ws: WebSocketWithData): Promise<void> {
		const user = ws.userData;
		if (user) {
			this.users.delete(user.id);
			this.broadcast({ t: 'leave', id: user.id }, null);
		}
	}

	async webSocketError(ws: WebSocketWithData): Promise<void> {
		const user = ws.userData;
		if (user) {
			this.users.delete(user.id);
			this.broadcast({ t: 'leave', id: user.id }, null);
		}
	}

	private broadcast(msg: object, excludeId: number | null): void {
		const data = JSON.stringify(msg);
		for (const [id, ws] of this.users) {
			if (id !== excludeId && ws.readyState === WebSocket.OPEN) {
				ws.send(data);
			}
		}
	}
}

function isOriginAllowed(origin: string | null, allowedOrigins: string): boolean {
	if (!origin) return false;
	const allowed = allowedOrigins.split(',').map(s => s.trim());
	return allowed.some(a => {
		if (origin === a || origin.startsWith(a)) return true;
		try {
			const originHost = new URL(origin).hostname;
			const allowedHost = new URL(a).hostname;
			return originHost === allowedHost || originHost.endsWith('.' + allowedHost);
		} catch {
			return false;
		}
	});
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		
		if (url.pathname === '/ws' && request.headers.get('Upgrade') === 'websocket') {
			const origin = request.headers.get('Origin');
			
			if (!isOriginAllowed(origin, env.ALLOWED_ORIGINS)) {
				return new Response('Forbidden', { status: 403 });
			}
			
			const id = env.CURSOR_ROOM.idFromName('global');
			const stub = env.CURSOR_ROOM.get(id);
			return stub.fetch(request);
		}
		
		if (url.pathname === '/health') {
			return new Response('OK', { status: 200 });
		}
		
		return new Response('Not Found', { status: 404 });
	}
};
