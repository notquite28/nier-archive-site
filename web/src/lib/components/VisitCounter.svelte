<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    let visits = $state(0);
    let loaded = $state(false);

    onMount(async () => {
        if (!browser) return;

        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referrer: document.referrer })
            });

            const res = await fetch('/api/analytics');
            const data = await res.json();
            visits = data.visits || 0;
            loaded = true;
        } catch (e) {
            console.error('Analytics error:', e);
        }
    });

    function formatNumber(n: number): string {
        return n.toLocaleString();
    }
</script>

<div class="visit-counter">
    {#if loaded}
        <span class="icon">★</span>
        <span class="count">{formatNumber(visits)}</span>
        <span class="label">visit{visits !== 1 ? 's' : ''}</span>
    {:else}
        <span class="loading">...</span>
    {/if}
</div>

<style>
    .visit-counter {
        position: fixed;
        bottom: 16px;
        left: 16px;
        background: #1a1a2e;
        border: 3px solid #4a4a6a;
        padding: 8px 16px;
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
        image-rendering: pixelated;
        box-shadow: 4px 4px 0 #000;
    }

    .icon {
        color: #ffe66d;
        font-size: 12px;
    }

    .count {
        color: #00ff88;
        min-width: 48px;
        text-align: right;
    }

    .label {
        color: #8888aa;
    }

    .loading {
        color: #8888aa;
    }
</style>
