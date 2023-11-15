import { getAllMarkdownFiles } from "@/util/getAllMarkdownFiles";
import IncompleteFilesPlugin from "@/main";
import { createNotice } from "@/util/createNotice";
import { getLastUpdateTime } from "@/util/getLastUpdateTime";
import { analyseFile } from "@/analyseFile";

export const initIncompleteFiles = async (plugin: IncompleteFilesPlugin) => {
	// get all markdown files from the vault
	const files = getAllMarkdownFiles(plugin);
	const setting = plugin.settingManager.getSettings();

	// for any files that is not in the vault, remove it from the setting
	plugin.settingManager.updateSettings((setting) => {
		setting.value.incompleteFiles = setting.value.incompleteFiles.filter(
			(file) => {
				return files.some((f) => f.path === file.path);
			}
		);
	});

	// for each files, check if it is incomplete
	for (const file of files) {
		// get the update time from the files in unix timestamp
		const lastUpdateTime = getLastUpdateTime(file);

		// if file is in setting.incompleteFiles and the lastCheckTime is after the lastUpdateTime, then skip
		const alreadyChecked = setting.incompleteFiles.some((file) => {
			return file.path === file.path && file.lastChecked > lastUpdateTime;
		});

		if (alreadyChecked) continue; // skip this file

		await analyseFile(plugin, file);
	}

	createNotice(`${setting.incompleteFiles.length} files are incomplete`);
};
