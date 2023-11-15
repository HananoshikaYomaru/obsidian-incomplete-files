import type { FileCacheEntry } from "@/typings/obsidian-ex";
import type { App, TFile } from "obsidian";

export const getFileByHash = (hash: string, app: App) => {
	// @ts-ignore
	const fileCache = app.metadataCache.fileCache as Record<
		string,
		FileCacheEntry
	>;

	// for each file in the cache
	for (const path of Object.keys(fileCache)) {
		// if the hash matches, return the file
		if (fileCache[path]!.hash === hash) {
			return app.vault.getAbstractFileByPath(path) as TFile;
		}
	}
};

export const getHashByFile = (path: string, app: App) => {
	// @ts-ignore
	const fileCache = app.metadataCache.fileCache as Record<
		string,
		FileCacheEntry
	>;

	return fileCache[path]?.hash;
};
