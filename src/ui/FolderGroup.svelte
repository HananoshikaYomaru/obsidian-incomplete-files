<script lang="ts">
	import IconView from "@/ui/IconView.svelte";
	import FileItem from "./FileItem.svelte";
	import { type IncompleteFile } from "@/SettingsSchemas";
	import { DISPLAY_OPTION, SORT_ORDER } from "@/ui/helpers/enums";
	import { detailsStates, sortBy, displayOption } from "@/ui/helpers/store";
	import { updateDetailsState } from "@/ui/helpers/updateDetailsState";
	export let folderPath: string;
	export let files: IncompleteFile[];
	$: sortedFiles = files.sort((a, b) => {
		if ($sortBy === SORT_ORDER.NAME) {
			return a.basename.localeCompare(b.basename);
		} else {
			return b.lastChecked.getTime() - a.lastChecked.getTime();
		}
	});
</script>

<details
	class="folder-group"
	data-path={folderPath}
	open={$detailsStates[folderPath]}
	on:toggle={(event) => updateDetailsState(folderPath, event)}
>
	<summary>
		<span style="display:inline-flex; width:90%;">
			{folderPath.trim() === "" ? "Root" : folderPath}
		</span>

		<span id="count" class="tree-item-flair">
			{$displayOption === DISPLAY_OPTION.FOLDER_LIST
				? files.length
				: sortedFiles.map((f) => f.issues).flat().length}
		</span>
	</summary>
	{#if $displayOption === DISPLAY_OPTION.FOLDER_LIST}
		{#each sortedFiles as file}
			<div class="nested-item">
				<FileItem {file} />
			</div>
		{/each}
	{:else}
		<div class="nested-item">
			<IconView {sortedFiles} />
		</div>
	{/if}
</details>
