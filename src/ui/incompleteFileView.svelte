<script lang="ts">
	import type { Heading, IncompleteFile } from "@/SettingsSchemas";
	import { initIncompleteFiles } from "@/initIncompleteFiles";
	import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";
	import { checkEmptyContent } from "@/rules/checkEmptyContent";
	import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
	import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";
	import { VIEW_TYPE } from "@/ui/IncompleteFileView";
	import Icon from "@/ui/icon.svelte";
	import { incompleteFiles, plugin } from "@/ui/store";
	import { isElementInView } from "@/util/isElementInView";
	import { DropdownComponent, Menu, TAbstractFile, TFile } from "obsidian";

	enum SORT_ORDER {
		NAME = "name",
		TIME = "time",
	}

	enum DISPLAY_OPTION {
		NONE_LIST = "none-list",
		NONE_ICON = "none-icon",
		FOLDER_LIST = "folder-list",
		FOLDER_ICON = "folder-icon",
	}

	// Helper function to format the date
	function formatDate(date: Date) {
		// the formart of YYYY-MM-DD
		return date.toISOString().split("T")[0];
	}

	function goToFile(file: IncompleteFile) {
		// Use the Obsidian API to open the file
		const tfile = $plugin.app.vault.getAbstractFileByPath(
			file.path
		) as TFile;
		if (tfile) {
			preventHighlight = true;
			$plugin.app.workspace.getLeaf(false).openFile(tfile as TFile, {
				active: true,
			});
		}
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
		preventHighlight = true;
		$plugin.app.workspace
			.getLeaf(false)
			.openFile(tfile as TFile, { active: true, eState });
	}

	let areSummariesExpanded = false;
	let detailsStates: Record<string, boolean> = $incompleteFiles.reduce(
		(acc, file) => {
			const folderPath = file.path.split("/").slice(0, -1).join("/");
			acc[folderPath] = false;
			acc[file.path] = false;
			return acc;
		},
		{} as Record<string, boolean>
	);

	function toggleSummaries() {
		areSummariesExpanded = !areSummariesExpanded;
		// for each details element, toggle the open state to areSummariesExpanded

		Object.entries(detailsStates).forEach(([path, state]) => {
			detailsStates[path] = areSummariesExpanded;
		});
	}

	function updateDetailsState(
		path: string,
		event: Event<EventTarget> & {
			currentTarget: EventTarget & HTMLDetailsElement;
		}
	) {
		// @ts-ignore
		detailsStates[path] = event.target?.open;
		areSummariesExpanded = Object.values(detailsStates).some(
			(state) => state
		);
	}

	// Group by folder

	let organizedFiles: Record<string, IncompleteFile[]> = {};

	function organizeFiles() {
		if (
			groupBy === DISPLAY_OPTION.FOLDER_LIST ||
			groupBy === DISPLAY_OPTION.FOLDER_ICON
		) {
			// Organize files by their folder paths
			organizedFiles = $incompleteFiles.reduce((acc, file) => {
				const folderPath = file
					? file.path.split("/").slice(0, -1).join("/")
					: "";
				if (!acc[folderPath]) {
					acc[folderPath] = [];
				}
				acc[folderPath]!.push(file);
				return acc;
			}, {} as Record<string, IncompleteFile[]>);
		} else {
			organizedFiles = {};
		}
	}

	async function refresh() {
		await initIncompleteFiles($plugin, true);
	}

	let sortOrder = SORT_ORDER.TIME;

	function sortDropdownAction(node: HTMLElement) {
		const dropdown = new DropdownComponent(node);
		dropdown.addOption(SORT_ORDER.NAME, "sort by name");
		dropdown.addOption(SORT_ORDER.TIME, "sort by time");
		// ... more options ...

		dropdown.onChange((value) => {
			// Handle dropdown value change
			sortOrder = value as SORT_ORDER;
		});

		return {
			destroy() {
				// Cleanup if needed
			},
		};
	}

	let groupBy = "none-list";
	function groupDropdownAction(node: HTMLElement) {
		const dropdown = new DropdownComponent(node);

		dropdown.addOption(DISPLAY_OPTION.NONE_LIST, "none-list");
		dropdown.addOption(DISPLAY_OPTION.NONE_ICON, "none-icon");
		dropdown.addOption(DISPLAY_OPTION.FOLDER_LIST, "folder-list");
		dropdown.addOption(DISPLAY_OPTION.FOLDER_ICON, "folder-icon");

		dropdown.onChange((value) => {
			// Handle dropdown value change
			groupBy = value;
			organizeFiles();
		});

		return {
			destroy() {
				// Cleanup if needed
			},
		};
	}

	let preventHighlight = false;
	export function scrollToElement(filePath: string) {
		const element = document.getElementById(filePath) as HTMLDetailsElement;
		const incompleteFilesContainer = document.querySelector(
			`div[data-type="incomplete-files-view"] div.view-content`
		) as HTMLDivElement;

		if (
			element &&
			incompleteFilesContainer &&
			// !isElementInView(element, incompleteFilesContainer)
			!preventHighlight
		) {
			element.scrollIntoView();
			const offset = 100; // Adjust this value as needed
			incompleteFilesContainer.scrollBy(0, -offset);

			// if element is not in the view, scroll into view again
			console.log(isElementInView(element, incompleteFilesContainer));
			if (!isElementInView(element, incompleteFilesContainer)) {
				element.scrollIntoView();
			}

			// Highlight the element
			element.classList.add("highlight");
			setTimeout(() => element.classList.remove("highlight"), 2000); // Remove highlight after 2 seconds
		}
		preventHighlight = false;
	}

	function onFileRightClick(file: IncompleteFile, event: MouseEvent) {
		event.preventDefault(); // Prevent the default browser context menu

		const fileItem = $plugin.app.vault.getAbstractFileByPath(file.path);
		const fileMenu = new Menu();
		if (fileItem instanceof TFile) {
			// Use Obsidian's internal API to show the context menu for the file
			// The API might look something like this, but refer to Obsidian's documentation or source for the exact method
			$plugin.app.workspace.trigger(
				"file-menu",
				// @ts-ignore
				fileMenu,
				fileItem,
				VIEW_TYPE
			);
			fileMenu.showAtPosition({ x: event.clientX, y: event.clientY });
		}
	}
