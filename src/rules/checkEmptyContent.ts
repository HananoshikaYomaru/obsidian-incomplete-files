import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";
import { CheckFunction } from "@/initIncompleteFiles";
import { Data } from "@/util/getDataFromFile";
import { TFile } from "obsidian";

export const checkEmptyContent: CheckFunction = (file: TFile, data: Data) => {
	// get the content of the file

	if (data.body.trim() === "") {
		return [
			{
				type: INCOMPLETE_REASON_TYPE.EMPTY_CONTENT,
				title: "Empty content",
			},
		];
	}
	return [];
};
