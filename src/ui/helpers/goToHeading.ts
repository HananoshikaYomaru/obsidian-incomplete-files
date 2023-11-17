import type { IncompleteFile, Heading } from "@/SettingsSchemas";
import type { TFile } from "obsidian";
import {
	plugin as _plugin,
	isHighlightingBecauseClickingIssue,
} from "@/ui/helpers/store";
import { get } from "svelte/store";

export function goToHeading(file: IncompleteFile, heading: Heading) {
	const plugin = get(_plugin);
	const tfile = plugin.app.vault.getAbstractFileByPath(file.path) as TFile;

	if (!tfile) return;
	const cache = plugin.app.metadataCache.getFileCache(tfile);
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
	isHighlightingBecauseClickingIssue.set(true);
	plugin.app.workspace
		.getLeaf(false)
		.openFile(tfile as TFile, { active: true, eState });
}
