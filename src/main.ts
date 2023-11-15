import { type EventRef, Plugin, TFile } from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";
import { initIncompleteFiles } from "./initIncompleteFiles";
import { analyseFile } from "./analyseFile";
import { type CheckFunction, constructCheckArray } from "./constructCheckArray";
import { SettingTab } from "@/SettingTab";
import { checkEmptyContent } from "@/rules/checkEmptyContent";
import { IncompleteFilesView, VIEW_TYPE } from "@/ui/incompleteFileView";

export default class IncompleteFilesPlugin extends Plugin {
	// @ts-ignore
	settingManager: MySettingManager;
	private eventRefs: EventRef[] = [];
	checkArray: CheckFunction[] = [checkEmptyContent];

	async onload() {
		// initialize the setting manager
		this.settingManager = new MySettingManager(this);

		// load the setting using setting manager
		await this.settingManager.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.checkArray = constructCheckArray(this);

		await initIncompleteFiles(this);

		this.registerView(VIEW_TYPE, (leaf) => new IncompleteFilesView(leaf));

		this.addCommand({
			id: "open-example-view",
			name: "Open Incomplete Files View",
			callback: () => this.activateView(),
		});

		// register modify event , when the file is modified, we need to check if it is incomplete
		const modifyEventRef = this.app.vault.on(
			// @ts-ignore
			"modify",
			this.onFileModified.bind(this)
		);
		this.eventRefs.push(modifyEventRef);
		this.registerEvent(modifyEventRef);
	}

	async onFileModified(file: TFile) {
		await analyseFile(this, file);
	}

	activateView() {
		let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];

		if (!leaf) {
			leaf = this.app.workspace.getRightLeaf(false);
			leaf.setViewState({
				type: VIEW_TYPE,
			});
		}

		this.app.workspace.revealLeaf(leaf);
	}

	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}
