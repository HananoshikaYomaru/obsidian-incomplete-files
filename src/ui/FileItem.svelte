<script lang="ts">
	import { formatDate } from "@/util/formatDate";
	import type { IncompleteFile } from "@/SettingsSchemas";
	import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";
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
	<ul class="incomplete-files-reason-list is-clickable">
		{#each file.reasons as reason}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<li
				class="incomplete-files-reason tree-item-self is-clickable"
				data-reason={reason.type}
				data-reason-heading={reason.heading?.text}
				data-reason-heading-depth={reason.heading?.depth}
				on:click={(event) => {
					if (reason.heading) goToHeading(file, reason.heading);
					else goToFile(file);
				}}
			>
				{@html reason.type === INCOMPLETE_REASON_TYPE.EMPTY_CONTENT
					? checkEmptyContent.icon
					: reason.type ===
					  INCOMPLETE_REASON_TYPE.EMPTY_CONTENT_HEADING
					? checkEmptyContentHeading.icon
					: checkIncompleteSyntax.icon}
				{reason.title}
			</li>
		{/each}
	</ul>
</details>
