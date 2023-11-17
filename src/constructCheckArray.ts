import IncompleteFilesPlugin from "@/main";
import type { Data } from "@/util/getDataFromFile";
import { checkEmptyContent } from "@/rules/checkEmptyContent";
import type { TFile } from "obsidian";
import type { RawIssue } from "@/SettingsSchemas";
import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";
import { INCOMPLETE_ISSUE_TYPE } from "@/rules/issueScanners";

/**
 * given a file, check if it is incomplete. If it is incomplete, return the issue why it is incomplete
 */

export type ScanFunction = (file: TFile, data: Data) => RawIssue[];

export const constructScanArray = (plugin: IncompleteFilesPlugin) => {
	const checkArray: ScanFunction[] = [checkEmptyContent.func];
	const setting = plugin.settingManager.getSettings();

	if (setting[INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT_HEADING])
		checkArray.push(checkEmptyContentHeading.func);
	if (setting[INCOMPLETE_ISSUE_TYPE.INCOMPLETE_SYNTAX])
		checkArray.push(checkIncompleteSyntax.func);
	return checkArray;
};
