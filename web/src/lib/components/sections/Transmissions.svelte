<script lang="ts">
    import { onMount } from 'svelte';
    import type { Transmission } from '$lib/data/transmissions';
    
    let transmissions = $state<{slug: string, title: string, date: string}[]>([]);
    
    onMount(async () => {
        try {
            const res = await fetch('/api/transmissions');
            if (res.ok) {
                transmissions = await res.json();
            }
        } catch (e) {
            transmissions = [
                { slug: '001-archive-initialized', title: 'Archive Initialized', date: '2024.02.27' },
                { slug: '002-immersive-spaces', title: 'Building Immersive Spaces', date: '2024.02.20' },
                { slug: '003-nier-inspiration', title: 'The NieR Inspiration', date: '2024.02.15' }
            ];
        }
    });
    
    function formatSlug(slug: string): string {
        return slug.split('-')[0].toUpperCase();
    }
</script>

<div class="section transmissions">
    <h2>// TRANSMISSIONS</h2>
    <p class="intro">Log entries received from the network.</p>
    
    <div class="transmission-list">
        {#each transmissions as tx (tx.slug)}
            <a href="/transmissions/{tx.slug}" class="transmission-item">
                <div class="tx-header">
                    <span class="tx-id">TX-{formatSlug(tx.slug)}</span>
                    <span class="tx-status">RECEIVED</span>
                </div>
                <h3 class="tx-title">{tx.title}</h3>
                <span class="tx-date">{tx.date}</span>
            </a>
        {/each}
    </div>
    
    <div class="empty-state">
        <p>More transmissions incoming...</p>
    </div>
</div>

<style>
    .section {
        color: #454138;
    }

    h2 {
        font-size: 1rem;
        color: #454138;
        margin-bottom: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 0.1rem solid #bab5a1;
        text-transform: uppercase;
        letter-spacing: 0.3rem;
        font-weight: normal;
    }

    .intro {
        font-size: 0.8rem;
        color: #454138;
        margin-bottom: 1rem;
    }

    .transmission-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .transmission-item {
        display: block;
        padding: 0.75rem;
        background: #d1cdb7;
        border: 0.1rem solid #bab5a1;
        text-decoration: none;
        transition: all 0.2s;
        color: #454138;
    }

    .transmission-item:hover {
        box-shadow: 0.2em 0.2em 0.1em 0 #bab5a1;
    }

    .tx-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.4rem;
    }

    .tx-id {
        font-size: 0.7rem;
        color: #bab5a1;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
    }

    .tx-status {
        font-size: 0.6rem;
        color: #454138;
        background: #bab5a1;
        padding: 0.15rem 0.4rem;
    }

    .tx-title {
        font-size: 0.85rem;
        color: #454138;
        margin-bottom: 0.25rem;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
        font-weight: normal;
    }

    .tx-date {
        font-size: 0.7rem;
        color: #bab5a1;
    }

    .empty-state {
        margin-top: 1.5rem;
        padding: 1rem;
        border: 0.1rem dashed #bab5a1;
        text-align: center;
    }

    .empty-state p {
        font-size: 0.8rem;
        color: #bab5a1;
    }
</style>
