import { describe, test, expect, vi } from "vitest";
import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
import { TFile } from "obsidian";
import { getDataFromTextSync } from "@/util/getDataFromFile";

// Vitest mock setup for parseYaml from Obsidian
// Note: Adjust mocking strategy as per Vitest documentation if needed
vi.mock("obsidian");

describe("checkEmptyContentHeading", () => {
	// Mock file object
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

	test("should return no incomplete reasons when the body is completely empty", () => {
		const data = getDataFromTextSync("");
		const result = checkEmptyContentHeading(mockFile, data);
		expect(result).toEqual([]);
	});

	test("should return empty for a file with no headings but with some text", () => {
		const data = getDataFromTextSync(
			"Some random text without any headings."
		);
		const result = checkEmptyContentHeading(mockFile, data);
		expect(result).toEqual([]);
	});

	test("should identify headings without content", () => {
		const data = getDataFromTextSync("# Heading 1\n\n# Heading 2\n");
		const result = checkEmptyContentHeading(mockFile, data);
		expect(result.length).toBe(2);
		expect(result[0]?.title).toMatch(/Heading 1 is empty/);
		expect(result[1]?.title).toMatch(/Heading 2 is empty/);
	});

	test("should not flag headings with content", () => {
		const data = getDataFromTextSync(
			"# Heading 1\nContent here.\n## Heading 2\nMore content."
		);
		const result = checkEmptyContentHeading(mockFile, data);
		expect(result).toEqual([]);
	});

	test("should treat headings with only subheadings as having content", () => {
		const data = getDataFromTextSync(
			"# Heading 1\n\n## Heading 2\n\n### Heading 3\n"
		);
		const result = checkEmptyContentHeading(mockFile, data);
		expect(result.length).toBe(1);
		expect(result[0]?.title).toMatch(/Heading 3 is empty/);
	});
});
