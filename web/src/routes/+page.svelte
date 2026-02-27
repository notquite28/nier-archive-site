<script lang="ts">
    import { browser } from '$app/environment';
    import { socketStore } from '$lib/stores/socket';
    import CursorOverlay from '$lib/components/CursorOverlay.svelte';
    import ViewerCount from '$lib/components/ViewerCount.svelte';
    import VisitCounter from '$lib/components/VisitCounter.svelte';
    import MusicPlayer from '$lib/components/MusicPlayer.svelte';

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
    <title>Pixel Room</title>
</svelte:head>

<div class="page">
    <ViewerCount />
    <MusicPlayer />
    <CursorOverlay />
    <VisitCounter />
    
    <main class="content">
        <h1 class="title">Welcome to Pixel Room</h1>
        <p class="subtitle">Move your cursor to say hello to other visitors!</p>
        
        <div class="pixel-box">
            <p>Your cursor is being shared with everyone on this page.</p>
            <p>Look for other cursors moving around!</p>
        </div>
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
        text-align: center;
    }

    .title {
        font-size: 24px;
        color: #00ff88;
        text-shadow: 4px 4px 0 #004422;
        margin-bottom: 16px;
        animation: flicker 3s infinite;
    }

    .subtitle {
        font-size: 10px;
        color: #8888aa;
        margin-bottom: 40px;
    }

    .pixel-box {
        background: #1a1a2e;
        border: 4px solid #4a4a6a;
        padding: 24px;
        max-width: 400px;
        box-shadow: 8px 8px 0 #000;
    }

    .pixel-box p {
        font-size: 10px;
        color: #cccccc;
        line-height: 2;
        margin: 8px 0;
    }

    @keyframes flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.95; }
        75% { opacity: 0.98; }
    }
</style>
