<script lang="ts">
    import { viewerCount } from '$lib/stores/cursors';

    $: count = $viewerCount;
</script>

<div class="viewer-count">
    <span class="icon">👁</span>
    <span class="count">{count}</span>
    <span class="label">viewer{count !== 1 ? 's' : ''}</span>
</div>

<style>
    .viewer-count {
        position: fixed;
        top: 16px;
        right: 16px;
        background: #1a1a2e;
        border: 3px solid #4a4a6a;
        padding: 8px 16px;
        font-family: 'Press Start 2P', monospace;
        font-size: 12px;
        color: #fff;
        display: flex;
        align-items: center;
        gap: 8px;
        image-rendering: pixelated;
        box-shadow: 4px 4px 0 #000;
    }

    .icon {
        font-size: 16px;
    }

    .count {
        color: #00ff88;
        min-width: 24px;
        text-align: right;
    }

    .label {
        color: #8888aa;
    }
</style>
