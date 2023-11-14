import {
	App,
	Editor,
	EventRef,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import "@total-typescript/ts-reset";
import "@total-typescript/ts-reset/dom";
import { MySettingManager } from "@/SettingManager";

// Remember to rename these classes and interfaces!

export default class MyPlugin extends Plugin {
	settingManager: MySettingManager;
	private eventRefs: EventRef[] = [];

	async onload() {
		// initialize the setting manager
		this.settingManager = new MySettingManager(this);

		// load the setting using setting manager
		await this.settingManager.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"dice",
			"Sample Plugin",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice("This is a notice!");
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-sample-modal-simple",
			name: "Open sample modal (simple)",
			callback: () => {
				new SampleModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: "sample-editor-command",
			name: "Sample editor command",
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection("Sample Editor Command");
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: "open-sample-modal-complex",
			name: "Open sample modal (complex)",
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {
		super.onunload();
		// unload all event ref
		for (const eventRef of this.eventRefs) {
			this.app.workspace.offref(eventRef);
		}
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
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
