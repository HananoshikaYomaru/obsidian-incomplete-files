import { ItemView, WorkspaceLeaf } from "obsidian";

import Component from "./incompleteFileView.svelte";

export const VIEW_TYPE = "incomplete-files-view";

export class IncompleteFilesView extends ItemView {
	// @ts-ignore
	component: Component;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
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
		this.component = new Component({
			target: this.contentEl,
			props: {
				variable: 1,
			},
		});
	}

	async onClose() {
		this.component.$destroy();
	}
}
