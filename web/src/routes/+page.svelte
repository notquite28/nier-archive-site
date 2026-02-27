<script lang="ts">
    import { browser } from '$app/environment';
    import { socketStore } from '$lib/stores/socket';
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
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
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
    :global(body) {
        overflow: hidden;
    }

    .page {
        min-height: 100vh;
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
