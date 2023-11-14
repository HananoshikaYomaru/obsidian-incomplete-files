import { getAllMarkdownFiles } from "./util/getAllMarkdownFiles";
import IncompleteFilesPlugin from "./main";
import { Data, getDataFromFile } from "@/util/getDataFromFile";
import { checkEmptyContent } from "@/rules/checkEmptyContent";
import { TFile } from "obsidian";
import { IncompleteReason } from "@/SettingsSchemas";
import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";

/**
 * given a file, check if it is incomplete. If it is incomplete, return the reason why it is incomplete
 */
export type CheckFunction = (file: TFile, data: Data) => IncompleteReason[];

const constructCheckArray = (plugin: IncompleteFilesPlugin) => {
	const checkArray: CheckFunction[] = [checkEmptyContent];
	const setting = plugin.settingManager.getSettings();

	if (setting.emptyContentHeading) checkArray.push(checkEmptyContentHeading);
	if (setting.incompleteSyntax) checkArray.push(checkIncompleteSyntax);
	return checkArray;
};

/**
 * this function
 */
export const initIncompleteFiles = async (plugin: IncompleteFilesPlugin) => {
	// get all markdown files from the vault
	const files = getAllMarkdownFiles(plugin);
	const setting = plugin.settingManager.getSettings();
	const checkArray = constructCheckArray(plugin);

	// for each files, check if it is incomplete
	for (const file of files) {
		// get the update time from the files in unix timestamp
		const lastUpdateTime = new Date(file.stat.mtime * 1000);

		// if file is in setting.incompleteFiles and the lastCheckTime is after the lastUpdateTime, then skip
		const alreadyChecked = setting.incompleteFiles.some((file) => {
			return file.path === file.path && file.lastChecked > lastUpdateTime;
		});

		if (alreadyChecked) continue; // skip this file

		const data = await getDataFromFile(plugin, file);

		// for each check function, check if the file is incomplete
		const incompleteReasons = checkArray.flatMap((checkFunction) =>
			checkFunction(file, data)
		);

		// write the incomplete file to data
		if (incompleteReasons.length > 0) {
			setting.incompleteFiles.push({
				path: file.path,
				lastChecked: lastUpdateTime,
				reasons: incompleteReasons,
				basename: file.basename,
			});
		}
	}
};
