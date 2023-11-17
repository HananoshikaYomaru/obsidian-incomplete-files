## Obsidian Incomplete files

This plugin help discover your incomplete files base on given rules.

✅ Powerful, Dead Simple

Demo:

## Features

1. rule based incomplete files detection
2. show all incomplete files with issues
3. non intrusive, you install the plugin and don't need to do anything else
4. incomplete files view: see all your incomplete files in a list
   1. see last update time of this file
5. realtime udpate of your incomplete files
6. highly optimized so it is fast to analyse files

## Rules

| rule name | description | DEFAULT |
| -- | -- | -- |
| EMTPY CONTENT | **This rule cannot be turned off**. When the file has no content, it is treaded as incomplete. | ✅ |
| EMPTY CONTENT HEADING | When a heading has no content, it is treated as incomplete. | ✅ |
| INCOMPLETE STNTAX | When a file has the incomplete syntax, it is treated as incomplete. The incomplete syntax is `%% INCOMPLETE(issue which is a string) %%` or `%% INCOMPLETE %%` | ✅ |  

## Installation

### Through community plugin store

Waiting for obsidian team approval:

### Through BRAT

1. install the BRAT plugin
2. go to the plugin option, add beta plugin, copy and paste the link of this repo.
3. the plugin will automatically appear in the list of installed community plugins, enabled this plugin

### Manual installation

1. cd to `.obsidian/plugins`
2. git clone this repo
3. `cd obsidian-incomplete-files && bun install && bun run build`
4. there you go 🎉

## Give Thanks

If you are enjoying this plugin then please support my work and enthusiasm by sponsoring me on Github or buying me a coffee on <https://www.buymeacoffee.com/yomaru>.

<a href="https://www.buymeacoffee.com/yomaru" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 30px !important;width: 105px !important;" ></a> [![](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/hananoshikayomaru)
