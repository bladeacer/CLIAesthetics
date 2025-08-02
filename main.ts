import { App, Editor, MarkdownView, ItemView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceContainer } from 'obsidian';

interface CLIAesthPluginSettings {
	mySetting: string;
}

declare module "obsidian" {
	interface App {
		internalPlugins: {
			plugins: {
				switcher: { enabled: boolean };
			};
		};
		commands: {
			executeCommandById: (commandID: string) => boolean;
		};
	}
}


export default class CLIAesthPlugin extends Plugin {
	settings: CLIAesthPluginSettings;

	async onload() {
		const { workspace } = this.app;
		this.registerEvent(this.app.workspace.on('active-leaf-change', async leaf => {
			const currentView = leaf?.view;
			if (currentView.getViewType() === 'empty') {
				new Notice("New tab detected with display text:\n" + currentView.getDisplayText());
			}
		}));

		// this.addRibbonIcon('dice', 'Activate view', () => {
		// 	new Notice("Current view is: ");
		// 	new Notice(workspace);
		// });

		// // This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'CLI Aesthethics Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!');
		// });
		// // Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample CLI modal (simple)',
			callback: () => {
				new CLIAesthModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new CLIAesthModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CLIAestSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class CLIAesthModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class CLIAestSettingTab extends PluginSettingTab {
	plugin: CLIAesthPlugin;

	constructor(app: App, plugin: CLIAesthPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
		.setName('Setting #1')
		.setDesc('It\'s a secret')
		.addText(text => text
			 .setPlaceholder('Enter your secret')
			 .setValue(this.plugin.settings.mySetting)
			 .onChange(async (value) => {
				 this.plugin.settings.mySetting = value;
				 await this.plugin.saveSettings();
			 }));
	}
}
