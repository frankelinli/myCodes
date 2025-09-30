## 修改完成概述

已实现仅抓取 Polylang 英文 (`en`) 文章的需求，并做了相关增强。

### 关键改动

1. [getAll](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 增强：支持第二个参数传入查询对象（如 `{ lang: 'en' }`），内部使用 [URLSearchParams](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 构建查询串。
2. 新增常量：`LANG = "en"`，所有 [categories](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)、[tags](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)、[posts](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html)、[media](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 请求都带上 `?lang=en`。
3. Front Matter 增加字段：`language: en`。
4. README 更新：添加如何配置 [LANG](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 说明以及 Polylang 使用说明。
5. 代码语法检查：无报错。

### 使用方法（现在）

输出目录 `exported_posts` 中即为仅英文版本内容。

### 如需切换语言

修改脚本顶部：

### 如果想抓取所有语言

- 将调用处的 `{ lang: LANG }` 改成不传，或者把 [LANG](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 设为 `undefined` 并在调用层用条件合并： （当前实现中若不想带参数，可手动删除 `{ lang: LANG }`）

### 后续可选改进（未实现）

- 支持同时导出多语言并按 [language/分类/文章.md](vscode-file://vscode-app/c:/Users/wingxu/AppData/Local/Programs/Microsoft VS Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html) 组织。
- 增加增量更新：只抓取上次导出后的新增/更新文章。
- 媒体文件本地下载并替换正文链接。

如果还需要导出多语言或结构调整，告诉我即可继续完善。需要我再加一个多语言批量导出版本吗？