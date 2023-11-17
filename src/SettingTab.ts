import { App, PluginSettingTab, Setting } from "obsidian";
import IncompleteFilesPlugin from "./main";
import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
import type {CheckFunction} from "./constructCheckArray";
import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";

export class SettingTab extends PluginSettingTab {
	plugin: IncompleteFilesPlugin;

	constructor(app: App, plugin: IncompleteFilesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	toggleCheckArray(func: CheckFunction, value: boolean) {
		if (value) {
			this.plugin.checkArray.push(func);
		} else {
			this.plugin.checkArray = this.plugin.checkArray.filter(
				(checkFunction) => {
					return checkFunction !== func;
				}
			);
		}
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Empty content heading")
			.setDesc(
				"If the heading has no content, it will be treated as incomplete"
			)
			.addToggle((toggle) => {
				toggle
					.setValue(
						this.plugin.settingManager.getSettings()
							.emptyContentHeading
					)
					.onChange((value) => {
						this.plugin.settingManager.updateSettings((setting) => {
							setting.value.emptyContentHeading = value;
							this.toggleCheckArray(
								checkEmptyContentHeading.func,
								value
							);
						});
					});
			});

		new Setting(containerEl)
			.setName("Incomplete syntax")
			.setDesc(
				"If the file has an incomplete syntax, it will be treated as incomplete"
			)
			.addToggle((toggle) => {
				toggle
					.setValue(
						this.plugin.settingManager.getSettings()
							.incompleteSyntax
					)
					.onChange((value) => {
						this.plugin.settingManager.updateSettings((setting) => {
							setting.value.incompleteSyntax = value;
							this.toggleCheckArray(
								checkIncompleteSyntax.func,
								value
							);
						});
					});
			});

		const ignoredFoldersSetting = new Setting(containerEl)
			.setName("Ignore folders")
			.setDesc("Folders to ignore. One folder per line.")
			.addTextArea((text) => {
				const realTimePreview = document.createElement("pre");
				realTimePreview.classList.add(
					"incomplete-files-settings-real-time-preview"
				);

				realTimePreview.setText(
					JSON.stringify(
						this.plugin.settingManager.getSettings().ignoreFolders,
						null,
						2
					)
				);
				text.setPlaceholder("Enter folders to ignore")
					.setValue(
						this.plugin.settingManager.getSettings()
							.ignoreFoldersString
					)
					.onChange(async (value) => {
						this.plugin.settingManager.updateSettings((setting) => {
							setting.value.ignoreFoldersString = value;
							realTimePreview.setText(
								JSON.stringify(
									this.plugin.settingManager.getSettings()
										.ignoreFolders,
									null,
									2
								)
							);
						});
					});
				text.inputEl.addClass("incomplete-files-settings-input");

				if (text.inputEl.parentElement) {
					text.inputEl.parentElement.addClass(
						"incomplete-files-settings-input-outer"
					);
				}
				text.inputEl.insertAdjacentElement("afterend", realTimePreview);

				return text;
			});
		ignoredFoldersSetting.setClass(
			"incomplete-files-settings-ignored-folders-setting"
		);
	}
}
