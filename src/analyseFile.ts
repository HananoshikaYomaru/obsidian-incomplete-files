import IncompleteFilesPlugin from "@/main";
import { getDataFromFile } from "@/util/getDataFromFile";
import { TFile } from "obsidian";
import { getLastUpdateTime } from "@/util/getLastUpdateTime";
import { incompleteFiles } from "@/ui/helpers/store";
import { getHashByFile } from "@/util/getFileByHash";

export const analyseFile = async (
	plugin: IncompleteFilesPlugin,
	file: TFile
) => {
	const data = await getDataFromFile(plugin, file);

	// for each check function, check if the file is incomplete
	const issues = plugin.checkArray.flatMap((checkFunction) =>
		checkFunction(file, data)
	);

	// write the incomplete file to data
	const newSetting = plugin.settingManager.updateSettings((setting) => {
		// remove the files with this path
		setting.value.incompleteFiles = setting.value.incompleteFiles.filter(
			(f) => f.path !== file.path
		);

		if (issues.length > 0)
			// push a new entry
			setting.value.incompleteFiles.push({
				hash: getHashByFile(file.path, plugin.app)!,
				path: file.path,
				lastChecked: getLastUpdateTime(file),
				tags: data.tags,
				issues: issues,
				basename: file.basename,
			});
	});

	// update the store
	incompleteFiles.set(newSetting.incompleteFiles);
	// update the status bar item
	const statusBarItem = document.querySelector(
		".status-bar-item.plugin-incomplete-files"
	) as HTMLDivElement | null;
	if (statusBarItem) {
		statusBarItem.setText(
			`${newSetting.incompleteFiles.length} incomplete files`
		);
	}
};
