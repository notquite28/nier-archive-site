<script lang="ts">
    import { viewerCount } from '$lib/stores/cursors';

    let count = $derived($viewerCount);
</script>

<div class="viewer-count" title="{count} visitor{count !== 1 ? 's' : ''} online">
    <span class="count">{count}</span>
    <span class="dot"></span>
</div>

<style>
    .viewer-count {
        position: fixed;
        top: 16px;
        right: 16px;
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 0.5rem 0.75rem;
        font-family: helvetica, sans-serif;
        font-size: 0.85rem;
        color: #454138;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        letter-spacing: 0.03rem;
        box-shadow: 0.2rem 0.2rem 0 #bab5a1;
    }

    .count {
        font-weight: normal;
        min-width: 20px;
        text-align: center;
    }

    .dot {
        width: 8px;
        height: 8px;
        background: #454138;
        animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
    }
</style>
