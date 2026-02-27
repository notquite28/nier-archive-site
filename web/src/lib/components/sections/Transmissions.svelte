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
        color: #CEC5B4;
    }

    h2 {
        font-size: 12px;
        color: #00ff88;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 2px solid #4a4a6a;
    }

    .intro {
        font-size: 9px;
        color: #888;
        margin-bottom: 16px;
    }

    .transmission-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .transmission-item {
        display: block;
        padding: 12px;
        background: #0f0f1a;
        border: 2px solid #3a3a5a;
        text-decoration: none;
        transition: border-color 0.2s;
    }

    .transmission-item:hover {
        border-color: #ffe66d;
    }

    .tx-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
    }

    .tx-id {
        font-size: 8px;
        color: #4a4a6a;
    }

    .tx-status {
        font-size: 7px;
        color: #00ff88;
        background: rgba(0, 255, 136, 0.1);
        padding: 2px 6px;
    }

    .tx-title {
        font-size: 10px;
        color: #CEC5B4;
        margin-bottom: 4px;
    }

    .tx-date {
        font-size: 8px;
        color: #666;
    }

    .empty-state {
        margin-top: 20px;
        padding: 16px;
        border: 2px dashed #3a3a5a;
        text-align: center;
    }

    .empty-state p {
        font-size: 9px;
        color: #666;
    }
</style>
