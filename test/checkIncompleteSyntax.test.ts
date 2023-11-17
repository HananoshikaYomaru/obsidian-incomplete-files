import { describe, test, expect, vi } from "vitest";
import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";
import type {TFile} from "obsidian";
import { getDataFromTextSync } from "@/util/getDataFromFile";

vi.mock("obsidian");

describe("checkIncompleteSyntax", () => {
	// @ts-ignore
	const mockFile: TFile = {
		path: "test.md",
		name: "test.md",
		stat: {
			ctime: 0,
			mtime: 0,
			size: 0,
		},
		basename: "test",
		extension: "md",
	};

	test("should return empty array for a file with no content", () => {
		const markdown = "";
		const data = getDataFromTextSync(markdown);
		const result = checkIncompleteSyntax.func(mockFile, data);
		expect(result).toEqual([]);
	});

	test("should identify incomplete syntax without heading", () => {
		const markdown =
			"this is some content\n%% INCOMPLETE(no banner image) %% ";
		const data = getDataFromTextSync(markdown);
		const result = checkIncompleteSyntax.func(mockFile, data);
		expect(result.length).toBe(1);
		expect(result[0]?.title).toBe(
			"file is incomplete because no banner image"
		);
	});

	test("should associate incomplete syntax with closest heading", () => {
		const markdown =
			"# Heading 1\nContent here.\n%%   INCOMPLETE(not enough content) %%";
		const data = getDataFromTextSync(markdown);
		const result = checkIncompleteSyntax.func(mockFile, data);
		expect(result.length).toBe(1);
		expect(result[0]?.title).toMatch(
			/H1 Heading 1 is incomplete because not enough content/
		);
		expect(result[0]?.heading).toBeDefined();
	});

	test("should identify multiple incomplete syntax and corresponding headings", () => {
		const markdown = `
# Heading 1
Content here.
%%   INCOMPLETE(not enough content) %%
## Heading 2
Content here.
%%   INCOMPLETE(not enough content) %%
### Heading 3
Content here.
%%   INCOMPLETE(not enough content) %%
`;
		const data = getDataFromTextSync(markdown);
		const result = checkIncompleteSyntax.func(mockFile, data);
		expect(result.length).toBe(3);
		expect(result[0]?.title).toMatch(
			/H1 Heading 1 is incomplete because not enough content/
		);
		expect(result[0]?.heading).toBeDefined();
		expect(result[1]?.title).toMatch(
			/H2 Heading 2 is incomplete because not enough content/
		);
		expect(result[1]?.heading).toBeDefined();
		expect(result[2]?.title).toMatch(
			/H3 Heading 3 is incomplete because not enough content/
		);
	});
});
