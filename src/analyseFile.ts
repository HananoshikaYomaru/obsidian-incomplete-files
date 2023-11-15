import IncompleteFilesPlugin from "@/main";
import { getDataFromFile } from "@/util/getDataFromFile";
import { TFile } from "obsidian";
import { getLastUpdateTime } from "@/util/getLastUpdateTime";

export const analyseFile = async (
	plugin: IncompleteFilesPlugin,
	file: TFile
) => {
	const data = await getDataFromFile(plugin, file);

	// for each check function, check if the file is incomplete
	const incompleteReasons = plugin.checkArray.flatMap((checkFunction) =>
		checkFunction(file, data)
	);

	// write the incomplete file to data
	plugin.settingManager.updateSettings((setting) => {
		// remove the files with this path
		setting.value.incompleteFiles = setting.value.incompleteFiles.filter(
			(f) => f.path !== file.path
		);

		if (incompleteReasons.length > 0)
			// push a new entry
			setting.value.incompleteFiles.push({
				path: file.path,
				lastChecked: getLastUpdateTime(file),
				tags: data.tags,
				reasons: incompleteReasons,
				basename: file.basename,
			});
	});
};
