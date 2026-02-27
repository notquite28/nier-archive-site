<script lang="ts">
    import { viewerCount } from '$lib/stores/cursors';

    let count = $derived($viewerCount);
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
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 0.5rem 1rem;
        font-family: helvetica, sans-serif;
        font-size: 0.85rem;
        color: #454138;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        letter-spacing: 0.03rem;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
    }

    .icon {
        font-size: 1rem;
    }

    .count {
        color: #454138;
        min-width: 24px;
        text-align: right;
    }

    .label {
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
    }
</style>
