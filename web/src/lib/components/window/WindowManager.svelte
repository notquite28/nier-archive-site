<script lang="ts">
    import { windowManager } from '$lib/stores/windows';
    import Window from './Window.svelte';
    import Whoami from '../sections/Whoami.svelte';
    import Projects from '../sections/Projects.svelte';
    import Transmissions from '../sections/Transmissions.svelte';
    import Network from '../sections/Network.svelte';

    const sectionComponents: Record<string, typeof Whoami> = {
        whoami: Whoami,
        projects: Projects,
        transmissions: Transmissions,
        network: Network
    };

    $: windows = $windowManager;
</script>

<div class="window-container">
    {#each windows as win (win.id)}
        <Window window={win}>
            {#if sectionComponents[win.id]}
                <svelte:component this={sectionComponents[win.id]} />
            {:else}
                {win.content}
            {/if}
        </Window>
    {/each}
</div>

<style>
    .window-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100;
    }

    .window-container :global(.window) {
        pointer-events: auto;
    }
</style>
