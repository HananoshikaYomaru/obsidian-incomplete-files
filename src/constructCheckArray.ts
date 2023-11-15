import IncompleteFilesPlugin from "@/main";
import { type Data } from "@/util/getDataFromFile";
import { checkEmptyContent } from "@/rules/checkEmptyContent";
import { TFile } from "obsidian";
import { type IncompleteReason } from "@/SettingsSchemas";
import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";

/**
 * given a file, check if it is incomplete. If it is incomplete, return the reason why it is incomplete
 */

export type CheckFunction = (file: TFile, data: Data) => IncompleteReason[];

export const constructCheckArray = (plugin: IncompleteFilesPlugin) => {
	const checkArray: CheckFunction[] = [checkEmptyContent.func];
	const setting = plugin.settingManager.getSettings();

	if (setting.emptyContentHeading)
		checkArray.push(checkEmptyContentHeading.func);
	if (setting.incompleteSyntax) checkArray.push(checkIncompleteSyntax.func);
	return checkArray;
};
