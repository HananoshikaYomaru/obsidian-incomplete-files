import { visit } from "unist-util-visit";
import type { CheckFunction } from "@/constructCheckArray";
import type {Data} from "@/util/getDataFromFile";
import { TFile } from "obsidian";
import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";
import type {IncompleteReason} from "@/SettingsSchemas";
import type { Heading, Node, Text } from "mdast";
import { nodeToString } from "@/util/nodeToString";

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-x"><path d="M11 12H3"/><path d="M16 6H3"/><path d="M16 18H3"/><path d="m19 10-4 4"/><path d="m15 10 4 4"/></svg>`;

/**
 *  %% INCOMPLETE(reason which is a string) %%
 * %% INCOMPLETE %%
 */
const syntaxRegex = /%%\s*INCOMPLETE(?:\(([^)]+)\))?\s*%%/g;

const func: CheckFunction = (file: TFile, data: Data) => {
	// get the content of the file

	// if the body is completely empty, return []

	// if the body contain the incomplete syntax, return the reason why it is incomplete
	// associate the reason with the closest heading above it.
	// if there is no heading above it, don't need to associate. e.g.

	// INCOMPLETE(no banner image)
	// # HEADING 1
	// this is some content
	// %%    INCOMPLETE(not enough content) %%

	// 	return [
	// 		{
	// 			type: INCOMPLETE_REASON_TYPE.INCOMPLETE_SYNTAX,
	// 			title: `file is incomplete because no banner image`,
	// 		},
	// 		{
	// 			type: INCOMPLETE_REASON_TYPE.INCOMPLETE_SYNTAX,
	// 			title: `H1 ${heading 1 text} is incomplete because not enough content`,
	// 			heading: ...
	// 		},
	// 	];
	// }

	if (data.body.trim() === "") {
		return [];
	}

	const incompleteReasons: IncompleteReason[] = [];
	// @ts-ignore
	let currentHeading: Heading = null;

	visit(data.ast!, (node: Node) => {
		if (node.type === "heading") {
			currentHeading = node as Heading;
		} else if (node.type === "text") {
			const matches = (node as Text).value.matchAll(syntaxRegex);

			for (const match of matches) {
				const reason = match[1] ?? "some reason"; // Capture the incomplete reason
				const reasonTitle = currentHeading
					? `H${currentHeading.depth} ${nodeToString(
							// @ts-ignore
							currentHeading
					  )} is incomplete because ${reason}`
					: `file is incomplete because ${reason}`;

				incompleteReasons.push({
					type: INCOMPLETE_REASON_TYPE.INCOMPLETE_SYNTAX,
					title: reasonTitle,
					heading: currentHeading
						? {
								depth: currentHeading.depth,
								// @ts-ignore
								text: nodeToString(currentHeading),
						  }
						: undefined,
				});
			}
		}
	});

	return incompleteReasons;
};

export const checkIncompleteSyntax = {
	icon,
	func,
};
