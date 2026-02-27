<script lang="ts">
    import { browser } from '$app/environment';
    import type { WindowState } from '$lib/stores/windows';
    import { windowManager } from '$lib/stores/windows';
    import { playSound } from '$lib/stores/sounds';
    import type { Snippet } from 'svelte';

    interface Props {
        window: WindowState;
        children?: Snippet;
    }

    let { window: win, children }: Props = $props();

    let isDragging = $state(false);
    let isResizing = $state(false);
    let dragOffset = { x: 0, y: 0 };

    function handleMouseDown(e: MouseEvent) {
        if ((e.target as HTMLElement).closest('.window-controls')) return;
        windowManager.focusWindow(win.id);
        
        if ((e.target as HTMLElement).closest('.window-header')) {
            isDragging = true;
            dragOffset = {
                x: e.clientX - win.x,
                y: e.clientY - win.y
            };
            playSound('click');
        }
    }

    function handleResizeMouseDown(e: MouseEvent) {
        e.stopPropagation();
        isResizing = true;
        windowManager.focusWindow(win.id);
    }

    function handleMouseMove(e: MouseEvent) {
        if (isDragging && browser) {
            const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100));
            const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 50));
            windowManager.moveWindow(win.id, newX, newY);
        }
        if (isResizing && browser) {
            const newWidth = Math.max(300, e.clientX - win.x);
            const newHeight = Math.max(200, e.clientY - win.y);
            windowManager.resizeWindow(win.id, newWidth, newHeight);
        }
    }

    function handleMouseUp() {
        if (isDragging || isResizing) {
            playSound('release');
        }
        isDragging = false;
        isResizing = false;
    }

    function handleClose() {
        playSound('close');
        windowManager.closeWindow(win.id);
    }

    function handleMinimize() {
        playSound('click');
        windowManager.minimizeWindow(win.id);
    }

    $effect(() => {
        if (browser) {
            if (isDragging || isResizing) {
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
            }
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    });
</script>

<svelte:window 
    onmousemove={handleMouseMove}
    onmouseup={handleMouseUp}
/>

{#if !win.minimized}
    <div 
        class="window {win.focused ? 'focused' : ''}"
        style="left: {win.x}px; top: {win.y}px; width: {win.width}px; height: {win.height}px; z-index: {win.zIndex};"
        onmousedown={handleMouseDown}
        role="dialog"
        aria-label={win.title}
        tabindex="-1"
    >
        <header class="window-header">
            <span class="window-title">{win.title}</span>
            <div class="window-controls">
                <button 
                    class="control-btn minimize" 
                    onclick={handleMinimize}
                    aria-label="Minimize"
                >_</button>
                <button 
                    class="control-btn close" 
                    onclick={handleClose}
                    aria-label="Close"
                >×</button>
            </div>
        </header>
        
        <div class="window-content">
            {#if children}
                {@render children()}
            {:else}
                {win.content}
            {/if}
        </div>
        
        <div class="resize-handle" onmousedown={handleResizeMouseDown} role="separator" aria-label="Resize window"></div>
    </div>
{/if}

<style>
    .window {
        position: fixed;
        background: #1a1a2e;
        border: 3px solid #4a4a6a;
        box-shadow: 8px 8px 0 #000;
        display: flex;
        flex-direction: column;
        font-family: 'Press Start 2P', monospace;
        image-rendering: pixelated;
    }

    .window.focused {
        border-color: #6a6a8a;
        box-shadow: 8px 8px 0 #000, 0 0 20px rgba(0, 255, 136, 0.1);
    }

    .window-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #0f0f1a;
        border-bottom: 2px solid #4a4a6a;
        cursor: move;
        user-select: none;
    }

    .window-title {
        font-size: 10px;
        color: #00ff88;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .window-controls {
        display: flex;
        gap: 8px;
    }

    .control-btn {
        width: 20px;
        height: 20px;
        background: #2a2a4a;
        border: 2px solid #4a4a6a;
        color: #888;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .control-btn:hover {
        background: #3a3a5a;
        color: #fff;
    }

    .control-btn.close:hover {
        background: #ff6b6b;
        border-color: #ff6b6b;
    }

    .window-content {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        color: #CEC5B4;
        font-size: 10px;
        line-height: 1.8;
    }

    .window-content::-webkit-scrollbar {
        width: 8px;
    }

    .window-content::-webkit-scrollbar-track {
        background: #0f0f1a;
    }

    .window-content::-webkit-scrollbar-thumb {
        background: #4a4a6a;
        border: 1px solid #3a3a5a;
    }

    .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16px;
        height: 16px;
        cursor: se-resize;
        background: linear-gradient(135deg, transparent 50%, #4a4a6a 50%);
    }
</style>
