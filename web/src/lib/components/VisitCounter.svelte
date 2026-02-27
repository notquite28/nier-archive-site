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
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 0.5rem 1rem;
        font-family: helvetica, sans-serif;
        font-size: 0.75rem;
        color: #454138;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        letter-spacing: 0.03rem;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
    }

    .icon {
        color: #454138;
        font-size: 0.9rem;
    }

    .count {
        color: #454138;
        min-width: 48px;
        text-align: right;
    }

    .label {
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
    }

    .loading {
        color: #bab5a1;
    }
</style>
