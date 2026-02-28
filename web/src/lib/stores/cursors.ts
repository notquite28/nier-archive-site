import { writable, derived } from 'svelte/store';

export interface RemoteCursor {
    id: number;
    x: number;
    y: number;
}

function createCursorStore() {
    const { subscribe, set, update } = writable<Map<number, RemoteCursor>>(new Map());

    return {
        subscribe,
        addCursor: (cursor: RemoteCursor) => update(map => {
            map.set(cursor.id, cursor);
            return map;
        }),
        updateCursor: (id: number, x: number, y: number) => update(map => {
            if (map.has(id)) {
                map.set(id, { id, x, y });
                return map;
            }
            return map;
        }),
        removeCursor: (id: number) => update(map => {
            if (map.has(id)) {
                map.delete(id);
                return map;
            }
            return map;
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
