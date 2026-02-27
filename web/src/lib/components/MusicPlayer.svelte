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

    onMount(() => {
        if (!browser) return;
        audio = new Audio('/assets/track.mp3');
        audio.loop = true;
        audio.volume = volume;
        
        audio.addEventListener('timeupdate', () => {
            if (audio) currentTime = audio.currentTime;
        });
        
        audio.addEventListener('loadedmetadata', () => {
            if (audio) duration = audio.duration;
        });
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
            />
        </div>
    </div>
</div>

<style>
    .music-player {
        position: fixed;
        top: 76px;
        right: 16px;
        background: #1a1a2e;
        border: 3px solid #4a4a6a;
        padding: 10px 12px;
        font-family: 'Press Start 2P', monospace;
        image-rendering: pixelated;
        box-shadow: 4px 4px 0 #000;
        min-width: 180px;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 8px;
    }

    .music-icon {
        color: #ffe66d;
        font-size: 12px;
    }

    .now-playing {
        font-size: 8px;
        color: #8888aa;
    }

    .track-info {
        margin-bottom: 8px;
        overflow: hidden;
    }

    .seek-container {
        margin-bottom: 10px;
    }

    .seek-bar {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 6px;
        background: #0f0f1a;
        border: 2px solid #3a3a5a;
        cursor: pointer;
        margin-bottom: 4px;
    }

    .seek-bar::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 8px;
        height: 12px;
        background: #ffe66d;
        cursor: pointer;
    }

    .seek-bar::-moz-range-thumb {
        width: 8px;
        height: 12px;
        background: #ffe66d;
        border: none;
        cursor: pointer;
    }

    .time-display {
        display: flex;
        justify-content: space-between;
        font-size: 8px;
        color: #8888aa;
    }

    .marquee-container {
        background: #0f0f1a;
        padding: 6px 8px;
        border: 2px solid #3a3a5a;
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
        font-size: 9px;
        color: #00ff88;
    }

    .separator {
        font-size: 9px;
        color: #666;
        margin: 0 8px;
    }

    .artist {
        font-size: 9px;
        color: #aaaaaa;
    }

    .controls {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .play-btn {
        background: #2a2a4a;
        border: 2px solid #4a4a6a;
        color: #00ff88;
        width: 32px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
    }

    .play-btn:hover {
        background: #3a3a5a;
    }

    .play-btn .icon {
        font-size: 10px;
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
        font-size: 14px;
    }

    .volume-slider {
        -webkit-appearance: none;
        appearance: none;
        width: 60px;
        height: 8px;
        background: #0f0f1a;
        border: 2px solid #3a3a5a;
        cursor: pointer;
    }

    .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 10px;
        height: 10px;
        background: #00ff88;
        cursor: pointer;
    }

    .volume-slider::-moz-range-thumb {
        width: 10px;
        height: 10px;
        background: #00ff88;
        border: none;
        cursor: pointer;
    }
</style>
