import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type SoundType = 'click' | 'close' | 'open' | 'hover' | 'release' | 'error' | 'success';

interface SoundState {
    enabled: boolean;
    volume: number;
}

function createSoundStore() {
    const { subscribe, set, update } = writable<SoundState>({
        enabled: true,
        volume: 0.3
    });

    return {
        subscribe,
        toggle: () => update(s => ({ ...s, enabled: !s.enabled })),
        setVolume: (v: number) => update(s => ({ ...s, volume: v })),
        enable: () => update(s => ({ ...s, enabled: true })),
        disable: () => update(s => ({ ...s, enabled: false }))
    };
}

export const soundStore = createSoundStore();

const soundCache: Map<SoundType, HTMLAudioElement> = new Map();

const soundFiles: Record<SoundType, string> = {
    click: '/assets/sounds/click.mp3',
    close: '/assets/sounds/close.mp3',
    open: '/assets/sounds/open.mp3',
    hover: '/assets/sounds/hover.mp3',
    release: '/assets/sounds/release.mp3',
    error: '/assets/sounds/error.mp3',
    success: '/assets/sounds/success.mp3'
};

function getSound(type: SoundType): HTMLAudioElement | null {
    if (!browser) return null;
    
    if (soundCache.has(type)) {
        return soundCache.get(type)!;
    }
    
    const audio = new Audio(soundFiles[type]);
    soundCache.set(type, audio);
    return audio;
}

export async function playSound(type: SoundType): Promise<void> {
    if (!browser) return;
    
    let state: SoundState = { enabled: true, volume: 0.3 };
    const unsub = soundStore.subscribe(s => state = s);
    unsub();
    
    if (!state.enabled) return;
    
    const audio = getSound(type);
    if (audio) {
        audio.volume = state.volume;
        audio.currentTime = 0;
        try {
            await audio.play();
        } catch {
            // Audio playback failed, likely no user interaction yet
        }
    }
}

export function preloadSounds(): void {
    if (!browser) return;
    Object.keys(soundFiles).forEach(type => {
        getSound(type as SoundType);
    });
}
