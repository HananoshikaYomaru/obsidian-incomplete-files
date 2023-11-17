import {
	detailsStates,
	areSummariesExpanded,
	incompleteFiles,
} from "@/ui/helpers/store";
import { get } from "svelte/store";

/**
 * this function close all or open all the details elements
 */
export function toggleSummaries() {
	areSummariesExpanded.set(!get(areSummariesExpanded));

	// for each details element, toggle the open state to areSummariesExpanded
	// get all the incomplete files path
	// get all the folder paths as well
	// construct a map of path to open state
	// update the detailsStates store to areSummariesExpanded

	const newState = get(incompleteFiles).reduce((acc, file) => {
		const folderPath = file
			? file.path.split("/").slice(0, -1).join("/")
			: "";
		acc[folderPath] = get(areSummariesExpanded);
		acc[file.path] = get(areSummariesExpanded);
		return acc;
	}, {} as Record<string, boolean>);
	detailsStates.set(newState);
}
