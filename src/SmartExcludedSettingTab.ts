import { App, debounce, Notice, PluginSettingTab, Setting } from "obsidian";
import SmartExcludedPlugin from "./main";

export class SmartExcludedSettingTab extends PluginSettingTab {
	public plugin: SmartExcludedPlugin;

	constructor(app: App, plugin: SmartExcludedPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	public display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const plugin = this.plugin.getWorkspacesPlugin();
		if (!plugin) {
			containerEl.createEl('div', { text: 'Core plugin [Workspaces] not found. Please ensure it is enabled.' });
			return;
		}

		// Add warning about override
		const warning = containerEl.createEl('div', { cls: 'workspace-exclude-warning' });
		warning.setText('⚠️ This plugin will override the core "Files and links" excluded files setting based on the conditions below.');

		const { workspaces } = plugin;

		// List all workspaces and provide per-workspace exclude configuration
		if (workspaces.length === 0) {
			containerEl.createEl('div', { text: 'No workspaces found.' });
			return;
		}

		const notify = debounce((workspace) => {
			new Notice(`${this.plugin.name}: Excluded files for workspace "${workspace}" updated.`);
		}, 1000, true)


		Object.keys(workspaces).forEach((workspace: string) => {
			const section = containerEl.createEl('div', { cls: 'workspace-section' });
			section.createEl('h3', { text: `Workspace: ${workspace}` });

			new Setting(section)
				.setName('Excluded files')
				.setDesc('This will override the core "Files and links" excluded files setting for this workspace.')
				.addTextArea(textarea => {
					const value = this.plugin.settings.workspaceExcludes?.[workspace]?.join('\n') || '';
					textarea
						.setPlaceholder('work\npersonal')
						.setValue(value)
						.onChange(async (val) => {
							if (!this.plugin.settings.workspaceExcludes) this.plugin.settings.workspaceExcludes = {};
							this.plugin.settings.workspaceExcludes[workspace] = val.split('\n').map(s => s.trim()).filter(Boolean);
							await this.plugin.saveSettings();
							notify(workspace)
						});
				});
		});

		const section = containerEl.createEl('div');
		section.createEl('h3', { text: 'Status bar' });
		new Setting(section)
			.setName('Show active workspace in status bar')
			.setDesc('This will show the active workspace in the status bar.')
			.addToggle(toggle => {
				toggle
					.setValue(this.plugin.settings.showWorkspaceNameInStatusBar ?? false)
					.onChange(async (value) => {
						this.plugin.settings.showWorkspaceNameInStatusBar = value;
						await this.plugin.saveSettings();
						this.plugin.toggleStatusBarItem(value);
					});
			})

	}
}
