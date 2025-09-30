# csrwikiPublish

Typora/Obsidian Markdown 一键发布/更新到 WordPress

## 功能简介
- 解析 Markdown Front Matter（title/slug/status/date/categories/tags/featured_image）
- Markdown 转 HTML（支持标准语法、原生 HTML、自定义 :::tip 等提示块）
- 分类/标签自动匹配与创建
- 幂等：同 slug 自动更新，未发布则新建
- 保留原发布时间，避免文章被顶到最新
- 支持 .env 配置，安全无硬编码
- 不再自动上传图片：请使用已在线的图片 URL；`featured_image` 仅支持媒体库「数字 ID」

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录复制 `.env.example` 为 `.env`，并填写你的 WordPress 信息：

```
WP_SITE=https://你的站点
WP_USER=你的用户名
WP_APP_PASS=你的应用密码
```

> **安全建议：** `.env` 请勿提交到 git 仓库！

### 3. 准备 Markdown 文件

支持标准 Markdown 及 Front Matter，例如：

````markdown
---
title: 示例标题
slug: example-post
status: publish
date: 2025-09-14 10:00:00
categories: [行业, 研究]
tags: [ESG, 可持续]
featured_image: ./cover.jpg
---

正文内容，可包含外链图片、HTML、代码块等（不再自动处理本地图片）。
````

### 4. 发布文章

```bash
node publish.js posts/你的文章.md
```

脚本行为：
- 分类/标签不存在会自动创建
- 已有 slug 自动更新，否则新建
- 不会上传本地图片（需自行上传到媒体库或使用图床）

## 进阶用法

- 支持 Docusaurus 风格提示块（如 `:::tip`）
- 可配合 WordPress 主题/插件实现自动目录、SEO、OG 图等高级功能
- 可自行拓展脚本以支持更多 Front Matter 字段

## 常见问题

- **环境变量未设置/缺失**：脚本会报错并退出，请检查 `.env` 是否填写完整。
- **封面 featured_image**：仅支持填写现有媒体库中附件的数字 ID。
- **正文图片**：请直接在 Markdown 中使用完整 URL（例如 https://.../image.jpg）。
- **应用密码获取**：WordPress 后台 -> 用户 -> 应用密码，建议专用账户。

## 依赖
- Node.js 16+
- unified/remark/rehype 生态
- 仅依赖 .env 文件，无需 dotenv 包



级别 0 采用方案总结（本地唯一真源）：

使用规则

只在本地 Markdown 修改内容 / front matter（title, slug, tags, categories 等）。

线上（WordPress 后台）不再改正文、不再手动调标签；改了也会被下一次发布覆盖或清空。

发布命令：node publish.js posts/xxx.md（或循环批量）。

成功后以 Git 管理版本，必要时用 Git 回滚。

注意事项

想删除线上标签：本地写 tags: [] 再发布。


如果担心误在线上编辑，可：
降低自己账号后台编辑习惯（标注提示）。
给别的协作者说明“只读，不在线上改文章”。



以下要点需要考虑

1. 流程约束
- 明确：线上禁止改正文/标签/分类（写在 README 顶部或仓库 CONTRIBUTING）
- 新文章统一从模板复制，确保必填字段（title / slug / status / categories / tags）

2. slug 与重命名
- 避免后改 slug，否则会在 WP 生成新文章（丢失旧链接）
- 若确需改 slug：先发布 301（WP 重定向插件）再改本地并重新发布

3. 标签 / 分类治理
- 统一命名规范（大小写、单复数）
- 定期清理低频/拼写错误标签
- 不要在本地删掉 tags 字段却期望保留线上标签（会被清空）

4. 图片与媒体
- 本地引用外链需检查是否可长期访问（自建图床或 WP 媒体库）
- 若将来想批量迁移图片，提前避免混用相对路径

5. 内部链接
- 使用 slug 形成永久链接（避免后改层级路径）
- 若采用相对路径（./other-post.md），需要后续构建链转换为站内 URL，否则 WP 不会解析

6. Front Matter 健壮性
- 防止空数组：categories: [] 可能让 WP 文章失去分类（落入 uncategorized）
- date 若为空，脚本逻辑是否保持原发布时间（确认已实现）
- featured_image 若填写非数字会失败（可加校验再考虑）

