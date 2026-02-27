<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/assets/cursor.svg" />
</svelte:head>

{@render children()}
