<script lang="ts">
    import { cursorList } from '$lib/stores/cursors';

    const tints = [
        'hue-rotate(0deg)',
        'hue-rotate(60deg)',
        'hue-rotate(120deg)',
        'hue-rotate(180deg)',
        'hue-rotate(240deg)',
        'hue-rotate(300deg)',
        'hue-rotate(30deg)'
    ];
    
    function getTint(id: number) {
        return tints[id % tints.length];
    }

    let cursors = $derived($cursorList);
</script>

<div class="cursors-container">
    {#each cursors as cursor (cursor.id)}
        <div 
            class="remote-cursor"
            style="left: {cursor.x * 100}%; top: {cursor.y * 100}%;"
        >
            <img 
                src="/assets/cursor.svg" 
                alt="cursor" 
                class="cursor-img"
                style="filter: {getTint(cursor.id)}"
            />
        </div>
    {/each}
</div>

<style>
    .cursors-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
    }

    .remote-cursor {
        position: absolute;
        transition: left 0.08s linear, top 0.08s linear;
    }

    .cursor-img {
        width: 16px;
        height: 16px;
    }
</style>
