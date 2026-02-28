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
</script>

{#if loaded}
    <div class="visit-counter" title="{visits} total visits">
        <span class="count">{visits}</span>
    </div>
{/if}

<style>
    .visit-counter {
        position: fixed;
        bottom: 16px;
        left: 16px;
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 0.4rem 0.6rem;
        font-family: helvetica, sans-serif;
        font-size: 0.75rem;
        color: #454138;
        letter-spacing: 0.03rem;
        box-shadow: 0.2rem 0.2rem 0 #bab5a1;
    }

    .count {
        font-weight: normal;
    }
</style>
