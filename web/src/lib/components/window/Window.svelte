<script lang="ts">
    import { browser } from '$app/environment';
    import type { WindowState } from '$lib/stores/windows';
    import { windowManager, sanitizeHtml } from '$lib/stores/windows';
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
        isDragging = false;
        isResizing = false;
    }

    function handleClose() {
        windowManager.closeWindow(win.id);
    }
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
                {@html sanitizeHtml(win.content)}
            {/if}
        </div>
        
        <div 
            class="resize-handle" 
            onmousedown={handleResizeMouseDown} 
            role="button"
            tabindex="-1"
            aria-label="Resize window"
        ></div>
    </div>
{/if}

<style>
    .window {
        position: fixed;
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
        display: flex;
        flex-direction: column;
        font-family: helvetica, sans-serif;
        letter-spacing: 0.03rem;
        font-weight: lighter;
        color: #454138;
    }

    .window.focused {
        box-shadow: 0.4rem 0.4rem 0 #bab5a1;
    }

    .window-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 1rem;
        background: #454138;
        border-bottom: 0.1rem solid #bab5a1;
        cursor: move;
        user-select: none;
    }

    .window-title {
        font-size: 0.9rem;
        color: #bab5a1;
        text-transform: uppercase;
        letter-spacing: 0.5rem;
        font-weight: normal;
    }

    .window-controls {
        display: flex;
        gap: 8px;
    }

    .control-btn {
        width: 20px;
        height: 20px;
        background: #bab5a1;
        border: none;
        color: #454138;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: all 0.2s;
    }

    .control-btn:hover {
        background: #454138;
        color: #dcd8c0;
    }

    .window-content {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        font-size: 0.85rem;
        line-height: 1.8;
    }

    .window-content::-webkit-scrollbar {
        width: 8px;
    }

    .window-content::-webkit-scrollbar-track {
        background: #d1cdb7;
    }

    .window-content::-webkit-scrollbar-thumb {
        background: #bab5a1;
        border: 1px solid #bab5a1;
    }

    .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 16px;
        height: 16px;
        cursor: se-resize;
        background: linear-gradient(135deg, transparent 50%, #bab5a1 50%);
    }
</style>
