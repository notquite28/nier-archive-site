<script lang="ts">
    import { projects } from '$lib/data/projects';
    
    let projectList = $derived(projects);
    
    function getStatusLabel(status: string): string {
        switch (status) {
            case 'live': return '[LIVE]';
            case 'wip': return '[WIP]';
            case 'archived': return '[ARCHIVED]';
            default: return '';
        }
    }
    
    function getStatusColor(status: string): string {
        switch (status) {
            case 'live': return '#00ff88';
            case 'wip': return '#ffe66d';
            case 'archived': return '#888';
            default: return '#888';
        }
    }
</script>

<div class="section projects">
    <h2>// DATA FRAGMENTS</h2>
    <p class="intro">Recovered project data from the archive.</p>
    
    <div class="project-list">
        {#each projectList as project, i}
            {#if project.url}
                <a href={project.url} target="_blank" rel="noopener" class="project-card">
                    <div class="project-index">#{String(i + 1).padStart(2, '0')}</div>
                    <div class="project-info">
                        <h3>{project.name} <span class="status" style="color: {getStatusColor(project.status)}">{getStatusLabel(project.status)}</span></h3>
                        <p>{project.description}</p>
                        <div class="tags">
                            {#each project.tags as tag}
                                <span class="tag">{tag}</span>
                            {/each}
                        </div>
                    </div>
                    <div class="project-arrow">→</div>
                </a>
            {:else}
                <div class="project-card disabled">
                    <div class="project-index">#{String(i + 1).padStart(2, '0')}</div>
                    <div class="project-info">
                        <h3>{project.name} <span class="status" style="color: {getStatusColor(project.status)}">{getStatusLabel(project.status)}</span></h3>
                        <p>{project.description}</p>
                        <div class="tags">
                            {#each project.tags as tag}
                                <span class="tag">{tag}</span>
                            {/each}
                        </div>
                    </div>
                    <div class="project-arrow">—</div>
                </div>
            {/if}
        {/each}
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

    .project-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .project-card {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: #d1cdb7;
        border: 0.1rem solid #bab5a1;
        text-decoration: none;
        transition: all 0.2s;
        color: #454138;
    }

    .project-card.disabled {
        opacity: 0.7;
        cursor: default;
    }

    .project-card:not(.disabled):hover {
        box-shadow: 0.2em 0.2em 0.1em 0 #bab5a1;
    }

    .project-index {
        font-size: 0.8rem;
        color: #bab5a1;
        min-width: 32px;
    }

    .project-info {
        flex: 1;
    }

    .project-info h3 {
        font-size: 0.9rem;
        color: #454138;
        margin-bottom: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        font-weight: normal;
        text-transform: uppercase;
        letter-spacing: 0.1rem;
    }

    .status {
        font-size: 0.7rem;
    }

    .project-info p {
        font-size: 0.8rem;
        color: #454138;
        margin-bottom: 0.5rem;
    }

    .tags {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
    }

    .tag {
        font-size: 0.65rem;
        color: #454138;
        background: #bab5a1;
        padding: 0.15rem 0.4rem;
    }

    .project-arrow {
        font-size: 1rem;
        color: #bab5a1;
        transition: color 0.2s, transform 0.2s;
    }

    .project-card:not(.disabled):hover .project-arrow {
        color: #454138;
        transform: translateX(4px);
    }
</style>
