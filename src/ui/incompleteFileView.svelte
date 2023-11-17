<script lang="ts">
	import { incompleteFiles, displayOption, sortBy } from "@/ui/helpers/store";

	import { DISPLAY_OPTION, SORT_ORDER } from "./helpers/enums";
	import UtilsBar from "@/ui/UtilsBar.svelte";
	import FileItem from "@/ui/FileItem.svelte";
	import FolderGroup from "@/ui/FolderGroup.svelte";
	import { getOrganizeFiles } from "@/ui/helpers/organiseFile";
	import { scrollToElement as _scrollToElement } from "@/ui/helpers/scrollToElement";
	import IconView from "@/ui/IconView.svelte";

	export const scrollToElement = _scrollToElement;

	// Group by folder
	$: organizedFiles = getOrganizeFiles($displayOption);

	$: isGroupByFolder =
		$displayOption === DISPLAY_OPTION.FOLDER_LIST ||
		$displayOption === DISPLAY_OPTION.FOLDER_ICON;

	$: sortedFiles = $incompleteFiles.sort((a, b) => {
		if ($sortBy === SORT_ORDER.NAME) {
			return a.basename.localeCompare(b.basename);
		} else {
			return b.lastChecked.getTime() - a.lastChecked.getTime();
		}
	});
</script>

<div class="incomplete-files">
	<!-- list of utils -->
	<UtilsBar />

	{#if isGroupByFolder === true}
		{#each Object.entries(organizedFiles).toSorted(// sort by folder name
			([a], [b]) => a.localeCompare(b)) as [folderPath, files]}
			<FolderGroup {folderPath} {files} />
		{/each}
	{:else if $displayOption === DISPLAY_OPTION.NONE_LIST}
		{#each sortedFiles as file}
			<FileItem {file} />
		{/each}
	{:else}
		<IconView {sortedFiles} />
	{/if}
</div>
