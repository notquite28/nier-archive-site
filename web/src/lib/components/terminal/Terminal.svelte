<script lang="ts">
    import { browser } from '$app/environment';
    import { windowManager } from '$lib/stores/windows';
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
        { id: 'whoami', label: 'whoami', title: 'UNIT PROFILE', width: 500, height: 480 },
        { id: 'projects', label: 'projects', title: 'DATA FRAGMENTS', width: 550, height: 500 },
        { id: 'transmissions', label: 'transmissions', title: 'TRANSMISSIONS', width: 500, height: 450 },
        { id: 'network', label: 'network', title: 'NETWORK', width: 450, height: 420 }
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
                }
                await new Promise(r => setTimeout(r, 300));
                bootComplete = true;
            };
            bootSequence();
        }
    });

    function handleCommand(cmd: Command) {
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
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 1.5rem 2rem;
        min-width: 320px;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
    }

    .terminal-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 0.1rem solid #bab5a1;
    }

    .prompt {
        color: #454138;
        font-size: 1rem;
        font-weight: normal;
    }

    .system-text {
        color: #454138;
        font-size: 0.85rem;
        letter-spacing: 0.1rem;
        text-transform: uppercase;
    }

    .boot-line {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
    }

    .prefix {
        color: #bab5a1;
    }

    .boot-text {
        color: #454138;
    }

    .status {
        margin-left: auto;
    }

    .status.success {
        color: #454138;
        background: #bab5a1;
        padding: 0.1rem 0.5rem;
    }

    .separator {
        height: 0.1rem;
        background: #bab5a1;
        margin: 1rem 0;
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
        padding: 0.75rem 1rem;
        background-color: transparent;
        border: none;
        text-align: left;
        color: #454138;
        position: relative;
        z-index: 1;
        font-family: inherit;
        font-size: inherit;
        letter-spacing: inherit;
        width: 100%;
    }

    .command-item:not(:disabled):before {
        content: '';
        transition: all 0.2s;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .command-item:not(:disabled):after {
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

    .command-item:hover:not(:disabled) {
        background-color: transparent;
        box-shadow: none;
        color: #dcd8c0;
    }

    .command-item:hover:not(:disabled):before {
        top: -0.2rem;
        bottom: -0.2rem;
        border: solid #454138;
        border-width: 0.1rem 0;
    }

    .command-item:hover:not(:disabled):after {
        width: 100%;
    }

    .command-item:hover:not(:disabled) .cmd-label,
    .command-item:hover:not(:disabled) .cmd-prefix {
        color: #dcd8c0;
    }

    .command-item:active:not(:disabled) {
        color: #454138;
    }

    .command-item:active:not(:disabled):after {
        background-color: #dcd8c0;
    }

    .command-item:active:not(:disabled) .cmd-label,
    .command-item:active:not(:disabled) .cmd-prefix {
        color: #454138;
    }

    .command-item:disabled {
        cursor: wait;
        background-color: transparent;
    }

    .cmd-prefix {
        color: #454138;
        font-size: 0.9rem;
    }

    .cmd-label {
        color: #454138;
        font-size: 0.9rem;
        flex: 1;
        text-transform: uppercase;
        letter-spacing: 0.1rem;
    }

    .command-item:hover .cmd-label {
        color: #454138;
    }

    .cmd-hint {
        color: #bab5a1;
        font-size: 0.7rem;
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
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 0.1rem solid #bab5a1;
    }

    .blink {
        color: #454138;
        animation: blink 1s step-end infinite;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }

    .hint {
        color: #bab5a1;
        font-size: 0.75rem;
    }
</style>
