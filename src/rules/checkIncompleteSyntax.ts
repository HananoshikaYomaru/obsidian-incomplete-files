import { visit } from "unist-util-visit";
import { type CheckFunction } from "@/constructCheckArray";
import { type Data } from "@/util/getDataFromFile";
import { TFile, getIcon } from "obsidian";
import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";
import { type IncompleteReason } from "@/SettingsSchemas";
import type { Heading, Node, Text } from "mdast";
import { nodeToString } from "@/util/nodeToString";

const icon = getIcon("pen-tool")?.outerHTML;

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

	let incompleteReasons: IncompleteReason[] = [];
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
							currentHeading
					  )} is incomplete because ${reason}`
					: `file is incomplete because ${reason}`;

				incompleteReasons.push({
					type: INCOMPLETE_REASON_TYPE.INCOMPLETE_SYNTAX,
					title: reasonTitle,
					heading: currentHeading
						? {
								depth: currentHeading.depth,
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
