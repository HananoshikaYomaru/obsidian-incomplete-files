import { type EventRef, Plugin, TFile, TAbstractFile } from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";
import { initIncompleteFiles } from "@/initIncompleteFiles";
import { analyseFile } from "./analyseFile";
import { type CheckFunction, constructCheckArray } from "./constructCheckArray";
import { SettingTab } from "@/SettingTab";
import { checkEmptyContent } from "@/rules/checkEmptyContent";
import { IncompleteFilesView, VIEW_TYPE } from "@/IncompleteFileView";
import { getHashByFile } from "@/util/getFileByHash";
import { get } from "http";
import { getAllMarkdownFiles } from "@/util/getAllMarkdownFiles";

export default class IncompleteFilesPlugin extends Plugin {
	lock: boolean = false;

	// @ts-ignore
	settingManager: MySettingManager;
	private eventRefs: EventRef[] = [];
	checkArray: CheckFunction[] = [checkEmptyContent.func];
	newFiles = new Set<TFile>();

	async onload() {
		// initialize the setting manager
		this.settingManager = new MySettingManager(this);

		// load the setting using setting manager
		await this.settingManager.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.checkArray = constructCheckArray(this);

		this.registerView(
			VIEW_TYPE,
			(leaf) => new IncompleteFilesView(leaf, this)
		);

		this.addCommand({
			id: "open-incomplete-files-view",
			name: "Open Incomplete Files View",
			callback: () => this.activateView(),
		});

		this.addCommand({
			// force re-analyse all files
			id: "reanalyse-all",
			name: "Reanalyse all files",
			callback: async () => {
				await initIncompleteFiles(this, true);
			},
		});

		this.registerEvents();

		const statusBarEl = this.addStatusBarItem();
		statusBarEl.createEl("span", { text: `0 incomplete file` });
	}

	registerEvents() {
		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (file) {
					const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE);
					const view = leaf[0]?.view as IncompleteFilesView;
					view?.focus(file);
				}
			})
		);

		// all files are resolved, so the cache is ready:
		this.registerEvent(
			this.app.metadataCache.on("resolved", () => {
				if (this.newFiles.size > 0) {
					for (const file of this.newFiles) {
						analyseFile(this, file);
					}
					this.newFiles.clear();
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file instanceof TFile) analyseFile(this, file);
			})
		);

		this.registerEvent(
			this.app.vault.on(
				"rename",
				async (file: TAbstractFile, oldPath: string) => {
					if (!(file instanceof TFile)) return;
					// old hash is always undefined
					// const oldHash = getHashByFile(oldPath, this.app);
					const newHash = getHashByFile(file.path, this.app);
					if (!newHash) return;
					// remove the file from the setting.incompleteFiles using the old path
					this.settingManager.updateSettings((setting) => {
						setting.value.incompleteFiles =
							setting.value.incompleteFiles.filter(
								(f) => f.path !== oldPath
							);
					});

					// re-analyse the file
					await analyseFile(this, file);
				}
			)
		);

		this.registerEvent(
			this.app.vault.on("config-changed", () => {
				// re-analyse all the files
				initIncompleteFiles(this);
			})
		);

		this.app.workspace.onLayoutReady(async () => {
			await initIncompleteFiles(this);
			this.registerEvent(
				this.app.vault.on("create", (file) => {
					this.newFiles.add(file as TFile);
				})
			);
		});

		this.registerEvent(
			this.app.vault.on("delete", (file) => {
				// get the hash of the file
				const hash = getHashByFile(file.path, this.app);
				if (!hash) return;
				// remove the file from the setting.incompleteFiles
				this.settingManager.updateSettings((setting) => {
					setting.value.incompleteFiles =
						setting.value.incompleteFiles.filter(
							(f) => f.hash !== hash
						);
				});
			})
		);
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
