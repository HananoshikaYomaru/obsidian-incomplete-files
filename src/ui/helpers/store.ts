import { writable } from "svelte/store";
import IncompleteFilesPlugin from "@/main";
import type { IncompleteFile, RawIssue } from "@/SettingsSchemas";
import { SORT_ORDER, DISPLAY_OPTION } from "@/ui/helpers/enums";

export const plugin = writable<IncompleteFilesPlugin>();
export const incompleteFiles = writable<IncompleteFile[]>([]);

export type Issue = Prettify<
	RawIssue & {
		file: IncompleteFile;
	}
>;
// export const issues = writable<Issue[]>([]);
// incompleteFiles.subscribe((incompleteFilesValue) => {
// 	issues.set(
// 		incompleteFilesValue.flatMap((file) => {
// 			return file.issues.map((issue) => {
// 				return {
// 					...issue,
// 					file,
// 				};
// 			});
// 		})
// 	);
// });
export const sortBy = writable<SORT_ORDER>(SORT_ORDER.NAME);
export const displayOption = writable<DISPLAY_OPTION>(DISPLAY_OPTION.NONE_LIST);
export const areSummariesExpanded = writable<boolean>(false);
export const detailsStates = writable<Record<string, boolean>>({});
export const isHighlightingBecauseClickingIssue = writable<boolean>(false);
