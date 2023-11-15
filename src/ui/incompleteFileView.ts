import { ItemView, WorkspaceLeaf } from "obsidian";

import Component from "./incompleteFileView.svelte";
import type IncompleteFilesPlugin from "@/main";
import { incompleteFiles, plugin } from "@/ui/store";

export const VIEW_TYPE = "incomplete-files-view";

export class IncompleteFilesView extends ItemView {
	// @ts-ignore
	component: Component;
	plugin: IncompleteFilesPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: IncompleteFilesPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getIcon(): string {
		return "cross";
	}

	getViewType() {
		return VIEW_TYPE;
	}

	getDisplayText() {
		return "Incomplete Files";
	}

	async onOpen() {
		console.log("onOpen");
		// initialize the store
		this.component = new Component({
			target: this.contentEl,
			props: {
				// incompleteFiles:
				// 	this.plugin.settingManager.getSettings().incompleteFiles,
			},
		});
		plugin.set(this.plugin);
		incompleteFiles.set(
			this.plugin.settingManager.getSettings().incompleteFiles
		);
	}

	async onClose() {
		this.component.$destroy();
	}
}
