import { visit } from "unist-util-visit";
import { INCOMPLETE_ISSUE_TYPE } from "@/rules/INCOMPLETE_ISSUE_TYPE";
import type { CheckFunction } from "@/constructCheckArray";
import type { Data } from "@/util/getDataFromFile";
import type { TFile } from "obsidian";
import type { Issue } from "@/SettingsSchemas";
import type { Heading } from "mdast";
import { nodeToString } from "@/util/nodeToString";

const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-dot-dashed"><path d="M10.1 2.18a9.93 9.93 0 0 1 3.8 0"/><path d="M17.6 3.71a9.95 9.95 0 0 1 2.69 2.7"/><path d="M21.82 10.1a9.93 9.93 0 0 1 0 3.8"/><path d="M20.29 17.6a9.95 9.95 0 0 1-2.7 2.69"/><path d="M13.9 21.82a9.94 9.94 0 0 1-3.8 0"/><path d="M6.4 20.29a9.95 9.95 0 0 1-2.69-2.7"/><path d="M2.18 13.9a9.93 9.93 0 0 1 0-3.8"/><path d="M3.71 6.4a9.95 9.95 0 0 1 2.7-2.69"/><circle cx="12" cy="12" r="1"/></svg>`;

const func: CheckFunction = (file: TFile, data: Data) => {
	// get the heading and inner content of file

	// if a heading has no content, return the issue why it is incomplete
	// a inner heading is treated as content

	// if the heading has inner heading, it is okay. e.g.
	// # heading 1 <--- this is okay
	// ## heading 2 <--- this is okay
	// content
	// ## heading 3 <--- this is treated incomplete
	// # heading 4 <--- this is treated incomplete

	// 	return [
	// 		{
	// 			type: INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT_HEADING,
	// 			title: `H2 ${heading 3 text} is empty`,
	// 			heading: ...
	// 		},
	// 		{
	// 			type: INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT_HEADING,
	// 			title: `H1 ${heading 4 text} is empty`,
	// 			heading: ...
	// 		},
	// 	];
	// }

	if (data.body.trim() === "") {
		return [];
	}

	const issues: Issue[] = [];

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
				issues.push({
					type: INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT_HEADING,
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

	return issues;
};

export const checkEmptyContentHeading = {
	icon,
	func,
};
