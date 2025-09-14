# NodeJs方案下载WordPress文章到Markdown

## 项目简介

本项目是一个 Node.js 脚本工具，用于从 WordPress 站点批量下载文章，并将其内容（含元数据）转换为 Markdown 文件，保存在本地。适合需要将 WordPress 博客迁移到静态博客、备份或二次加工的用户。

## 功能特性
- 通过 WordPress REST API 批量抓取所有文章、分类、标签、作者、媒体信息
- 自动将 HTML 正文内容转换为 Markdown，支持 GFM（表格、任务列表等）
- 每篇文章自动生成带有 YAML Front Matter 的 Markdown 文件，包含标题、日期、作者、分类、标签、特色图片等元数据
- 自动处理非法文件名字符，避免保存失败

## 使用方法

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 地址

如需抓取其他 WordPress 站点，请修改 `downloadWordpressToMarkdown.js` 文件中的 `API_URL` 变量：

```js
const API_URL = "https://你的wordpress站点/wp-json/wp/v2";
```

### 3. 运行脚本

```bash
node downloadWordpressToMarkdown.js
```

脚本会自动在 `exported_posts/` 目录下生成所有 Markdown 文件。

## 依赖说明
- [unified](https://unifiedjs.com/) 及相关插件：用于 HTML → Markdown 转换
- [js-yaml](https://github.com/nodeca/js-yaml)：生成 YAML Front Matter
- [node-fetch](https://www.npmjs.com/package/node-fetch)（如需兼容 Node.js 18 以下版本需手动安装）

## 注意事项
- 默认抓取的 API 地址为 `https://haoyelaiga.com/wp-json/wp/v2`，请根据实际情况修改
- 仅支持公开可访问的 WordPress REST API
- 生成的 Markdown 文件名为文章标题，特殊字符会自动替换为下划线

## 目录结构

```
|-- downloadWordpressToMarkdown.js  # 主脚本
|-- package.json
|-- exported_posts/                 # 导出后的 Markdown 文件目录
```

## License

ISC
