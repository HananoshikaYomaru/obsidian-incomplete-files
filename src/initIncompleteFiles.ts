import { getAllMarkdownFiles } from "./util/getAllMarkdownFiles";
import IncompleteFilesPlugin from "./main";
import { Data, getDataFromFile } from "@/util/getDataFromFile";
import { checkEmptyContent } from "@/rules/checkEmptyContent";
import { TFile } from "obsidian";
import { IncompleteReason } from "@/SettingsSchemas";
import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";
import { createNotice } from "@/util/createNotice";

const getLastUpdateTime = (file: TFile) => {
	// get the update time from the files in unix timestamp
	const lastUpdateTime = new Date(file.stat.mtime * 1000);
	return lastUpdateTime;
};

/**
 * given a file, check if it is incomplete. If it is incomplete, return the reason why it is incomplete
 */
export type CheckFunction = (file: TFile, data: Data) => IncompleteReason[];

export const constructCheckArray = (plugin: IncompleteFilesPlugin) => {
	const checkArray: CheckFunction[] = [checkEmptyContent];
	const setting = plugin.settingManager.getSettings();

	if (setting.emptyContentHeading) checkArray.push(checkEmptyContentHeading);
	if (setting.incompleteSyntax) checkArray.push(checkIncompleteSyntax);
	return checkArray;
};

export const analyseFile = async (
	plugin: IncompleteFilesPlugin,
	file: TFile
) => {
	const data = await getDataFromFile(plugin, file);

	// for each check function, check if the file is incomplete
	const incompleteReasons = plugin.checkArray.flatMap((checkFunction) =>
		checkFunction(file, data)
	);

	// write the incomplete file to data

	plugin.settingManager.updateSettings((setting) => {
		// remove the files with this path
		setting.value.incompleteFiles = setting.value.incompleteFiles.filter(
			(file) => file.path !== file.path
		);

		if (incompleteReasons.length > 0)
			// push a new entry
			setting.value.incompleteFiles.push({
				path: file.path,
				lastChecked: getLastUpdateTime(file),
				reasons: incompleteReasons,
				basename: file.basename,
			});
	});
};

export const initIncompleteFiles = async (plugin: IncompleteFilesPlugin) => {
	// get all markdown files from the vault
	const files = getAllMarkdownFiles(plugin);
	const setting = plugin.settingManager.getSettings();

	// for any files that is not in the vault, remove it from the setting
	plugin.settingManager.updateSettings((setting) => {
		setting.value.incompleteFiles = setting.value.incompleteFiles.filter(
			(file) => {
				return files.some((f) => f.path === file.path);
			}
		);
	});

	// for each files, check if it is incomplete
	for (const file of files) {
		// get the update time from the files in unix timestamp
		const lastUpdateTime = getLastUpdateTime(file);

		// if file is in setting.incompleteFiles and the lastCheckTime is after the lastUpdateTime, then skip
		const alreadyChecked = setting.incompleteFiles.some((file) => {
			return file.path === file.path && file.lastChecked > lastUpdateTime;
		});

		if (alreadyChecked) continue; // skip this file

		await analyseFile(plugin, file);
	}

	createNotice(`${setting.incompleteFiles.length} files are incomplete`);
};
