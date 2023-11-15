import { visit } from "unist-util-visit";
import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";
import { type CheckFunction } from "@/constructCheckArray";
import { type Data } from "@/util/getDataFromFile";
import { TFile } from "obsidian";
import { type IncompleteReason } from "@/SettingsSchemas";
import { type Heading } from "mdast";
import { nodeToString } from "@/util/nodeToString";

export const checkEmptyContentHeading: CheckFunction = (
	file: TFile,
	data: Data
) => {
	// get the heading and inner content of file

	// if a heading has no content, return the reason why it is incomplete
	// a inner heading is treated as content

	// if the heading has inner heading, it is okay. e.g.
	// # heading 1 <--- this is okay
	// ## heading 2 <--- this is okay
	// content
	// ## heading 3 <--- this is treated incomplete
	// # heading 4 <--- this is treated incomplete

	// 	return [
	// 		{
	// 			type: INCOMPLETE_REASON_TYPE.EMPTY_CONTENT_HEADING,
	// 			title: `H2 ${heading 3 text} is empty`,
	// 			heading: ...
	// 		},
	// 		{
	// 			type: INCOMPLETE_REASON_TYPE.EMPTY_CONTENT_HEADING,
	// 			title: `H1 ${heading 4 text} is empty`,
	// 			heading: ...
	// 		},
	// 	];
	// }

	if (data.body.trim() === "") {
		return [];
	}

	let incompleteReasons: IncompleteReason[] = [];

	// Traverse the AST and find headings with no content or subheadings
	visit(data.ast!, (node, index, parent) => {
		if (node.type === "heading") {
			const currentHeading = node as Heading;
			// check if the heading has content
			// this heading has content if it has a text node as its next sibling or if it has a subheading

			// Initialize flag to false
			let hasContent = false;

			// Check next siblings of the current heading
			if (
				parent &&
				Array.isArray(parent.children) &&
				index !== undefined
			) {
				for (let i = index + 1; i < parent.children.length; i++) {
					const sibling = parent.children[i];

					if (!sibling) continue;

					// If we encounter a heading of the same or higher level, stop the check
					if (
						sibling.type === "heading" &&
						sibling.depth <= currentHeading.depth
					) {
						break;
					}

					// If we find any non-heading content or a subheading, mark as having content
					if (
						sibling.type !== "heading" ||
						sibling.depth > currentHeading.depth
					) {
						hasContent = true;
						break;
					}
				}
			}

			if (!hasContent) {
				incompleteReasons.push({
					type: INCOMPLETE_REASON_TYPE.EMPTY_CONTENT_HEADING,
					// @ts-ignore
					title: `H${currentHeading.depth} ${nodeToString(
						currentHeading
					)} is empty`,
					heading: {
						depth: currentHeading.depth,
						text: nodeToString(currentHeading),
					},
				});
			}
		}
	});

	return incompleteReasons;
};
