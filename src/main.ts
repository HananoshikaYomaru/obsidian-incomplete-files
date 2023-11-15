import { type EventRef, Plugin, TFile } from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";
import { initIncompleteFiles } from "@/initIncompleteFiles";
import { analyseFile } from "./analyseFile";
import { type CheckFunction, constructCheckArray } from "./constructCheckArray";
import { SettingTab } from "@/SettingTab";
import { checkEmptyContent } from "@/rules/checkEmptyContent";
import { IncompleteFilesView, VIEW_TYPE } from "@/ui/incompleteFileView";
import { State } from "@/util/State";
import { deepCompare } from "@/util/deepCompare";

type ResolvedLinkCache = Record<string, Record<string, number>>;

export default class IncompleteFilesPlugin extends Plugin {
	// @ts-ignore
	_resolvedCache: ResolvedLinkCache;
	public readonly cacheIsReady: State<boolean> = new State(
		this.app.metadataCache.resolvedLinks !== undefined
	);
	private isCacheReadyOnce = false;
	lock: boolean = false;

	// @ts-ignore
	settingManager: MySettingManager;
	private eventRefs: EventRef[] = [];
	checkArray: CheckFunction[] = [checkEmptyContent.func];

	async onload() {
		// initialize the setting manager
		this.settingManager = new MySettingManager(this);

		// load the setting using setting manager
		await this.settingManager.loadSettings();
		this.addSettingTab(new SettingTab(this.app, this));

		this.checkArray = constructCheckArray(this);

		await initIncompleteFiles(this);

		this.cacheIsReady.value =
			this.app.metadataCache.resolvedLinks !== undefined;

		// all files are resolved, so the cache is ready:
		this.app.metadataCache.on("resolved", this.onGraphCacheReady);
		// the cache changed:
		this.app.metadataCache.on("resolve", this.onGraphCacheChanged);

		this.registerView(
			VIEW_TYPE,
			(leaf) => new IncompleteFilesView(leaf, this)
		);

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

	/**
	 * this will be called the when the cache is ready.
	 * And this will hit the else clause of the `onGraphCacheChanged` function
	 */
	private onGraphCacheReady = () => {
		// console.log("Graph cache is ready");
		this.cacheIsReady.value = true;
		this.onGraphCacheChanged();
	};

	/**
	 * check if the cache is ready and if it is, update the global graph
	 */
	public onGraphCacheChanged = () => {
		// check if the cache actually updated
		// Obsidian API sends a lot of (for this plugin) unnecessary stuff
		// with the resolve event
		if (
			this.cacheIsReady.value &&
			!deepCompare(
				this._resolvedCache,
				this.app.metadataCache.resolvedLinks
			)
		) {
			this._resolvedCache = structuredClone(
				this.app.metadataCache.resolvedLinks
			);

			if (!this.isCacheReadyOnce) {
				// init incomplete files
				initIncompleteFiles(this);
			}
		} else {
			// init incomplete files
			if (!this.isCacheReadyOnce) {
				initIncompleteFiles(this);
				this.isCacheReadyOnce = true;
			}
			// console.log(
			//   "changed but ",
			//   this.cacheIsReady.value,
			//   " and ",
			//   deepCompare(this._resolvedCache, this.app.metadataCache.resolvedLinks)
			// );
		}
	};

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
