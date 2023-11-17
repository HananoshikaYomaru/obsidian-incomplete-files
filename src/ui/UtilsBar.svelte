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
	import { DropdownComponent } from "obsidian";
	import { toggleSummaries } from "@/ui/helpers/toggleSummaries";
	async function refresh() {
		await initIncompleteFiles($plugin);
	}

	function groupDropdownAction(node: HTMLElement) {
		const dropdown = new DropdownComponent(node);

		dropdown.addOption(DISPLAY_OPTION.NONE_LIST, "none-list");
		dropdown.addOption(DISPLAY_OPTION.NONE_ICON, "none-icon");
		dropdown.addOption(DISPLAY_OPTION.FOLDER_LIST, "folder-list");
		dropdown.addOption(DISPLAY_OPTION.FOLDER_ICON, "folder-icon");

		dropdown.onChange((value) => {
			// Handle dropdown value change
			$displayOption = value as DISPLAY_OPTION;
		});

		return {
			destroy() {
				// Cleanup if needed
			},
		};
	}

	function sortDropdownAction(node: HTMLElement) {
		const dropdown = new DropdownComponent(node);
		dropdown.addOption(SORT_ORDER.NAME, "sort by name");
		dropdown.addOption(SORT_ORDER.TIME, "sort by time");
		// ... more options ...

		dropdown.onChange((value) => {
			// Handle dropdown value change
			$sortBy = value as SORT_ORDER;
		});

		return {
			destroy() {
				// Cleanup if needed
			},
		};
	}
</script>

<div class="incomplete-files-utils">
	<div id="group-dropdown-container" use:groupDropdownAction />
	<div id="sort-dropdown-container" use:sortDropdownAction />
	<button on:click={refresh}>
		<Icon name="rotate-cw" />
	</button>
	<button on:click={toggleSummaries}>
		<!-- toggle collapse summary -->
		<Icon
			name={$areSummariesExpanded
				? "chevrons-down-up"
				: "chevrons-up-down"}
		/>
	</button>
</div>
