/**
 * each folder is one line, return an array of folders
 */
export const parseFolders = (folders: string) => {
	return folders
		.split("\n")
		.map((f) => f.trim())
		.filter((folder) => folder !== "");
};
