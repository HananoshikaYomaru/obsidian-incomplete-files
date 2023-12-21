<script lang="ts">
	import { initIncompleteFiles } from "@/initIncompleteFiles";
	import { DISPLAY_OPTION, SORT_ORDER } from "@/ui/helpers/enums";

	import Icon from "@/ui/icon.svelte";
	import {
		areSummariesExpanded,
		displayOption,
		sortBy,
		plugin,
	} from "@/ui/helpers/store";
	import { DropdownComponent, setTooltip } from "obsidian";
	import { toggleSummaries } from "@/ui/helpers/toggleSummaries";
	import { scrollToElement } from "@/ui/helpers/scrollToElement";

	async function refresh() {
		await initIncompleteFiles($plugin);
	}

	function groupDropdownAction(node: HTMLElement) {
		const dropdown = new DropdownComponent(node);

		dropdown.addOption(DISPLAY_OPTION.NONE_LIST, "list");
		dropdown.addOption(DISPLAY_OPTION.NONE_ICON, "icon");
		dropdown.addOption(DISPLAY_OPTION.FOLDER_LIST, "folder-list");
		dropdown.addOption(DISPLAY_OPTION.FOLDER_ICON, "folder-icon");

		dropdown.onChange((value) => {
			// Handle dropdown value change
			$displayOption = value as DISPLAY_OPTION;
			$sortBy = SORT_ORDER.NAME;
			// Reset sort order
			listSortByDropdown.setValue(SORT_ORDER.NAME);
			iconSortByDropdown.setValue(SORT_ORDER.NAME);
			correctDropdown();
		});

		return {
			destroy() {
				// Cleanup if needed
			},
		};
	}

	function correctDropdown() {
		// if display option become icon, show icon sort dropdown and hide list sort dropdown
		if (
			$displayOption === DISPLAY_OPTION.NONE_ICON ||
			$displayOption === DISPLAY_OPTION.FOLDER_ICON
		) {
			listSortByDropdown?.selectEl.hide();
			iconSortByDropdown?.selectEl.show();
		}
		// if display option become list, show list sort dropdown and hide icon sort dropdown
		else {
			listSortByDropdown?.selectEl.show();
			iconSortByDropdown?.selectEl.hide();
		}
	}

	let listSortByDropdown: DropdownComponent;
	let iconSortByDropdown: DropdownComponent;
	function sortDropdownAction(node: HTMLElement) {
		listSortByDropdown = new DropdownComponent(node);
		listSortByDropdown.addOption(SORT_ORDER.NAME, "sort by name");
		listSortByDropdown.addOption(SORT_ORDER.TIME, "sort by time");
		listSortByDropdown.onChange((value) => {
			// Handle dropdown value change
			$sortBy = value as SORT_ORDER;
		});

		iconSortByDropdown = new DropdownComponent(node);
		iconSortByDropdown.addOption(SORT_ORDER.NAME, "sort by name");
		iconSortByDropdown.addOption(SORT_ORDER.ISSUE, "sort by issue");
		iconSortByDropdown.onChange((value) => {
			// Handle dropdown value change
			$sortBy = value as SORT_ORDER;
		});

		correctDropdown();

		return {
			destroy() {
				// Cleanup if needed
			},
		};
	}

	function addTooltip(node: HTMLElement, text: string) {
		setTooltip(node, text);
	}
</script>

<div class="incomplete-files-utils">
	<div id="group-dropdown-container" use:groupDropdownAction />
	<div id="sort-dropdown-container" use:sortDropdownAction />
	<button on:click={refresh} use:addTooltip={"Reanalyse"}>
		<Icon name="rotate-cw" />
	</button>
	<button
		on:click={toggleSummaries}
		use:addTooltip={$areSummariesExpanded ? "Collapse" : "Expand"}
	>
		<!-- toggle collapse summary -->
		<Icon
			name={$areSummariesExpanded
				? "chevrons-down-up"
				: "chevrons-up-down"}
		/>
	</button>
	<!-- locate current file button -->
	<button
		on:click={() => {
			const activeFile = $plugin.app.workspace.getActiveFile();
			if (activeFile) scrollToElement(activeFile.path);
		}}
		use:addTooltip={"Locate"}
	>
		<Icon name="map-pin" />
	</button>
</div>
