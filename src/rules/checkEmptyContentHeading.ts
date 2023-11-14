import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";
import { CheckFunction } from "@/initIncompleteFiles";
import { Data } from "@/util/getDataFromFile";
import { TFile } from "obsidian";

export const checkEmptyContentHeading: CheckFunction = (
	file: TFile,
	data: Data
) => {
	// get the heading and inner content of file

	// if the heading is empty, return the reason why it is incomplete
	return [];
};
