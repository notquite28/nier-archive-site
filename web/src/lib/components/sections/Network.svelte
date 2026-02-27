<script lang="ts">
    import { links } from '$lib/data/links';
    
    $: linkList = links;
</script>

<div class="section network">
    <h2>// NETWORK</h2>
    <p class="intro">External connections and contact protocols.</p>
    
    <div class="link-grid">
        {#each linkList as link}
            <a href={link.url} target="_blank" rel="noopener" class="link-card">
                <span class="link-icon">{link.icon}</span>
                <span class="link-name">{link.name}</span>
                <span class="link-arrow">↗</span>
            </a>
        {/each}
    </div>
    
    <div class="contact">
        <h3>SIGNAL TRANSMISSION</h3>
        <p>To establish direct contact:</p>
        <code>hello [at] example [dot] com</code>
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

    .link-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
        margin-bottom: 20px;
    }

    .link-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: #0f0f1a;
        border: 2px solid #3a3a5a;
        text-decoration: none;
        transition: border-color 0.2s, background 0.2s;
    }

    .link-card:hover {
        border-color: #ff6b6b;
        background: rgba(255, 107, 107, 0.05);
    }

    .link-icon {
        font-size: 16px;
    }

    .link-name {
        flex: 1;
        font-size: 9px;
        color: #CEC5B4;
    }

    .link-arrow {
        font-size: 10px;
        color: #4a4a6a;
    }

    .link-card:hover .link-arrow {
        color: #ff6b6b;
    }

    .contact {
        padding: 16px;
        background: #0f0f1a;
        border-left: 3px solid #ffe66d;
    }

    .contact h3 {
        font-size: 10px;
        color: #ffe66d;
        margin-bottom: 8px;
    }

    .contact p {
        font-size: 9px;
        color: #888;
        margin-bottom: 8px;
    }

    .contact code {
        font-size: 9px;
        color: #00ff88;
        background: rgba(0, 255, 136, 0.1);
        padding: 4px 8px;
    }
</style>
