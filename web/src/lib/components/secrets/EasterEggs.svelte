<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { windowManager } from '$lib/stores/windows';
    import { playSound } from '$lib/stores/sounds';

    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    let konamiUnlocked = $state(false);

    let clickCount = $state(0);
    let lastClickTime = 0;
    let secretClickUnlocked = $state(false);

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                unlockKonami();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    }

    function unlockKonami() {
        if (konamiUnlocked) return;
        konamiUnlocked = true;
        playSound('success');
        
        windowManager.openWindow({
            id: 'secret-konami',
            title: 'CLASSIFIED',
            content: `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="color: #ffe66d; margin-bottom: 16px;">ACCESS GRANTED</h3>
                    <p style="color: #CEC5B4; margin-bottom: 12px;">You've discovered a secret.</p>
                    <p style="color: #888; font-size: 8px;">The Archive recognizes your dedication.</p>
                    <p style="color: #00ff88; margin-top: 20px; font-size: 9px;"> Achievement Unlocked: Old School</p>
                </div>
            `,
            x: 200,
            y: 150,
            width: 350,
            height: 250
        });
    }

    function handleSecretClick() {
        const now = Date.now();
        if (now - lastClickTime < 500) {
            clickCount++;
            if (clickCount >= 5 && !secretClickUnlocked) {
                unlockSecretClick();
            }
        } else {
            clickCount = 1;
        }
        lastClickTime = now;
    }

    function unlockSecretClick() {
        secretClickUnlocked = true;
        playSound('success');
        
        windowManager.openWindow({
            id: 'secret-click',
            title: 'UNIT RECOGNIZED',
            content: `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="color: #ffe66d; margin-bottom: 16px;">PERSISTENCE DETECTED</h3>
                    <p style="color: #CEC5B4; margin-bottom: 12px;">Your determination has been noted.</p>
                    <p style="color: #888; font-size: 8px;">The Archive remembers all who explore deeply.</p>
                    <p style="color: #00ff88; margin-top: 20px; font-size: 9px;"> Achievement Unlocked: Clicker</p>
                </div>
            `,
            x: 250,
            y: 200,
            width: 350,
            height: 250
        });
    }

    onMount(() => {
        if (browser) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    });
</script>

<svelte:window onclick={handleSecretClick} />

{#if konamiUnlocked || secretClickUnlocked}
    <div class="achievements-badge" title="Secrets discovered">
        {#if konamiUnlocked}🏆{/if}
        {#if secretClickUnlocked}🎯{/if}
    </div>
{/if}

<style>
    .achievements-badge {
        position: fixed;
        bottom: 16px;
        right: 200px;
        background: #1a1a2e;
        border: 2px solid #4a4a6a;
        padding: 6px 10px;
        font-size: 12px;
        display: flex;
        gap: 8px;
        box-shadow: 4px 4px 0 #000;
    }
</style>
