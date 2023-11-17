import { INCOMPLETE_ISSUE_TYPE } from "./INCOMPLETE_ISSUE_TYPE";
import type { IssueScanner } from "@/rules/issueScanners";
import type { Data } from "@/util/getDataFromFile";
import { TFile } from "obsidian";

export const checkEmptyContent: IssueScanner = {
	icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dashed"><path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/><path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7"/><path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8"/><path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69"/><path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/><path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7"/><path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8"/><path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69"/></svg>`,
	issueType: "EMPTY_CONTENT" as INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT,
	setting: {
		name: "Empty content",
		description: "Check if the file is empty",
		default: true,
	},
	func: (file: TFile, data: Data) => {
		// get the content of the file

		if (data.body.trim() === "") {
			return [
				{
					type: INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT,
					title: "Empty content",
				},
			];
		}
		return [];
	},
};
