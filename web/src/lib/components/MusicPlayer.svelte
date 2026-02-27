<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    const trackName = "Weight of the World";
    const artistName = "NieR: Automata";

    let audio: HTMLAudioElement | null = $state(null);
    let isPlaying = $state(false);
    let volume = $state(0.2);
    let isMuted = $state(false);
    let previousVolume = 0.5;
    let currentTime = $state(0);
    let duration = $state(0);

    function handleTimeUpdate() {
        if (audio) currentTime = audio.currentTime;
    }

    function handleLoadedMetadata() {
        if (audio) duration = audio.duration;
    }

    function handleEnded() {
        isPlaying = false;
    }

    onMount(() => {
        if (!browser) return;
        audio = new Audio('/assets/track.mp3');
        audio.loop = true;
        audio.volume = volume;
        
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);
        
        return () => {
            if (audio) {
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
                audio.removeEventListener('ended', handleEnded);
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

    function handleVolumeChange(e: Event) {
        const target = e.target as HTMLInputElement;
        volume = parseFloat(target.value);
        if (audio) {
            audio.volume = volume;
            isMuted = volume === 0;
        }
    }

    function toggleMute() {
        if (!audio) return;
        
        if (isMuted) {
            volume = previousVolume || 0.5;
            audio.volume = volume;
            isMuted = false;
        } else {
            previousVolume = volume;
            volume = 0;
            audio.volume = 0;
            isMuted = true;
        }
    }

    function handleSeek(e: Event) {
        const target = e.target as HTMLInputElement;
        const seekTime = parseFloat(target.value);
        currentTime = seekTime;
        if (audio) {
            audio.currentTime = seekTime;
        }
    }

    function formatTime(seconds: number): string {
        if (!seconds || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
</script>

<div class="music-player">
    <div class="header">
        <span class="music-icon">♪</span>
        <span class="now-playing">NOW PLAYING</span>
    </div>
    
    <div class="track-info">
        <div class="marquee-container">
            <div class="marquee">
                <span class="track-name">{trackName}</span>
                <span class="separator">—</span>
                <span class="artist">{artistName}</span>
            </div>
        </div>
    </div>
    
    <div class="seek-container">
        <input 
            type="range" 
            min="0" 
            max={duration || 0}
            step="0.1" 
            value={currentTime}
            onchange={handleSeek}
            oninput={handleSeek}
            class="seek-bar"
            aria-label="Seek track position"
            aria-valuenow={Math.floor(currentTime)}
            aria-valuemin={0}
            aria-valuemax={Math.floor(duration) || 0}
        />
        <div class="time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
        </div>
    </div>
    
    <div class="controls">
        <button class="play-btn" onclick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {#if isPlaying}
                <span class="icon">❚❚</span>
            {:else}
                <span class="icon">▶</span>
            {/if}
        </button>
        
        <div class="volume-container">
            <button class="mute-btn" onclick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {#if isMuted || volume === 0}
                    <span class="vol-icon">🔇</span>
                {:else if volume < 0.5}
                    <span class="vol-icon">🔉</span>
                {:else}
                    <span class="vol-icon">🔊</span>
                {/if}
            </button>
            <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onchange={handleVolumeChange}
                oninput={handleVolumeChange}
                class="volume-slider"
                aria-label="Volume"
                aria-valuenow={Math.floor(volume * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
    </div>
</div>

<style>
    .music-player {
        position: fixed;
        top: 76px;
        right: 16px;
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 0.75rem 1rem;
        font-family: helvetica, sans-serif;
        letter-spacing: 0.03rem;
        font-weight: lighter;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
        min-width: 180px;
        color: #454138;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 0.5rem;
    }

    .music-icon {
        color: #454138;
        font-size: 0.9rem;
    }

    .now-playing {
        font-size: 0.7rem;
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.1rem;
    }

    .track-info {
        margin-bottom: 0.5rem;
        overflow: hidden;
    }

    .seek-container {
        margin-bottom: 0.75rem;
    }

    .seek-bar {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: #d1cdb7;
        border: 0.1rem solid #bab5a1;
        cursor: pointer;
        margin-bottom: 4px;
    }

    .seek-bar::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 8px;
        height: 12px;
        background: #454138;
        cursor: pointer;
    }

    .seek-bar::-moz-range-thumb {
        width: 8px;
        height: 12px;
        background: #454138;
        border: none;
        cursor: pointer;
    }

    .time-display {
        display: flex;
        justify-content: space-between;
        font-size: 0.7rem;
        color: #454138;
    }

    .marquee-container {
        background: #d1cdb7;
        padding: 0.4rem 0.5rem;
        border: 0.1rem solid #bab5a1;
        overflow: hidden;
    }

    .marquee {
        display: inline-block;
        white-space: nowrap;
        animation: scroll 10s linear infinite;
        padding-left: 100%;
    }

    @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-100%); }
    }

    .track-name {
        font-size: 0.75rem;
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.05rem;
    }

    .separator {
        font-size: 0.75rem;
        color: #bab5a1;
        margin: 0 0.5rem;
    }

    .artist {
        font-size: 0.75rem;
        color: #454138;
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .play-btn {
        background-color: #bab5a1;
        border: none;
        color: #454138;
        width: 32px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        transition-duration: 0.2s;
        transition-property: color, background-color, box-shadow;
        position: relative;
        z-index: 1;
    }

    .play-btn:before {
        content: '';
        transition: all 0.2s;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .play-btn:after {
        content: '';
        transition: all 0.2s ease-out;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 0;
        background-color: #454138;
        z-index: -1;
    }

    .play-btn:hover {
        box-shadow: 0.2em 0.2em 0.1em 0 #bab5a1;
        background-color: transparent;
        color: #dcd8c0;
    }

    .play-btn:hover:before {
        top: -0.15rem;
        bottom: -0.15rem;
        border: solid #454138;
        border-width: 0.1rem 0;
    }

    .play-btn:hover:after {
        width: 100%;
    }

    .play-btn:active {
        color: #454138;
    }

    .play-btn:active:after {
        background-color: #dcd8c0;
    }

    .play-btn .icon {
        font-size: 0.7rem;
    }

    .volume-container {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
    }

    .mute-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
    }

    .vol-icon {
        font-size: 0.9rem;
    }

    .volume-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 60px;
        height: 8px;
        background: #d1cdb7;
        border: 0.1rem solid #bab5a1;
        cursor: pointer;
    }

    .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 10px;
        height: 10px;
        background: #454138;
        cursor: pointer;
    }

    .volume-slider::-moz-range-thumb {
        width: 10px;
        height: 10px;
        background: #454138;
        border: none;
        cursor: pointer;
    }
</style>
