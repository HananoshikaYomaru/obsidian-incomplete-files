import IncompleteFilesPlugin from "@/main";

export const getAllMarkdownFiles = (plugin: IncompleteFilesPlugin) => {
	const { vault } = plugin.app;
	// the plugin ignore folders
	const _ignoreFolders = plugin.settingManager.getSettings().ignoreFolders;
	const config = plugin.app.vault.config;
	// the system ignore folders
	const userExcludedFolders = config.userIgnoreFilters ?? [];
	const ignoreFolders = [..._ignoreFolders, ...userExcludedFolders].filter(
		Boolean
	);

	const files = vault.getMarkdownFiles().filter((file) => {
		// if the file.path start with the ignoreFolders or the userExcludedFolders, then return false
		return !ignoreFolders.some((folder) => file.path.startsWith(folder));
	});
	return files;
};
