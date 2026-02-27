<script lang="ts">
    import { browser } from '$app/environment';
    import { windowManager } from '$lib/stores/windows';
    import { playSound } from '$lib/stores/sounds';
    import { viewerCount } from '$lib/stores/cursors';

    let count = $derived($viewerCount);

    interface Command {
        id: string;
        label: string;
        title: string;
        width: number;
        height: number;
    }

    const commands: Command[] = [
        { id: 'whoami', label: 'whoami', title: 'UNIT PROFILE', width: 400, height: 380 },
        { id: 'projects', label: 'projects', title: 'DATA FRAGMENTS', width: 450, height: 400 },
        { id: 'transmissions', label: 'transmissions', title: 'TRANSMISSIONS', width: 400, height: 350 },
        { id: 'network', label: 'network', title: 'NETWORK', width: 350, height: 350 }
    ];

    let bootComplete = $state(false);
    let visibleCommands = $state<string[]>([]);
    let currentLine = $state(0);

    $effect(() => {
        if (browser && !bootComplete) {
            const bootSequence = async () => {
                for (let i = 0; i < commands.length; i++) {
                    await new Promise(r => setTimeout(r, 200));
                    visibleCommands = [...visibleCommands, commands[i].id];
                    playSound('click');
                }
                await new Promise(r => setTimeout(r, 300));
                bootComplete = true;
            };
            bootSequence();
        }
    });

    function handleCommand(cmd: Command) {
        playSound('open');
        
        const centerX = browser ? (window.innerWidth - cmd.width) / 2 : 100;
        const centerY = browser ? (window.innerHeight - cmd.height) / 2 : 100;
        
        windowManager.openWindow({
            id: cmd.id,
            title: cmd.title,
            content: '',
            x: centerX + Math.random() * 50 - 25,
            y: centerY + Math.random() * 50 - 25,
            width: cmd.width,
            height: cmd.height
        });
    }
</script>

<div class="terminal">
    <div class="terminal-header">
        <span class="prompt">></span>
        <span class="system-text">ARCHIVE TERMINAL v1.0</span>
    </div>
    
    <div class="boot-line">
        <span class="prefix">//</span>
        <span class="boot-text">Initializing connection...</span>
        <span class="status success">OK</span>
    </div>
    
    <div class="boot-line">
        <span class="prefix">//</span>
        <span class="boot-text">Units online: {count}</span>
    </div>
    
    <div class="separator"></div>
    
    <div class="command-list">
        {#each commands as cmd (cmd.id)}
            {#if visibleCommands.includes(cmd.id)}
                <button 
                    class="command-item"
                    onclick={() => handleCommand(cmd)}
                    disabled={!bootComplete}
                >
                    <span class="cmd-prefix">></span>
                    <span class="cmd-label">{cmd.label}</span>
                    <span class="cmd-hint">[execute]</span>
                </button>
            {/if}
        {/each}
    </div>
    
    {#if bootComplete}
        <div class="terminal-footer">
            <span class="blink">_</span>
            <span class="hint">Select a command to begin</span>
        </div>
    {/if}
</div>

<style>
    .terminal {
        background: rgba(26, 26, 46, 0.9);
        border: 3px solid #4a4a6a;
        padding: 20px 24px;
        min-width: 280px;
        box-shadow: 8px 8px 0 #000;
    }

    .terminal-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #4a4a6a;
    }

    .prompt {
        color: #00ff88;
        font-size: 14px;
    }

    .system-text {
        color: #CEC5B4;
        font-size: 10px;
        letter-spacing: 1px;
    }

    .boot-line {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 9px;
    }

    .prefix {
        color: #4a4a6a;
    }

    .boot-text {
        color: #888;
    }

    .status {
        margin-left: auto;
    }

    .status.success {
        color: #00ff88;
    }

    .separator {
        height: 1px;
        background: #3a3a5a;
        margin: 16px 0;
    }

    .command-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .command-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: transparent;
        border: 2px solid transparent;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s;
    }

    .command-item:hover:not(:disabled) {
        background: #0f0f1a;
        border-color: #4a4a6a;
    }

    .command-item:disabled {
        cursor: wait;
    }

    .cmd-prefix {
        color: #ffe66d;
        font-size: 12px;
    }

    .cmd-label {
        color: #CEC5B4;
        font-size: 11px;
        flex: 1;
    }

    .command-item:hover .cmd-label {
        color: #fff;
    }

    .cmd-hint {
        color: #4a4a6a;
        font-size: 8px;
        opacity: 0;
        transition: opacity 0.15s;
    }

    .command-item:hover .cmd-hint {
        opacity: 1;
    }

    .terminal-footer {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 2px solid #4a4a6a;
    }

    .blink {
        color: #00ff88;
        animation: blink 1s step-end infinite;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }

    .hint {
        color: #666;
        font-size: 8px;
    }
</style>
