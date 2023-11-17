import { Plugin, TFile, TAbstractFile } from "obsidian";
import type { EventRef } from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";
import { initIncompleteFiles } from "@/initIncompleteFiles";
import { analyseFile } from "./analyseFile";
import { constructScanArray } from "./constructCheckArray";
import type { ScanFunction } from "./constructCheckArray";
import { SettingTab } from "@/SettingTab";
import { checkEmptyContent } from "@/rules/checkEmptyContent";
import { IncompleteFilesView, VIEW_TYPE } from "@/IncompleteFileView";
import { getHashByFile } from "@/util/getFileByHash";
import { get } from "svelte/store";
import { isHighlightingBecauseClickingIssue } from "@/ui/helpers/store";
import { isFileInView } from "@/util/isElementInView";

export default class IncompleteFilesPlugin extends Plugin {
	lock: boolean = false;

	// @ts-ignore
	settingManager: MySettingManager;
	private eventRefs: EventRef[] = [];
	checkArray: ScanFunction[] = [checkEmptyContent.func];
	newFiles = new Set<TFile>();

	async onload() {
		// initialize the setting manager
		this.settingManager = new MySettingManager(this);

		// load the setting using setting manager
		await this.settingManager.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.checkArray = constructScanArray(this);

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

					if (!get(isHighlightingBecauseClickingIssue))
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
				if (file instanceof TFile) {
					analyseFile(this, file);
					const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE);
					const view = leaf[0]?.view as IncompleteFilesView;
					// if the file is not in the incomplete files, focus it
					if (!isFileInView(file.path)) view?.focus(file);
				}
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

	refreshStatusBarItem = () => {
		const setting = this.settingManager.getSettings();

		// update the status bar item
		const statusBarItem = document.querySelector(
			".status-bar-item.plugin-incomplete-files"
		) as HTMLDivElement | null;
		if (statusBarItem) {
			const numIncompleteFiles = setting.incompleteFiles.length;
			const numIssues = setting.incompleteFiles.reduce(
				(acc, cur) => acc + cur.issues.length,
				0
			);
			statusBarItem.setText(
				`${numIncompleteFiles} incomplete file${
					numIncompleteFiles > 1 ? "s" : ""
				}, ${numIssues} issue${numIssues > 1 ? "s" : ""}`
			);
		}
	};

	getAllMarkdownFiles() {
		const { vault } = this.app;
		// the plugin ignore folders
		const _ignoreFolders = this.settingManager.getSettings().ignoreFolders;
		const config = this.app.vault.config;
		// the system ignore folders
		const userExcludedFolders = config.userIgnoreFilters ?? [];
		const ignoreFolders = [
			..._ignoreFolders,
			...userExcludedFolders,
		].filter(Boolean);

		const files = vault.getMarkdownFiles().filter((file) => {
			// if the file.path start with the ignoreFolders or the userExcludedFolders, then return false
			return !ignoreFolders.some((folder) =>
				file.path.startsWith(folder)
			);
		});
		return files;
	}

	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}