7. 回滚与审计
- 每次发布前 git commit（可用 commit hook 自动格式化）
- 发生误发布：git revert + 重新执行 publish.js
- 可加一个 simple log（例如 append 到 publish.log）记录时间、slug、动作

8. 批量发布
- 若一次性发布很多文章，注意 WP REST 限流或超时（适当加 300~500ms 延迟）
- 出错时脚本是否终止还是继续（必要时加 --continue-on-error 选项）

9. 环境与安全
- .env 仅放最小权限用户（只允许 posts 编辑）
- 不在 CI 日志输出完整请求体（避免泄漏 header）
- 若未来上 CI，确认不把 .env 提交

10. HTML / Markdown 差异
- 复杂自定义块（:::）的 HTML 输出是否与主题样式兼容；必要时在主题加 CSS
- 防止直接写 <script>（可能被主题/安全插件过滤）

11. 编码与格式
- 统一 UTF-8 LF（Windows 默认 CRLF，建议 .gitattributes 设定）
- 统一 YAML 数组风格（行内或多行）

12. 状态管理
- status: draft / publish 区分清楚；避免误把草稿推上线
- 可准备一个脚本列出本地 status=draft 但线上已 publish 的异常

13. 误操作防护（可选）
- 发布前简单校验（如 tags 非空、categories 不为空）
- 检测 slug 是否重复（本地层面）

14. 未来扩展（现在可不做）
- 拉取脚本（只读）用于偶发线上热修同步
- 内容哈希存 front matter，避免重复无改动发布
- 发布后写回 wp_id / modified_gmt（便于以后升级双向）

15. 性能与超时
- 单篇很长（>1MB）时注意 WP 超时（可分段或调 PHP 侧超时）
- 网络失败重试（指数退避）可后加

16. 监控
- 简单脚本检测最近 24h 修改的本地文件中是否未发布（基于 git diff）
- 偶尔 curl /wp-json/wp/v2/posts?slug=xxx 校验实际线上状态

快速最小待办（若还没做）：
- README 顶部加“本地唯一真源”警告
- .gitattributes 设定换行
- 提供 Markdown 模板文件（post.template.md）
- commit 前自动执行格式校验（可后加）

需要哪个点的示例或最小脚本再说。

## 批量发布 / 增量发布

已新增 `batch_publish.js`，支持递归扫描 `posts` 目录，仅发布新增或改动过的 Markdown：

### 基本用法
```bash
node batch_publish.js
```
默认：
- 扫描 `posts/`（含子目录）
- 计算每个文件内容（含 front matter）的 SHA1
- 读取 / 写入 `.publish-cache.json` 记录上次发布哈希
- 仅发布新增或内容有变化的文件

### 可选参数
```bash
node batch_publish.js --help
```
```
--root=DIR       指定根目录（默认 posts）
--all            忽略缓存，强制全部文件重新发布
--dry-run        仅显示将要发布的文件，不真正调用 API
--delay-ms=300   控制两次发布之间延迟（毫秒），避免高频请求
```

### 示例
```bash
# 模拟查看将要发布哪些文件
node batch_publish.js --dry-run

# 全量强制重发
node batch_publish.js --all

# 指定目录并增加延迟
node batch_publish.js --root=posts/notes --delay-ms=400
```

### 缓存文件说明 `.publish-cache.json`
结构示例：
```json
{
	"files": {
		"c:/path/posts/a.md": {
			"hash": "1f0f...",
			"id": 123,
			"slug": "a-post",
			"updatedAt": "2025-09-17T08:22:10.123Z"
		}
	}
}
```
删除该文件即可让所有文件重新判定（或使用 `--all`）。

### 工作流建议
1. 单篇编辑：仍用 `node publish.js posts/x.md`
2. 大量调整后：使用 `node batch_publish.js` 增量发布
3. 需要回滚：使用 git 回滚 Markdown，再运行批量脚本

### 后续可扩展点（未实现）
- `--since=<git-ref>` 基于 git 差异挑选文件
- 并发发布（需注意 WordPress 速率限制）
- 失败重试与失败报告列表
- 统计本次发布成功/失败数量
