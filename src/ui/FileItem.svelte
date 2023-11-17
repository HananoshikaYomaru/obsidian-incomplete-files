<script lang="ts">
	import { formatDate } from "@/util/formatDate";
	import type { IncompleteFile } from "@/SettingsSchemas";
	import { INCOMPLETE_ISSUE_TYPE } from "@/rules/issueScanners";
	import { checkEmptyContent } from "@/rules/checkEmptyContent";
	import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
	import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";
	import { detailsStates } from "@/ui/helpers/store";
	import { updateDetailsState } from "@/ui/helpers/updateDetailsState";
	import { onFileRightClick } from "@/ui/helpers/onFileRightClick";
	import { goToHeading } from "@/ui/helpers/goToHeading";
	import { goToFile } from "@/ui/helpers/goToFile";
	export let file: IncompleteFile;
</script>

<details
	class="file-item"
	id={file.path}
	open={$detailsStates[file.path]}
	on:toggle={(event) => updateDetailsState(file.path, event)}
	on:contextmenu={(event) => onFileRightClick(file, event)}
>
	<summary class="is-clickable">
		<span style="display:inline;">
			<strong>{file.basename}</strong>
		</span>
		<br />
		<span style="display:inline-block">
			<small>
				(Last checked: {formatDate(file.lastChecked)})
			</small>
		</span>
	</summary>
	<ul class="incomplete-files-issue-list is-clickable">
		{#each file.issues as issue}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<li
				class="incomplete-files-issue tree-item-self is-clickable"
				data-issue={issue.type}
				data-issue-heading={issue.heading?.text}
				data-issue-heading-depth={issue.heading?.depth}
				on:click={(event) => {
					if (issue.heading) goToHeading(file, issue.heading);
					else goToFile(file);
				}}
			>
				{@html issue.type === INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT
					? checkEmptyContent.icon
					: issue.type === INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT_HEADING
					? checkEmptyContentHeading.icon
					: checkIncompleteSyntax.icon}
				{issue.title}
			</li>
		{/each}
	</ul>
</details>
