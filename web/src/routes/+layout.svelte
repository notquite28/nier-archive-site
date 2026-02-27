<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/assets/cursor.svg" />
</svelte:head>

{@render children()}

<style>
	:global(html), :global(body), :global(*), :global(button), :global(input), :global(a), :global([role="button"]) {
		cursor: url('/assets/cursor.svg') 0 0, auto !important;
	}
	
	:global(body) {
		margin: 0;
		padding: 0;
		background-color: #d1cdb7;
		font-family: helvetica, sans-serif;
		letter-spacing: 0.03rem;
		font-weight: lighter;
		color: #454138;
		-webkit-background-size: 0.3rem 0.3rem;
		-moz-background-size: 0.3rem 0.3rem;
		background-size: 0.3rem 0.3rem;
		background-image: 
			linear-gradient(to right, #ccc8b1 1px, rgba(204,200,177,0) 1px), 
			linear-gradient(to bottom, #ccc8b1 1px, rgba(204,200,177,0) 1px);
	}

	:global(::selection) {
		background-color: #bab5a1;
	}

	/* YoRHa Button Styles */
	:global(button:not(:disabled)) {
		padding: 0.5rem;
		font-size: 1em;
		border: none;
		outline: none;
		appearance: none;
		border-radius: 0;
		background-color: #bab5a1;
		color: #454138;
		font-family: inherit;
		letter-spacing: inherit;
		font-weight: inherit;
		cursor: pointer;
		transition-duration: 0.2s;
		transition-property: color, background-color, box-shadow;
		position: relative;
		z-index: 1;
	}

	:global(button:not(:disabled):before) {
		content: '';
		transition: all 0.2s;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
	}

	:global(button:not(:disabled):after) {
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

	:global(button:not(:disabled):hover) {
		box-shadow: 0.2em 0.2em 0.1em 0 #bab5a1;
		background-color: transparent;
		color: #dcd8c0;
	}

	:global(button:not(:disabled):hover:before) {
		top: -0.2rem;
		bottom: -0.2rem;
		border: solid #454138;
		border-width: 0.1rem 0;
	}

	:global(button:not(:disabled):hover:after) {
		width: 100%;
	}

	:global(button:not(:disabled):active) {
		color: #454138;
	}

	:global(button:not(:disabled):active:after) {
		background-color: #dcd8c0;
	}

	/* Link hover styles */
	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	:global(a:hover) {
		text-decoration: underline;
	}

	/* YoRHa Heading Styles */
	:global(h1) {
		font-weight: normal;
		text-transform: uppercase;
		letter-spacing: 0.5rem;
		text-shadow: 0.3rem 0.3rem 0 #bab5a1;
	}

	:global(h2) {
		font-weight: lighter;
		border: solid #454138;
		border-width: 0.1rem 0;
		padding: 0.1rem 1rem;
	}

	:global(h3), :global(h4), :global(h5), :global(h6) {
		font-weight: lighter;
		letter-spacing: 0.1rem;
	}
</style>
