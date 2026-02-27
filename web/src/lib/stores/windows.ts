import DOMPurify from 'dompurify';
import { writable, derived } from 'svelte/store';

export interface WindowState {
    id: string;
    title: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    minimized: boolean;
    focused: boolean;
}

function createWindowManager() {
    let baseZIndex = 100;
    const { subscribe, set, update } = writable<WindowState[]>([]);

    function openWindow(window: Omit<WindowState, 'zIndex' | 'minimized' | 'focused'>) {
        update(windows => {
            const existing = windows.find(w => w.id === window.id);
            if (existing) {
                return windows.map(w => ({
                    ...w,
                    focused: w.id === window.id,
                    zIndex: w.id === window.id ? ++baseZIndex : w.zIndex
                }));
            }
            baseZIndex++;
            return [...windows.map(w => ({ ...w, focused: false })), {
                ...window,
                zIndex: baseZIndex,
                minimized: false,
                focused: true
            }];
        });
    }

    function closeWindow(id: string) {
        update(windows => windows.filter(w => w.id !== id));
    }

    function focusWindow(id: string) {
        update(windows => windows.map(w => ({
            ...w,
            focused: w.id === id,
            zIndex: w.id === id ? ++baseZIndex : w.zIndex
        })));
    }

    function moveWindow(id: string, x: number, y: number) {
        update(windows => windows.map(w => 
            w.id === id ? { ...w, x, y } : w
        ));
    }

    function resizeWindow(id: string, width: number, height: number) {
        update(windows => windows.map(w => 
            w.id === id ? { ...w, width, height } : w
        ));
    }

    function minimizeWindow(id: string) {
        update(windows => windows.map(w => 
            w.id === id ? { ...w, minimized: !w.minimized } : w
        ));
    }

    function closeAllWindows() {
        baseZIndex = 100;
        set([]);
    }

    return {
        subscribe,
        openWindow,
        closeWindow,
        focusWindow,
        moveWindow,
        resizeWindow,
        minimizeWindow,
        closeAllWindows
    };
}

export const windowManager = createWindowManager();

export const focusedWindow = derived(windowManager, $windows => 
    $windows.find(w => w.focused)
);

export const openWindowCount = derived(windowManager, $windows => $windows.length);

export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'hr', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
    });
}
