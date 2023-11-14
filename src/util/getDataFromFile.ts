import { TFile, parseYaml, Plugin } from "obsidian";
import { stripCr } from "./strings";
import { getYAMLText, splitYamlAndBody } from "./yaml";

/**
 * this is the sync version of getDataFromFile
 * @param plugin
 * @param text
 * @returns
 */
export const getDataFromTextSync = (text: string) => {
	const yamlText = getYAMLText(text);
	const { body } = splitYamlAndBody(text);

	return {
		text,
		yamlText,
		yamlObj: yamlText
			? (parseYaml(yamlText) as { [x: string]: any })
			: null,
		body,
	};
};

export const getDataFromFile = async (plugin: Plugin, file: TFile) => {
	const text = stripCr(await plugin.app.vault.read(file));
	return getDataFromTextSync(text);
};

export type Data = ReturnType<typeof getDataFromTextSync>;
