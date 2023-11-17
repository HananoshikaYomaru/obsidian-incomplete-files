import { ItemView, TFile, WorkspaceLeaf } from "obsidian";

import Component from "@/ui/incompleteFileView.svelte";
import type IncompleteFilesPlugin from "@/main";
import { incompleteFiles, plugin } from "@/ui/helpers/store";

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
		// initialize the store
		this.component = new Component({
			target: this.contentEl,
			props: {},
		});
		plugin.set(this.plugin);
		incompleteFiles.set(
			this.plugin.settingManager.getSettings().incompleteFiles
		);
	}

	async onClose() {
		this.component.$destroy();
	}

	/**
	 * scroll to that file
	 */
	focus(file: TFile) {
		this.component.scrollToElement(file.path);
	}
}
