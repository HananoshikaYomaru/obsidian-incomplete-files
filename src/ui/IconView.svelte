<script lang="ts">
	import type { IncompleteFile } from "@/SettingsSchemas";
	import IssueIcon from "@/ui/IssueIcon.svelte";
	import { SORT_ORDER } from "@/ui/helpers/enums";
	import { sortBy } from "@/ui/helpers/store";
	export let sortedFiles: IncompleteFile[];

	$: issues = sortedFiles
		.map((file) => {
			return file.issues.map((issue) => {
				return {
					...issue,
					file,
				};
			});
		})
		.flat()
		.toSorted((a, b) => {
			// if sort by name, sort by file path
			if ($sortBy === SORT_ORDER.NAME) {
				return a.file.path.localeCompare(b.file.path);
			}
			return a.type.localeCompare(b.type);
		});
</script>

{#each issues as issue}
	<IssueIcon {issue} />
{/each}
