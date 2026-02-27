<script lang="ts">
    import { page } from '$app/stores';
    
    let status = $derived($page.status);
    let message = $derived($page.error?.message || 'An error occurred');
</script>

<svelte:head>
    <title>{status} - The Archive</title>
</svelte:head>

<div class="error-page">
    <div class="error-container">
        <div class="error-code">{status}</div>
        <h1 class="error-title">
            {#if status === 404}
                TRANSMISSION NOT FOUND
            {:else}
                SYSTEM ERROR
            {/if}
        </h1>
        <p class="error-message">{message}</p>
        
        <div class="divider"></div>
        
        <p class="error-hint">The requested data fragment could not be located in the archive.</p>
        
        <a href="/" class="return-btn">RETURN TO TERMINAL</a>
    </div>
</div>

<style>
    .error-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }

    .error-container {
        background: #dcd8c0;
        border: 0.1rem solid #bab5a1;
        padding: 2rem 3rem;
        box-shadow: 0.3rem 0.3rem 0 #bab5a1;
        text-align: center;
        max-width: 500px;
    }

    .error-code {
        font-size: 5rem;
        color: #bab5a1;
        font-weight: normal;
        line-height: 1;
        margin-bottom: 1rem;
        letter-spacing: 0.5rem;
    }

    .error-title {
        font-size: 1.2rem;
        color: #454138;
        text-transform: uppercase;
        letter-spacing: 0.3rem;
        font-weight: normal;
        margin-bottom: 1rem;
    }

    .error-message {
        font-size: 0.9rem;
        color: #454138;
        margin-bottom: 1.5rem;
    }

    .divider {
        height: 0.1rem;
        background: #bab5a1;
        margin: 1.5rem 0;
    }

    .error-hint {
        font-size: 0.8rem;
        color: #454138;
        margin-bottom: 2rem;
    }

    .return-btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background-color: #bab5a1;
        color: #454138;
        text-decoration: none;
        text-transform: uppercase;
        letter-spacing: 0.2rem;
        font-size: 0.8rem;
        border: none;
        cursor: pointer;
        transition-duration: 0.2s;
        transition-property: color, background-color, box-shadow;
        position: relative;
        z-index: 1;
    }

    .return-btn:before {
        content: '';
        transition: all 0.2s;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .return-btn:after {
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

    .return-btn:hover {
        box-shadow: 0.2em 0.2em 0.1em 0 #bab5a1;
        background-color: transparent;
        color: #dcd8c0;
        text-decoration: none;
    }

    .return-btn:hover:before {
        top: -0.2rem;
        bottom: -0.2rem;
        border: solid #454138;
        border-width: 0.1rem 0;
    }

    .return-btn:hover:after {
        width: 100%;
    }

    .return-btn:active {
        color: #454138;
    }

    .return-btn:active:after {
        background-color: #dcd8c0;
    }
</style>
