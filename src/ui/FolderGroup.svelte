<script lang="ts">
	import FileItem from "./FileItem.svelte";
	import { type IncompleteFile } from "@/SettingsSchemas";
	import { SORT_ORDER } from "@/ui/helpers/enums";
	import { detailsStates, sortBy } from "@/ui/helpers/store";
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
			{files.length}
		</span>
	</summary>
	{#each sortedFiles as file, index}
		<div class="nested-file-item">
			<FileItem {file} />
		</div>
	{/each}
</details>
