import { EventRef, Plugin, TFile } from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";
import {
	CheckFunction,
	analyseFile,
	constructCheckArray,
	initIncompleteFiles,
} from "./initIncompleteFiles";
import { SettingTab } from "@/SettingTab";
import { checkEmptyContent } from "@/rules/checkEmptyContent";

export default class IncompleteFilesPlugin extends Plugin {
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

		// register modify event , when the file is modified, we need to check if it is incomplete
		const modifyEventRef = this.app.vault.on(
			"modify",
			this.onFileModified.bind(this)
		);
		this.eventRefs.push(modifyEventRef);
		this.registerEvent(modifyEventRef);
	}

	async onFileModified(file: TFile) {
		console.log("on file modified: ");
		await analyseFile(this, file);
	}

	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}
