<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import DOMPurify from 'dompurify';

    let transmission = $state<{title: string, date: string, html: string} | null>(null);
    let loading = $state(true);

    let slug = $derived($page.params.slug);

    function sanitizeHtml(html: string): string {
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'hr', 'span'],
            ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
        });
    }

    onMount(() => {
        if (!browser) return;
        
        const controller = new AbortController();
        
        (async () => {
            try {
                const res = await fetch(`/api/transmissions/${slug}`, { signal: controller.signal });
                if (res.ok) {
                    transmission = await res.json();
                }
            } catch (e) {
                if (e instanceof Error && e.name !== 'AbortError') {
                    console.error('Failed to load transmission:', e);
                }
            }
            loading = false;
        })();
        
        return () => controller.abort();
    });
</script>

{#if loading}
    <div class="loading">
        <div class="loading-inner">Loading transmission...</div>
    </div>
{:else if transmission}
    <div class="transmission">
        <div class="transmission-inner">
            <header class="tx-header">
                <span class="tx-label">TRANSMISSION</span>
                <span class="tx-date">{transmission.date}</span>
            </header>
            
            <h1 class="tx-title">{transmission.title}</h1>
            
            <article class="tx-content">
                {@html sanitizeHtml(transmission.html)}
            </article>
            
            <footer class="tx-footer">
                <button class="back-btn" onclick={() => goto('/')}>
                    ← Return to Archive
                </button>
            </footer>
        </div>
    </div>
{:else}
    <div class="error">
        <div class="error-inner">
            <p>Transmission not found.</p>
            <button class="back-btn" onclick={() => goto('/')}>Return to Archive</button>
        </div>
    </div>
{/if}

<style>
    :global(body) {
        overflow: auto;
    }

    .loading, .error {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }

    .loading-inner, .error-inner {
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 2rem;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
        text-align: center;
        color: #454138;
    }

    .transmission {
        max-width: 100%;
        min-height: 100vh;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .transmission-inner {
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 2rem;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
        max-width: 700px;
        width: 100%;
    }

    .tx-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 0.1rem solid #bab5a1;
    }

    .tx-label {
        font-size: 0.7rem;
        color: #454138;
        letter-spacing: 0.2rem;
        text-transform: uppercase;
    }

    .tx-date {
        font-size: 0.7rem;
        color: #bab5a1;
    }

    .tx-title {
        font-size: 1.5rem;
        color: #454138;
        margin-bottom: 1.5rem;
        text-transform: uppercase;
        letter-spacing: 0.3rem;
        font-weight: normal;
        text-shadow: 0.2rem 0.2rem 0 #bab5a1;
    }

    .tx-content {
        color: #454138;
        font-size: 0.9rem;
        line-height: 1.8;
    }

    .tx-content :global(h2) {
        font-size: 1.1rem;
        color: #454138;
        margin: 1.5rem 0 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 0.1rem solid #bab5a1;
        text-transform: uppercase;
        letter-spacing: 0.2rem;
        font-weight: normal;
    }

    .tx-content :global(h3) {
        font-size: 1rem;
        color: #454138;
        margin: 1.25rem 0 0.75rem;
        letter-spacing: 0.1rem;
        font-weight: normal;
    }

    .tx-content :global(p) {
        margin-bottom: 1rem;
    }

    .tx-content :global(ul), .tx-content :global(ol) {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }

    .tx-content :global(li) {
        margin-bottom: 0.5rem;
    }

    .tx-content :global(code) {
        background: #d1cdb7;
        padding: 0.15rem 0.4rem;
        color: #454138;
        font-size: 0.8rem;
    }

    .tx-content :global(pre) {
        background: #d1cdb7;
        padding: 1rem;
        overflow-x: auto;
        margin: 1rem 0;
        border: 0.1rem solid #bab5a1;
    }

    .tx-content :global(pre code) {
        background: none;
        padding: 0;
    }

    .tx-content :global(blockquote) {
        border-left: 0.2rem solid #bab5a1;
        padding-left: 1rem;
        margin: 1rem 0;
        color: #454138;
        font-style: italic;
    }

    .tx-content :global(hr) {
        border: none;
        border-top: 0.1rem solid #bab5a1;
        margin: 1.5rem 0;
    }

    .tx-content :global(a) {
        color: #454138;
        text-decoration: underline;
    }

    .tx-content :global(a:hover) {
        background: #bab5a1;
    }

    .tx-content :global(strong) {
        font-weight: normal;
        background: #bab5a1;
        padding: 0 0.25rem;
    }

    .tx-footer {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 0.1rem solid #bab5a1;
    }

    .back-btn {
        padding: 0.75rem 1.5rem;
        font-size: 0.8rem;
        text-transform: uppercase;
        letter-spacing: 0.2rem;
    }

    .error .back-btn {
        margin-top: 1rem;
    }
</style>
