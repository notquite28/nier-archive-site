import { writable, derived } from 'svelte/store';

export interface RemoteCursor {
    id: number;
    x: number;
    y: number;
}

export interface ViewerCount {
    count: number;
}

function createCursorStore() {
    const { subscribe, set, update } = writable<Map<number, RemoteCursor>>(new Map());

    return {
        subscribe,
        addCursor: (cursor: RemoteCursor) => update(map => {
            const newMap = new Map(map);
            newMap.set(cursor.id, cursor);
            return newMap;
        }),
        updateCursor: (id: number, x: number, y: number) => update(map => {
            const newMap = new Map(map);
            const existing = newMap.get(id);
            if (existing) {
                newMap.set(id, { ...existing, x, y });
            }
            return newMap;
        }),
        removeCursor: (id: number) => update(map => {
            const newMap = new Map(map);
            newMap.delete(id);
            return newMap;
        }),
        syncCursors: (cursors: RemoteCursor[]) => set(new Map(cursors.map(c => [c.id, c]))),
        clear: () => set(new Map())
    };
}

export const cursors = createCursorStore();

export const cursorList = derived(cursors, $cursors => Array.from($cursors.values()));

function createViewerStore() {
    const { subscribe, set, update } = writable<number>(1);

    return {
        subscribe,
        set,
        update
    };
}

export const viewerCount = createViewerStore();
