import type { IncompleteFile } from "@/SettingsSchemas";
import { DISPLAY_OPTION } from "@/ui/helpers/enums";
import { incompleteFiles as _incompleteFiles } from "@/ui/helpers/store";
import { get } from "svelte/store";

export function getOrganizeFiles(
	displayOption: DISPLAY_OPTION
): Record<string, IncompleteFile[]> {
	const incompleteFiles = get(_incompleteFiles);

	if (
		displayOption === DISPLAY_OPTION.FOLDER_LIST ||
		displayOption === DISPLAY_OPTION.FOLDER_ICON
	) {
		// Organize files by their folder paths

		return incompleteFiles.reduce((acc, file) => {
			const folderPath = file
				? file.path.split("/").slice(0, -1).join("/")
				: "";
			if (!acc[folderPath]) {
				acc[folderPath] = [];
			}
			acc[folderPath]!.push(file);
			return acc;
		}, {} as Record<string, IncompleteFile[]>);
	} else {
		return {};
	}
}
