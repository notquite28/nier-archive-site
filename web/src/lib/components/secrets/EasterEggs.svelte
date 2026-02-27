<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';
    import { playSound } from '$lib/stores/sounds';

    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    let konamiUnlocked = $state(false);

    let clickCount = $state(0);
    let lastClickTime = 0;
    let secretClickUnlocked = $state(false);

    let showAchievement = $state(false);
    let achievementTitle = $state('');
    let achievementName = $state('');

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
        showAchievementPopup('Old School', 'Konami code discovered');
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
        showAchievementPopup('Clicker', 'Rapid clicking detected');
    }

    async function showAchievementPopup(name: string, title: string) {
        achievementName = name;
        achievementTitle = title;
        showAchievement = true;
        playSound('success');
        
        await new Promise(r => setTimeout(r, 4000));
        showAchievement = false;
    }

    onMount(() => {
        if (browser) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    });
</script>

<svelte:window onclick={handleSecretClick} />

{#if showAchievement}
    <div class="achievement-popup">
        <div class="achievement-icon">🏆</div>
        <div class="achievement-content">
            <span class="achievement-label">ACHIEVEMENT UNLOCKED</span>
            <span class="achievement-name">{achievementName}</span>
            <span class="achievement-title">{achievementTitle}</span>
        </div>
    </div>
{/if}

{#if konamiUnlocked || secretClickUnlocked}
    <div class="achievements-badge" title="Secrets discovered">
        {#if konamiUnlocked}🏆{/if}
        {#if secretClickUnlocked}🎯{/if}
    </div>
{/if}

<style>
    .achievement-popup {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a1a2e;
        border: 3px solid #ffe66d;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 8px 8px 0 #000, 0 0 30px rgba(255, 230, 109, 0.3);
        animation: slideUp 0.3s ease-out, fadeOut 0.5s ease-in 3.5s forwards;
        z-index: 9999;
    }

    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        to {
            opacity: 0;
        }
    }

    .achievement-icon {
        font-size: 32px;
        animation: bounce 0.5s ease-out;
    }

    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }

    .achievement-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .achievement-label {
        font-size: 8px;
        color: #ffe66d;
        letter-spacing: 2px;
    }

    .achievement-name {
        font-size: 14px;
        color: #fff;
    }

    .achievement-title {
        font-size: 9px;
        color: #888;
    }

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
