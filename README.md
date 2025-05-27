# Obsidian Smart Excluded Plugin

This plugin provides a configuration to dynamically set `Files and links > Excluded files` option.

It is useful for users who want to manage all notes within a single vault for majority of features, while also maintiaining a somewhat(?) logically separate note-taking experience. 

For example, during quick switch, if there is no result, obsidian core will expand search results to include excluded files path automatically. 

By not managing separate set of filters with custom features, we can leverage well-defined/maintained core features.

In short, it provides a grey area between a fully separated vault and a workspace (which is layout-only).

## Features

Currently, it only supports setting `Excluded files` per workspace (using the Workspaces plugin), which addresses my primary need.

<img width="778" alt="image" src="https://github.com/user-attachments/assets/ec65d7c4-bb43-4f20-9650-a4fd5223d567" />

Planned features include adding more conditions, such as filtering based on the active note.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

