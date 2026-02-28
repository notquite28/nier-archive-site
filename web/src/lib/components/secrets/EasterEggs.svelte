<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

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
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 1rem 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
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
        font-size: 2rem;
        animation: bounce 0.5s ease-out;
    }

    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }

    .achievement-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .achievement-label {
        font-size: 0.65rem;
        color: #454138;
        letter-spacing: 0.15rem;
        text-transform: uppercase;
    }

    .achievement-name {
        font-size: 1rem;
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.1rem;
    }

    .achievement-title {
        font-size: 0.75rem;
        color: #bab5a1;
    }

    .achievements-badge {
        position: fixed;
        bottom: 16px;
        right: 60px;
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 0.4rem 0.6rem;
        font-size: 0.85rem;
        display: flex;
        gap: 0.4rem;
        box-shadow: 0.2rem 0.2rem 0 #bab5a1;
    }
</style>
