<script lang="ts">
    import { browser } from '$app/environment';
    import { socketStore } from '$lib/stores/socket';
    import { preloadSounds } from '$lib/stores/sounds';
    import { viewerCount } from '$lib/stores/cursors';
    import CursorOverlay from '$lib/components/CursorOverlay.svelte';
    import ViewerCount from '$lib/components/ViewerCount.svelte';
    import VisitCounter from '$lib/components/VisitCounter.svelte';
    import MusicPlayer from '$lib/components/MusicPlayer.svelte';
    import Terminal from '$lib/components/terminal/Terminal.svelte';
    import WindowManager from '$lib/components/window/WindowManager.svelte';
    import EasterEggs from '$lib/components/secrets/EasterEggs.svelte';

    function handleMouseMove(e: MouseEvent) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        socketStore.sendMove(x, y);
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            socketStore.sendHide();
        } else {
            socketStore.sendShow();
        }
    }

    $effect(() => {
        if (!browser) return;
        
        preloadSounds();
        
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
        socketStore.connect(wsUrl);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            socketStore.disconnect();
        };
    });
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
    <title>The Archive</title>
</svelte:head>

<div class="page">
    <ViewerCount />
    <MusicPlayer />
    <CursorOverlay />
    <VisitCounter />
    <WindowManager />
    <EasterEggs />
    
    <main class="content">
        <Terminal />
    </main>
</div>

<style>
    :global(html), :global(body), :global(*), :global(button), :global(input), :global(a), :global([role="button"]) {
        cursor: url('/assets/cursor.svg') 0 0, auto !important;
    }
    
    :global(body) {
        margin: 0;
        padding: 0;
        background: #0f0f23;
        font-family: 'Press Start 2P', monospace;
        overflow: hidden;
    }

    .page {
        min-height: 100vh;
        background: 
            repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 136, 0.03) 2px,
                rgba(0, 255, 136, 0.03) 4px
            ),
            repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 136, 0.03) 2px,
                rgba(0, 255, 136, 0.03) 4px
            ),
            linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 100%);
        image-rendering: pixelated;
    }

    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 40px;
    }
</style>
