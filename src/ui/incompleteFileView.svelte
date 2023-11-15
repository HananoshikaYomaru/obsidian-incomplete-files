<script lang="ts">
	import type { Heading, IncompleteFile } from "@/SettingsSchemas";
	import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";
	import { checkEmptyContent } from "@/rules/checkEmptyContent";
	import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
	import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";
	import Icon from "@/ui/icon.svelte";
	import { incompleteFiles, plugin } from "@/ui/store";
	import { getIcon, type TFile } from "obsidian";

	// Helper function to format the date
	function formatDate(date: Date) {
		// the formart of YYYY-MM-DD
		return date.toISOString().split("T")[0];
	}

	function goToFile(file: IncompleteFile) {
		// Use the Obsidian API to open the file
		const tfile = $plugin.app.vault.getAbstractFileByPath(file.path);
		if (tfile)
			$plugin.app.workspace.getLeaf(false).openFile(tfile as TFile);
	}

	function goToHeading(file: IncompleteFile, heading: Heading) {
		const tfile = $plugin.app.vault.getAbstractFileByPath(
			file.path
		) as TFile;

		if (!tfile) return;
		const cache = $plugin.app.metadataCache.getFileCache(tfile);
		const targetHeading = cache?.headings?.find(
			(h) => h.heading === heading.text
		);

		if (!targetHeading) return;

		const {
			start: { line, col },
			end: endLoc,
		} = targetHeading.position;

		// construct the estate from,  heading.position.start and heading.position.end

		const eState = {
			active: true,
			focus: true,
			startLoc: { line, col },
			endLoc,
			line,
			cursor: {
				from: { line, ch: col },
				to: { line, ch: col },
			},
		};
		$plugin.app.workspace
			.getLeaf(false)
			.openFile(tfile as TFile, { active: true, eState });
	}

	let areSummariesExpanded = false;
	let detailsStates = $incompleteFiles.map(() => false);

	function toggleSummaries() {
		areSummariesExpanded = !areSummariesExpanded;
		detailsStates = detailsStates.map(() => areSummariesExpanded);
	}

	function updateDetailsState(
		index: number,
		event: Event<EventTarget> & {
			currentTarget: EventTarget & HTMLDetailsElement;
		}
	) {
		// @ts-ignore
		detailsStates[index] = event.target?.open;
		areSummariesExpanded = detailsStates.some((state) => state);
	}
</script>

<div class="incomplete-files">
	<!-- list of utils -->
	<div class="incomplete-files-utils">
		<button on:click={toggleSummaries}>
			<!-- toggle collapse summary -->
			<Icon
				name={areSummariesExpanded
					? "chevrons-down-up"
					: "chevrons-up-down"}
			/>
		</button>
		<button> group by folder </button>
		<button> group by tag </button>
	</div>
	{#each $incompleteFiles as file, index}
		<details
			class="file-item"
			open={detailsStates[index]}
			on:toggle={(event) => updateDetailsState(index, event)}
		>
			<summary>
				<span class="file-text">
					<strong>{file.basename}</strong> (Last checked: {formatDate(
						file.lastChecked
					)})
				</span>
			</summary>
			<ul class="incomplete-files-reason-list">
				{#each file.reasons as reason}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<li
						class="incomplete-files-reason"
						data-reason={reason.type}
						data-reason-heading={reason.heading?.text}
						data-reason-heading-depth={reason.heading?.depth}
						on:click={(event) => {
							if (reason.heading)
								goToHeading(file, reason.heading);
							else goToFile(file);
						}}
					>
						{@html reason.type ===
						INCOMPLETE_REASON_TYPE.EMPTY_CONTENT
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
	{/each}
</div>

<style>
	.file-item {
		margin-bottom: 1rem;
		padding: 0.5rem;
		border-bottom: 1px solid #ddd;
	}

	summary {
		cursor: pointer;
		flex-direction: row;
	}
	summary:hover {
		color: var(--color-purple);
	}
	.incomplete-files-reason-list {
		list-style: none;
		padding-left: 0;
	}
	li.incomplete-files-reason {
		cursor: pointer;
		padding: 6px;
		border-radius: 4px;
	}
	li.incomplete-files-reason:hover {
		color: var(--color-purple);
		/* bg a little bit dimmer */
		background-color: rgba(0, 0, 0, 0.1);
	}

	.incomplete-files-reason {
		display: flex;
		align-items: start;
		padding: 6px;
		border-radius: 4px;
		position: relative;
	}

	.incomplete-files-utils {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
		position: sticky;
		top: 0; /* Adjust this value as needed */
		z-index: 1000; /* To ensure it stays above other content */
	}
</style>
