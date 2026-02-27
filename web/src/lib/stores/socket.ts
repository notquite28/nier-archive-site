import { writable } from 'svelte/store';
import { cursors, viewerCount } from './cursors';

export type WSStatus = 'connecting' | 'connected' | 'disconnected';

function createSocketStore() {
    let socket: WebSocket | null = null;
    let lastSend = 0;
    let lastX = 0;
    let lastY = 0;
    const THROTTLE_MS = 50;

    const { subscribe, set } = writable<WSStatus>('disconnected');

    function connect(url: string) {
        if (socket) {
            socket.close();
        }

        set('connecting');
        socket = new WebSocket(url);

        socket.onopen = () => {
            set('connected');
        };

        socket.onclose = () => {
            set('disconnected');
            cursors.clear();
        };

        socket.onerror = () => {
            set('disconnected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleMessage(data);
            } catch (e) {}
        };
    }

    function handleMessage(data: { t: string; [key: string]: unknown }) {
        switch (data.t) {
            case 'init':
                viewerCount.set(data.count as number);
                break;
            case 'sync':
                cursors.syncCursors(data.users as { id: number; x: number; y: number }[]);
                break;
            case 'join':
                cursors.addCursor({ id: data.id as number, x: data.x as number, y: data.y as number });
                viewerCount.update(c => c + 1);
                break;
            case 'm':
                cursors.updateCursor(data.id as number, data.x as number, data.y as number);
                break;
            case 'leave':
                cursors.removeCursor(data.id as number);
                viewerCount.update(c => Math.max(1, c - 1));
                break;
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
        if (socket) {
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
