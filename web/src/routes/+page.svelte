<script lang="ts">
    import { browser } from '$app/environment';
    import { socketStore } from '$lib/stores/socket';
    import { viewerCount } from '$lib/stores/cursors';
    import CursorOverlay from '$lib/components/CursorOverlay.svelte';
    import ViewerCount from '$lib/components/ViewerCount.svelte';
    import VisitCounter from '$lib/components/VisitCounter.svelte';
    import MusicPlayer from '$lib/components/MusicPlayer.svelte';
    import EasterEggs from '$lib/components/secrets/EasterEggs.svelte';
    import Whoami from '$lib/components/sections/Whoami.svelte';
    import Projects from '$lib/components/sections/Projects.svelte';
    import Transmissions from '$lib/components/sections/Transmissions.svelte';
    import Network from '$lib/components/sections/Network.svelte';

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
        
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8787/ws';
        socketStore.connect(wsUrl);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            socketStore.disconnect();
        };
    });

    interface Section {
        id: string;
        title: string;
    }

    const sections: Section[] = [
        { id: 'whoami', title: 'Unit Profile' },
        { id: 'projects', title: 'Data Fragments' },
        { id: 'transmissions', title: 'Transmissions' },
        { id: 'network', title: 'Network' }
    ];

    let openSection = $state<string | null>('whoami');

    function toggleSection(id: string) {
        if (openSection === id) {
            openSection = null;
        } else {
            openSection = id;
        }
    }
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <title>quiet</title>
</svelte:head>

<div class="page">
    <ViewerCount />
    <MusicPlayer />
    <CursorOverlay />
    <VisitCounter />
    <EasterEggs />
    
    <main class="content">
        <header class="site-header">
            <div class="logo-area">
                <div class="logo-placeholder">q</div>
            </div>
            <h1 class="site-title">quiet</h1>
            <p class="site-subtitle">neet developer/artist/musician</p>
        </header>

        <div class="sections-container">
            {#each sections as section (section.id)}
                <div class="section" class:open={openSection === section.id}>
                    <button 
                        class="section-header"
                        onclick={() => toggleSection(section.id)}
                        aria-expanded={openSection === section.id}
                    >
                        <span class="section-title">{section.title}</span>
                        <span class="section-toggle">{openSection === section.id ? '−' : '+'}</span>
                    </button>
                    
                    {#if openSection === section.id}
                        <div class="section-content">
                            {#if section.id === 'whoami'}
                                <Whoami />
                            {:else if section.id === 'projects'}
                                <Projects />
                            {:else if section.id === 'transmissions'}
                                <Transmissions />
                            {:else if section.id === 'network'}
                                <Network />
                            {/if}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

        <footer class="site-footer">
            <p>The cursors you see are other units exploring alongside you.</p>
        </footer>
    </main>
</div>

<style>
    :global(body) {
        overflow: auto;
    }

    .page {
        min-height: 100vh;
    }

    .content {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
    }

    .site-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 0.1rem solid #bab5a1;
    }

    .logo-area {
        margin-bottom: 1rem;
    }

    .logo-placeholder {
        width: 80px;
        height: 80px;
        margin: 0 auto;
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        color: #bab5a1;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
    }

    .site-title {
        font-size: 2rem;
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.5rem;
        font-weight: normal;
        margin-bottom: 0.5rem;
        text-shadow: 0.3rem 0.3rem 0 #bab5a1;
    }

    .site-subtitle {
        font-size: 0.85rem;
        color: #454138;
        letter-spacing: 0.1rem;
    }

    .sections-container {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .section {
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        box-shadow: 0.2rem 0.2rem 0 #bab5a1;
        transition: box-shadow 0.2s;
    }

    .section.open {
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
    }

    .section-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: rgba(100, 98, 86, 0.8);
        border: none;
        text-align: left;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.9rem;
        color: #d3cebb;
        text-transform: uppercase;
        letter-spacing: 0.15rem;
        font-weight: normal;
    }

    .section-header:hover {
        background: rgba(100, 98, 86, 0.9);
    }

    .section-title {
        font-weight: normal;
    }

    .section-toggle {
        font-size: 1.25rem;
        font-weight: lighter;
        color: #bab5a1;
    }

    .section-content {
        padding: 1.25rem;
        border-top: 0.1rem solid #bab5a1;
        animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .site-footer {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 0.1rem solid #bab5a1;
        text-align: center;
    }

    .site-footer p {
        font-size: 0.8rem;
        color: #bab5a1;
    }

    @media (max-width: 600px) {
        .content {
            padding: 1rem 0.75rem;
        }

        .site-title {
            font-size: 1.5rem;
            letter-spacing: 0.3rem;
        }

        .site-subtitle {
            font-size: 0.75rem;
        }

        .logo-placeholder {
            width: 60px;
            height: 60px;
            font-size: 2rem;
        }

        .section-header {
            padding: 0.6rem 0.75rem;
            font-size: 0.8rem;
            letter-spacing: 0.1rem;
        }

        .section-content {
            padding: 1rem;
        }
    }
</style>
