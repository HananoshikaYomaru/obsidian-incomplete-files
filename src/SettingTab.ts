import { App, PluginSettingTab, Setting } from "obsidian";
import IncompleteFilesPlugin from "./main";
import type { ScanFunction } from "./constructCheckArray";
import { INCOMPLETE_ISSUE_TYPE, issueScanners } from "@/rules/issueScanners";
import { initIncompleteFiles } from "@/initIncompleteFiles";
import { incompleteFiles } from "@/ui/helpers/store";

export class SettingTab extends PluginSettingTab {
	plugin: IncompleteFilesPlugin;

	constructor(app: App, plugin: IncompleteFilesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	toggleCheckArray(func: ScanFunction, value: boolean) {
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

		// new Setting(containerEl)
		// 	.setName("Empty content heading")
		// 	.setDesc(
		// 		"If the heading has no content, it will be treated as incomplete"
		// 	)
		// 	.addToggle((toggle) => {
		// 		toggle
		// 			.setValue(
		// 				this.plugin.settingManager.getSettings()
		// 					.emptyContentHeading
		// 			)
		// 			.onChange((value) => {
		// 				this.plugin.settingManager.updateSettings((setting) => {
		// 					setting.value.emptyContentHeading = value;
		// 					this.toggleCheckArray(
		// 						checkEmptyContentHeading.func,
		// 						value
		// 					);
		// 				});
		// 			});
		// 	});

		// new Setting(containerEl)
		// 	.setName("Incomplete syntax")
		// 	.setDesc(
		// 		"If the file has an incomplete syntax, it will be treated as incomplete"
		// 	)
		// 	.addToggle((toggle) => {
		// 		toggle
		// 			.setValue(
		// 				this.plugin.settingManager.getSettings()
		// 					.incompleteSyntax
		// 			)
		// 			.onChange((value) => {
		// 				this.plugin.settingManager.updateSettings((setting) => {
		// 					setting.value.incompleteSyntax = value;
		// 					this.toggleCheckArray(
		// 						checkIncompleteSyntax.func,
		// 						value
		// 					);
		// 				});
		// 			});
		// 	});

		new Setting(containerEl)
			.setName("Complete property")
			.setDesc(
				"The properties to mark a file as complete. e.g. 'complete: true' or 'status: complete'"
			)
			.addText((text) => {
				text.setValue(
					this.plugin.settingManager.getSettings().completeProperty
				).onChange((value) => {
					this.plugin.settingManager.updateSettings((setting) => {
						setting.value.completeProperty = value;
					});
				});
			});

		for (const scanner of issueScanners) {
			// we don't have the setting for empty content
			if (scanner.issueType === INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT)
				continue;
			const issueType = scanner.issueType as Exclude<
				INCOMPLETE_ISSUE_TYPE,
				INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT
			>;
			new Setting(containerEl)
				.setName(scanner.setting.name)
				.setDesc(scanner.setting.description)
				.addToggle((toggle) => {
					toggle
						.setValue(
							this.plugin.settingManager.getSettings()[issueType]
						)
						.onChange((value) => {
							const newSetting =
								this.plugin.settingManager.updateSettings(
									(setting) => {
										setting.value[issueType] = value;
										this.toggleCheckArray(
											scanner.func,
											value
										);

										// if we turn it off, we simply remove all the issues with that issue type from the incomplete files
										if (!value) {
											setting.value.incompleteFiles =
												setting.value.incompleteFiles.map(
													(incompleteFile) => {
														return {
															...incompleteFile,
															issues: incompleteFile.issues.filter(
																(issue) =>
																	issue.type !==
																	issueType
															),
														};
													}
												);
										} else {
											// we reanalyse all the files
											initIncompleteFiles(
												this.plugin,
												true
											);
										}
									}
								);
							// update the store
							// FIXME: this should not be do here if consider architecture, but it is fine for now
							incompleteFiles.set(newSetting.incompleteFiles);
							// refresh the status bar item
							this.plugin.refreshStatusBarItem();
						});
				});
		}

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
