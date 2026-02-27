<script lang="ts">
    // Placeholder - will be replaced with actual blog data
    const transmissions = [
        { id: '001', title: 'Archive Initialized', date: '2024.02.27', status: 'RECEIVED' },
        { id: '002', title: 'Building Immersive Spaces', date: '2024.02.20', status: 'RECEIVED' },
        { id: '003', title: 'The Cursor Concurrency Experiment', date: '2024.02.15', status: 'RECEIVED' }
    ];
</script>

<div class="section transmissions">
    <h2>// TRANSMISSIONS</h2>
    <p class="intro">Log entries received from the network.</p>
    
    <div class="transmission-list">
        {#each transmissions as tx}
            <a href="/transmissions/{tx.id}" class="transmission-item">
                <div class="tx-header">
                    <span class="tx-id">TX-{tx.id}</span>
                    <span class="tx-status">{tx.status}</span>
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
