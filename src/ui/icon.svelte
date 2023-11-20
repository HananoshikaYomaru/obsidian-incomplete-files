<!--adapted from @javalent's code: https://discord.com/channels/686053708261228577/840286264964022302/902949764209987654-->
<script lang="ts">
	import { setIcon } from "obsidian";
	import { onMount } from "svelte";

	export let name: string = "";

	let spanNode: HTMLElement; // This will hold the reference to the span element

	// Reactive statement to update the icon
	$: if (name.length > 0 && spanNode) {
		setIcon(spanNode, name);
	}

	// We use onMount to ensure that the DOM is ready before we try to use setIcon
	onMount(() => {
		if (name.length > 0) {
			setIcon(spanNode, name);
		}
	});
</script>

{#if name.length > 0}
	<span bind:this={spanNode} />
{/if}
