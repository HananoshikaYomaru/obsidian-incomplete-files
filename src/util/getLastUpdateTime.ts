import { TFile } from "obsidian";

export const getLastUpdateTime = (file: TFile) => {
	// get the update time from the files in unix timestamp
	const lastUpdateTime = new Date(file.stat.mtime);
	return lastUpdateTime;
};
