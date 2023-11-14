import {
	App,
	Editor,
	EventRef,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
} from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";
import { initIncompleteFiles } from "./initIncompleteFiles";

export default class IncompleteFilesPlugin extends Plugin {
	settingManager: MySettingManager;
	private eventRefs: EventRef[] = [];

	async onload() {
		// initialize the setting manager
		this.settingManager = new MySettingManager(this);

		// load the setting using setting manager
		await this.settingManager.loadSettings();

		await initIncompleteFiles(this);
	}

	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
