<script lang="ts">
    import { projects } from '$lib/data/projects';
    
    $: projectList = projects;
</script>

<div class="section projects">
    <h2>// DATA FRAGMENTS</h2>
    <p class="intro">Recovered project data from the archive.</p>
    
    <div class="project-list">
        {#each projectList as project, i}
            <a href={project.url} target="_blank" rel="noopener" class="project-card">
                <div class="project-index">#{String(i + 1).padStart(2, '0')}</div>
                <div class="project-info">
                    <h3>{project.name}</h3>
                    <p>{project.description}</p>
                    <div class="tags">
                        {#each project.tags as tag}
                            <span class="tag">{tag}</span>
                        {/each}
                    </div>
                </div>
                <div class="project-arrow">→</div>
            </a>
        {/each}
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

    .project-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .project-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px;
        background: #0f0f1a;
        border: 2px solid #3a3a5a;
        text-decoration: none;
        transition: border-color 0.2s, transform 0.1s;
    }

    .project-card:hover {
        border-color: #00ff88;
        transform: translateX(4px);
    }

    .project-index {
        font-size: 10px;
        color: #4a4a6a;
        min-width: 32px;
    }

    .project-info {
        flex: 1;
    }

    .project-info h3 {
        font-size: 11px;
        color: #ffe66d;
        margin-bottom: 4px;
    }

    .project-info p {
        font-size: 9px;
        color: #888;
        margin-bottom: 8px;
    }

    .tags {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .tag {
        font-size: 7px;
        color: #00ff88;
        background: rgba(0, 255, 136, 0.1);
        padding: 2px 6px;
        border: 1px solid rgba(0, 255, 136, 0.3);
    }

    .project-arrow {
        font-size: 14px;
        color: #4a4a6a;
        transition: color 0.2s, transform 0.2s;
    }

    .project-card:hover .project-arrow {
        color: #00ff88;
        transform: translateX(4px);
    }
</style>
