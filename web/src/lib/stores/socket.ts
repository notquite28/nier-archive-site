import { writable } from 'svelte/store';
import { cursors, viewerCount } from './cursors';

export type WSStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

function createSocketStore() {
    let socket: WebSocket | null = null;
    let lastSend = 0;
    let lastX = 0;
    let lastY = 0;
    let reconnectAttempts = 0;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let currentUrl = '';
    const THROTTLE_MS = 50;
    const MAX_RECONNECT_DELAY = 30000;
    const INITIAL_RECONNECT_DELAY = 1000;

    const { subscribe, set, update } = writable<WSStatus>('disconnected');

    function clearReconnectTimeout() {
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }
    }

    function connect(url: string) {
        currentUrl = url;
        clearReconnectTimeout();
        
        if (socket) {
            socket.onopen = null;
            socket.onclose = null;
            socket.onerror = null;
            socket.onmessage = null;
            socket.close();
        }

        set('connecting');
        socket = new WebSocket(url);

        socket.onopen = () => {
            reconnectAttempts = 0;
            set('connected');
        };

        socket.onclose = (event) => {
            console.log('[WS] Connection closed:', event.code, event.reason);
            socket = null;
            cursors.clear();
            
            if (reconnectAttempts > 0) {
                set('reconnecting');
            } else {
                set('disconnected');
            }
            
            attemptReconnect();
        };

        socket.onerror = (error) => {
            console.error('[WS] Connection error:', error);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleMessage(data);
            } catch (e) {
                console.error('[WS] Failed to parse message:', e);
            }
        };
    }

    function attemptReconnect() {
        if (!currentUrl) return;
        
        clearReconnectTimeout();
        
        const delay = Math.min(
            INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
            MAX_RECONNECT_DELAY
        );
        
        reconnectAttempts++;
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
        
        reconnectTimeout = setTimeout(() => {
            connect(currentUrl);
        }, delay);
    }

    function validateNumber(value: unknown, min: number, max: number): number | null {
        if (typeof value !== 'number' || !isFinite(value)) return null;
        return Math.max(min, Math.min(max, value));
    }

    function handleMessage(data: { t: string; [key: string]: unknown }) {
        switch (data.t) {
            case 'init': {
                const count = validateNumber(data.count, 1, 10000);
                if (count !== null) {
                    viewerCount.set(count);
                }
                break;
            }
            case 'sync': {
                if (!Array.isArray(data.users)) {
                    console.warn('[WS] Invalid sync message: users is not an array');
                    return;
                }
                const validUsers = data.users
                    .filter((u): u is { id: number; x: number; y: number } => 
                        typeof u === 'object' && u !== null &&
                        typeof u.id === 'number' &&
                        validateNumber(u.x, 0, 1) !== null &&
                        validateNumber(u.y, 0, 1) !== null
                    )
                    .map(u => ({
                        id: u.id,
                        x: validateNumber(u.x, 0, 1)!,
                        y: validateNumber(u.y, 0, 1)!
                    }));
                cursors.syncCursors(validUsers);
                break;
            }
            case 'join': {
                const id = validateNumber(data.id, 0, Number.MAX_SAFE_INTEGER);
                const x = validateNumber(data.x, 0, 1);
                const y = validateNumber(data.y, 0, 1);
                if (id !== null && x !== null && y !== null) {
                    cursors.addCursor({ id, x, y });
                    viewerCount.update(c => c + 1);
                }
                break;
            }
            case 'm': {
                const id = validateNumber(data.id, 0, Number.MAX_SAFE_INTEGER);
                const x = validateNumber(data.x, 0, 1);
                const y = validateNumber(data.y, 0, 1);
                if (id !== null && x !== null && y !== null) {
                    cursors.updateCursor(id, x, y);
                }
                break;
            }
            case 'leave': {
                const id = validateNumber(data.id, 0, Number.MAX_SAFE_INTEGER);
                if (id !== null) {
                    cursors.removeCursor(id);
                    viewerCount.update(c => Math.max(1, c - 1));
                }
                break;
            }
            default:
                console.warn('[WS] Unknown message type:', data.t);
        }
    }

    function sendMove(x: number, y: number) {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        lastX = x;
        lastY = y;

        const now = Date.now();
        if (now - lastSend < THROTTLE_MS) return;
        lastSend = now;

        socket.send(JSON.stringify({ t: 'm', x, y }));
    }

    function sendHide() {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ t: 'hide' }));
    }

    function sendShow() {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({ t: 'show', x: lastX, y: lastY }));
    }

    function disconnect() {
        clearReconnectTimeout();
        currentUrl = '';
        reconnectAttempts = 0;
        
        if (socket) {
            socket.onopen = null;
            socket.onclose = null;
            socket.onerror = null;
            socket.onmessage = null;
            socket.close();
            socket = null;
        }
        set('disconnected');
    }

    return {
        subscribe,
        connect,
        sendMove,
        sendHide,
        sendShow,
        disconnect
    };
}

export const socketStore = createSocketStore();
