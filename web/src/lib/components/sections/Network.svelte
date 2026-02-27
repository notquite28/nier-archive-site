<script lang="ts">
    import { links } from '$lib/data/links';
    
    let linkList = $derived(links);
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

    .link-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .link-card {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: #d1cdb7;
        border: 0.1rem solid #bab5a1;
        text-decoration: none;
        transition: all 0.2s;
        color: #454138;
    }

    .link-card:hover {
        box-shadow: 0.2em 0.2em 0.1em 0 #bab5a1;
    }

    .link-icon {
        font-size: 1rem;
    }

    .link-name {
        flex: 1;
        font-size: 0.8rem;
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
    }

    .link-arrow {
        font-size: 0.8rem;
        color: #bab5a1;
    }

    .link-card:hover .link-arrow {
        color: #454138;
    }

    .contact {
        padding: 1rem;
        background: #d1cdb7;
        border-left: 0.2rem solid #454138;
    }

    .contact h3 {
        font-size: 0.85rem;
        color: #454138;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.1rem;
        font-weight: normal;
    }

    .contact p {
        font-size: 0.8rem;
        color: #454138;
        margin-bottom: 0.5rem;
    }

    .contact code {
        font-size: 0.8rem;
        color: #454138;
        background: #bab5a1;
        padding: 0.25rem 0.5rem;
    }
</style>
