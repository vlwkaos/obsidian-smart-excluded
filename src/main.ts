import { Notice, Plugin } from 'obsidian';
import { WorkspacesPluginInstance } from 'obsidian-typings';
import { SmartExcludedSettingTab } from './SmartExcludedSettingTab';

interface SmartExcludedSettings {
	workspaceExcludes: Record<string, (string | RegExp)[]>;
	showWorkspaceNameInStatusBar?: boolean;
}

const DEFAULT_SETTINGS: SmartExcludedSettings = {
	workspaceExcludes: {}
}

export default class SmartExcludedPlugin extends Plugin {
	public settings: SmartExcludedSettings;


	private __previousActiveWorkspace: string | null = null;

	private __statusBarItemEl: HTMLElement;

	public async onload() {
		await this.loadSettings();

		this.__statusBarItemEl = this.addStatusBarItem();

		this.addSettingTab(new SmartExcludedSettingTab(this.app, this));
		// There is no exposed event for workspace change, so we use layout-change as a workaround
		this.registerEvent(this.app.workspace.on('layout-change', () => {
			const currentActiveWorkspace = this.getWorkspacesPlugin()?.activeWorkspace;
			const activeWorkspaceChanged = currentActiveWorkspace !== this.__previousActiveWorkspace;
			if (!activeWorkspaceChanged) return;
			this.setUserIgnoredFiltersByWorkspace(this.getWorkspacesPlugin()?.activeWorkspace);
			this.__previousActiveWorkspace = currentActiveWorkspace ?? null;
			this.__statusBarItemEl?.setText(this.getWorkspacesPlugin()?.activeWorkspace ?? 'Workspace not set');
		}))

		this.addCommand({
			id: 'smart-excluded-disable',
			name: `${this.name}: Clear excluded files setting temporarily`,
			callback: () => {
				this.setUserIgnoredFiltersByWorkspace('')
			}
		})

		this.toggleStatusBarItem(this.settings.showWorkspaceNameInStatusBar ?? false);
	}
	public get name() {
		return 'Smart excluded'
	}

	public toggleStatusBarItem(force?: boolean) {
		if (!this.__statusBarItemEl) return;
		const cls = 'smart-excluded-statusbar--hidden'
		const hidden = this.__statusBarItemEl.classList.contains(cls)
		this.__statusBarItemEl.classList.toggle(cls, force === undefined ? !hidden : !force);
	}

	public onunload() {
	}

	public async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	public async saveSettings() {
		await this.saveData(this.settings);
	}

	public getWorkspacesPlugin(): WorkspacesPluginInstance | null {
		const workspacesPlugin = this.app.internalPlugins.getEnabledPluginById('workspaces');
		if (!workspacesPlugin) {
			new Notice('Core plugin "Workspaces" not found. Please ensure it is enabled.');
			return null;
		}
		return workspacesPlugin
	}

	public setUserIgnoredFiltersByWorkspace(workspaceName?: string) {
		const plugin = this.getWorkspacesPlugin();
		if (!plugin) return;
		const workspace = workspaceName ?? plugin.activeWorkspace;
		const excludes = this.settings.workspaceExcludes[workspace] ?? [];
		// Excluded files setting
		this.app.vault.setConfig('userIgnoreFilters', excludes)
		new Notice(`${this.name}: Excluded files set for "${workspace}"`);
	}

}