</script>

<div class="highlight" style="display:none;" />
<div class="incomplete-files">
	<!-- list of utils -->

	<div class="incomplete-files-utils">
		<div id="group-dropdown-container" use:groupDropdownAction />
		<div id="sort-dropdown-container" use:sortDropdownAction />
		<button on:click={refresh}>
			<Icon name="rotate-cw" />
		</button>
		<button on:click={toggleSummaries}>
			<!-- toggle collapse summary -->
			<Icon
				name={areSummariesExpanded
					? "chevrons-down-up"
					: "chevrons-up-down"}
			/>
		</button>
	</div>

	{#if groupBy === DISPLAY_OPTION.FOLDER_ICON || groupBy === DISPLAY_OPTION.FOLDER_LIST}
		{#each Object.entries(organizedFiles) as [folderPath, files]}
			<details
				class="folder-group"
				open={detailsStates[folderPath]}
				on:toggle={(event) => updateDetailsState(folderPath, event)}
			>
				<summary
					>{folderPath.trim() === "" ? "Root" : folderPath}</summary
				>
				{#each files.toSorted((a, b) => {
					if (sortOrder === SORT_ORDER.NAME) {
						return a.basename.localeCompare(b.basename);
					} else {
						return b.lastChecked.getTime() - a.lastChecked.getTime();
					}
				}) as file, index}
					<details
						class="file-item"
						id={file.path}
						open={detailsStates[file.path]}
						on:toggle={(event) =>
							updateDetailsState(file.path, event)}
						on:contextmenu={(event) =>
							onFileRightClick(file, event)}
					>
						<summary>
							<span class="file-text">
								<strong>{file.basename}</strong> (Last checked: {formatDate(
									file.lastChecked
								)})
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
									data-reason-heading-depth={reason.heading
										?.depth}
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
			</details>
		{/each}
	{:else}
		{#each $incompleteFiles.toSorted((a, b) => {
			if (sortOrder === SORT_ORDER.NAME) {
				return a.basename.localeCompare(b.basename);
			} else {
				return b.lastChecked.getTime() - a.lastChecked.getTime();
			}
		}) as file, index}
			<details
				class="file-item"
				id={file.path}
				open={detailsStates[file.path]}
				on:toggle={(event) => updateDetailsState(file.path, event)}
				on:contextmenu={(event) => onFileRightClick(file, event)}
			>
				<summary>
					<span class="file-text">
						<strong>{file.basename}</strong> (Last checked: {formatDate(
							file.lastChecked
						)})
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
	{/if}
</div>

<style>
	.file-item {
		position: relative;
		margin-bottom: 1rem;
		padding: 0.5rem;
		border-radius: 6px;
	}
	.file-item::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		border-bottom: 1px solid #161616;
		/* Adjust the height to match the border width */
		height: 1px;
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
		margin-top: 6px;
		margin-bottom: 6px;
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

	.folder-group > summary {
		background-color: var(--background-secondary-alt);
		padding: 6px;
		border-radius: 6px;
	}

	.highlight {
		animation: highlightAnimation 2s ease;
		/* mix-blend-mode: var(--highlight-mix-blend-mode); */
		transition: all 0.2s ease;
	}

	@keyframes highlightAnimation {
		from {
			background-color: var(--text-highlight-bg);
		}
		to {
			background-color: transparent;
		}
	}
</style>
