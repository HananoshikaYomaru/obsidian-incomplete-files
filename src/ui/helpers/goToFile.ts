import type { IncompleteFile } from "@/SettingsSchemas";

import { isHighlightingBecauseClickingIssue } from "@/ui/helpers/store";
import type { TFile } from "obsidian";
import { plugin as _plugin } from "@/ui/helpers/store";
import { get } from "svelte/store";

export function goToFile(file: IncompleteFile) {
	const plugin = get(_plugin);
	// Use the Obsidian API to open the file
	const tfile = plugin.app.vault.getAbstractFileByPath(file.path) as TFile;
	if (tfile) {
		isHighlightingBecauseClickingIssue.set(true);
		plugin.app.workspace.getLeaf(false).openFile(tfile as TFile, {
			active: true,
		});
	}
}
