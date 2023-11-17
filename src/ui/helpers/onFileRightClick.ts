import type { IncompleteFile } from "@/SettingsSchemas";
import { VIEW_TYPE } from "@/IncompleteFileView";
import { plugin as _plugin } from "@/ui/helpers/store";
import { Menu, TFile } from "obsidian";
import { get } from "svelte/store";
import { analyseFile } from "@/analyseFile";

export function onFileRightClick(file: IncompleteFile, event: MouseEvent) {
	const plugin = get(_plugin);
	event.preventDefault(); // Prevent the default browser context menu

	const fileItem = plugin.app.vault.getAbstractFileByPath(file.path);
	const fileMenu = new Menu();

	if (fileItem instanceof TFile) {
		fileMenu.addSeparator();
		// delete file
		fileMenu.addItem((item) => {
			item.setTitle("Delete");
			item.setIcon("trash");
			item.onClick(() => {
				plugin.app.vault.trash(fileItem, false);
			});
		});

		// reanalyze file
		fileMenu.addItem((item) => {
			item.setTitle("Reanalyze incomplete");
			item.setIcon("refresh");
			item.onClick(() => {
				analyseFile(plugin, fileItem);
			});
		});
		// Use Obsidian's internal API to show the context menu for the file
		// The API might look something like this, but refer to Obsidian's documentation or source for the exact method
		plugin.app.workspace.trigger(
			"file-menu",
			// @ts-ignore
			fileMenu,
			fileItem,
			VIEW_TYPE
		);
		fileMenu.showAtPosition({ x: event.clientX, y: event.clientY });
	}
}
