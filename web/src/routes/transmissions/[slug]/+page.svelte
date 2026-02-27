<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';

    let transmission = $state<{title: string, date: string, html: string} | null>(null);
    let loading = $state(true);

    let slug = $derived($page.params.slug);

    onMount(async () => {
        if (!browser) return;
        
        try {
            const res = await fetch(`/api/transmissions/${slug}`);
            if (res.ok) {
                transmission = await res.json();
            }
        } catch (e) {
            console.error('Failed to load transmission');
        }
        loading = false;
    });
</script>

{#if loading}
    <div class="loading">Loading transmission...</div>
{:else if transmission}
    <div class="transmission">
        <header class="tx-header">
            <span class="tx-label">TRANSMISSION</span>
            <span class="tx-date">{transmission.date}</span>
        </header>
        
        <h1 class="tx-title">{transmission.title}</h1>
        
        <article class="tx-content">
            {@html transmission.html}
        </article>
        
        <footer class="tx-footer">
            <button class="back-btn" onclick={() => goto('/')}>
                ← Return to Archive
            </button>
        </footer>
    </div>
{:else}
    <div class="error">
        <p>Transmission not found.</p>
        <button class="back-btn" onclick={() => goto('/')}>Return to Archive</button>
    </div>
{/if}

<style>
    .loading, .error {
        text-align: center;
        padding: 40px;
        color: #888;
    }

    .transmission {
        max-width: 100%;
    }

    .tx-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #4a4a6a;
    }

    .tx-label {
        font-size: 8px;
        color: #ffe66d;
        letter-spacing: 2px;
    }

    .tx-date {
        font-size: 8px;
        color: #666;
    }

    .tx-title {
        font-size: 14px;
        color: #00ff88;
        margin-bottom: 20px;
    }

    .tx-content {
        color: #CEC5B4;
        font-size: 10px;
        line-height: 1.8;
    }

    .tx-content :global(h2) {
        font-size: 12px;
        color: #ffe66d;
        margin: 20px 0 12px;
    }

    .tx-content :global(h3) {
        font-size: 11px;
        color: #CEC5B4;
        margin: 16px 0 10px;
    }

    .tx-content :global(p) {
        margin-bottom: 12px;
    }

    .tx-content :global(ul), .tx-content :global(ol) {
        margin: 12px 0;
        padding-left: 20px;
    }

    .tx-content :global(li) {
        margin-bottom: 6px;
    }

    .tx-content :global(code) {
        background: #0f0f1a;
        padding: 2px 6px;
        color: #00ff88;
        font-size: 9px;
    }

    .tx-content :global(pre) {
        background: #0f0f1a;
        padding: 12px;
        overflow-x: auto;
        margin: 12px 0;
        border: 1px solid #3a3a5a;
    }

    .tx-content :global(pre code) {
        background: none;
        padding: 0;
    }

    .tx-content :global(blockquote) {
        border-left: 3px solid #ffe66d;
        padding-left: 12px;
        margin: 12px 0;
        color: #888;
        font-style: italic;
    }

    .tx-content :global(hr) {
        border: none;
        border-top: 1px solid #3a3a5a;
        margin: 20px 0;
    }

    .tx-footer {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 2px solid #4a4a6a;
    }

    .back-btn {
        background: #2a2a4a;
        border: 2px solid #4a4a6a;
        color: #CEC5B4;
        padding: 8px 16px;
        font-family: 'Press Start 2P', monospace;
        font-size: 8px;
        cursor: pointer;
    }

    .back-btn:hover {
        background: #3a3a5a;
        border-color: #00ff88;
        color: #00ff88;
    }

    .error .back-btn {
        margin-top: 16px;
    }
</style>
