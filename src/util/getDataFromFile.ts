import { TFile, parseYaml, Plugin } from "obsidian";
import { stripCr } from "./strings";
import { getYAMLText, splitYamlAndBody } from "./yaml";
import { matchTagRegex } from "@/util/regex";
import remarkParse from "remark-parse";
import { unified } from "unified";

const processor = unified().use(remarkParse);

/**
 * this is the sync version of getDataFromFile
 * @param plugin
 * @param text
 * @returns
 */
export const getDataFromTextSync = (text: string) => {
	const yamlText = getYAMLText(text);
	const { body } = splitYamlAndBody(text);

	const yamlObj = yamlText
		? // eslint-disable-next-line @typescript-eslint/no-explicit-any
		  (parseYaml(yamlText) as { [x: string]: any })
		: null;

	// get the tags from the yaml
	const tags: string[] = yamlObj?.tags ?? [];
	// get the tags from body
	tags.push(...matchTagRegex(body));

	const ast = body.trim() === "" ? null : processor.parse(body);

	return {
		text,
		yamlText,
		yamlObj,
		tags,
		body,
		ast,
	};
};

export const getDataFromFile = async (plugin: Plugin, file: TFile) => {
	const text = stripCr(await plugin.app.vault.read(file));
	return getDataFromTextSync(text);
};

export type Data = ReturnType<typeof getDataFromTextSync>;
