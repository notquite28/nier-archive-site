<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    let audio: HTMLAudioElement | null = $state(null);
    let isPlaying = $state(false);

    onMount(() => {
        if (!browser) return;
        audio = new Audio('/assets/track.mp3');
        audio.loop = true;
        audio.volume = 0.5;
        
        return () => {
            if (audio) {
                audio.pause();
                audio = null;
            }
        };
    });

    function togglePlay() {
        if (!audio) return;
        
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        isPlaying = !isPlaying;
    }
</script>

<button 
    class="music-btn" 
    onclick={togglePlay} 
    aria-label={isPlaying ? 'Pause music' : 'Play music'}
    title={isPlaying ? 'Pause' : 'Play'}
>
    {#if isPlaying}
        <span class="icon">❚❚</span>
    {:else}
        <span class="icon">▶</span>
    {/if}
</button>

<style>
    .music-btn {
        position: fixed;
        top: 62px;
        right: 16px;
        width: 36px;
        height: 36px;
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        color: #454138;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        box-shadow: 0.2rem 0.2rem 0 #bab5a1;
        transition: all 0.2s;
    }

    .music-btn:hover {
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
        background: #454138;
        color: #dcd8c0;
    }

    .music-btn:active {
        box-shadow: 0.1rem 0.1rem 0 #bab5a1;
    }

    .icon {
        font-size: 0.8rem;
    }
</style>
