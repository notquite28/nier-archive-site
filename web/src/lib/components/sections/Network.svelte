<script lang="ts">
    import { links } from '$lib/data/links';
    
    let linkList = $derived(links);
</script>

<div class="section network">
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
    
    <blockquote class="contact">
        <p>To establish direct contact:</p>
        <cite>judy2077 [at] protonmail [dot] com</cite>
    </blockquote>
</div>

<style>
    .section {
        color: #454138;
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
        position: relative;
        z-index: 1;
        overflow: hidden;
    }

    .link-card:hover {
        color: #dcd8c0;
        background: #454138;
        box-shadow: 0.2em 0.2em 0.1em 0 #bab5a1;
    }

    .link-card:hover .link-name {
        color: #dcd8c0;
    }

    .link-card:hover .link-arrow {
        color: #dcd8c0;
    }

    .link-icon {
        font-size: 1rem;
        position: relative;
        z-index: 2;
    }

    .link-name {
        flex: 1;
        font-size: 0.8rem;
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
        position: relative;
        z-index: 2;
        transition: color 0.2s;
    }

    .link-arrow {
        font-size: 0.8rem;
        color: #bab5a1;
        position: relative;
        z-index: 2;
        transition: color 0.2s;
    }

    .contact {
        position: relative;
        padding: 0.5rem;
        margin: 1.5rem 0 0 1.5rem;
    }

    .contact:before {
        content: '';
        position: absolute;
        top: 0;
        left: -1.5rem;
        bottom: 0;
        height: 100%;
        width: 0.3rem;
        border: solid #bab5a1;
        border-width: 0 0.2rem 0 0.6rem;
    }

    .contact p {
        font-size: 0.85rem;
        color: #454138;
        margin-bottom: 0.5rem;
    }

    .contact cite {
        position: relative;
        padding-left: 1.5rem;
        font-style: normal;
        font-size: 0.9rem;
        color: #454138;
    }

    .contact cite:before {
        content: '';
        position: absolute;
        width: 0.7rem;
        height: 0.7rem;
        background-color: #454138;
        margin-left: -1rem;
        top: 0.25em;
    }

    @media (max-width: 600px) {
        .link-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
