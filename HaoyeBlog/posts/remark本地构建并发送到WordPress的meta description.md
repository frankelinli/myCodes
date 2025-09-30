---
id: 760
title: remark本地构建并发送到WordPress的meta description
slug: remark本地构建并发送到WordPress的meta description
categories:
  - notes
tags: []
---

![image-20250922234324434](https://images.haoyelaiga.com/image-20250922234324434.png)

已经搞清楚 remark 这边怎么把 Markdown 正文构建成 WordPress 的 **post content**，但想知道 **remark 生成的** `description` **元数据，怎么最终出现在 WordPress 页面** `<head>` **里的** `<meta name="description">` **标签**。

remark 构建阶段时解析 frontmatter → 得到 description；然后发送给WordPress的大袋子里存着，至于如何显示，要么用rankmath来帮我显示到head里；要么我自己写代码，让它出现在head里。



##  **remark 生成的** `description` **元数据，如何成为WordPress 页面** `<head>` **里的** `<meta name="description">`

可以把整个链路想成三段：

### **1. remark 构建阶段**

- 解析 Markdown frontmatter → 得到 `description`
- 构建脚本把它和正文一起打包成一个“文章数据对象”大袋子
- 通过 WordPress REST API 发送到 WP（这个“大袋子”里可以包含 title、content、meta 等字段）

### **2. WordPress 存储阶段**

- 你可以选择：
  - **直接写入 SEO 插件的专用字段**（比如 Rank Math 的 `_rank_math_description`）
  - **写入自定义字段**（比如 `meta_description`）
- 这一步只是存储，页面还没显示

### **3. WordPress 渲染阶段**

- **如果用 Rank Math / Yoast SEO / AIOSEO**   插件会自动读取它的专用字段，在 `<head>` 输出：

  ```html
  <meta name="description" content="你的描述">
  ```

- **如果自己写代码**   在 `functions.php` 里注册并读取自定义字段，然后用 `wp_head` 钩子输出 `<meta>` 标签

💡 **建议**   如果你已经用 Rank Math，就直接在构建脚本里把 `description` 写进 Rank Math 的字段，这样省事又稳定；如果你想完全自定义 SEO 输出，就自己注册字段并在主题里输出。



## WordPress基础功能不包括head里输出meta description

对的，**WordPress 核心（基础功能）本身并不会自动在** `<head>` **里输出** `<meta name="description">` **标签**。

默认情况下，WordPress 只会在 `<head>` 里输出一些基础信息，比如：

- `<title>`（页面标题）
- `<link rel="canonical">`（规范链接）
- RSS feed 链接
- 文章的 `rel="prev"` / `rel="next"` 导航
- 站点的 `wp_generator` 版本信息等

**但不会自动生成或输出 meta description**，原因是：

- 核心团队认为 meta description 属于 SEO 范畴，不同站点需求差异大
- 有些人希望用文章摘要，有些人希望用自定义字段，有些人希望用插件自动生成
- 所以这部分交给主题作者或 SEO 插件去实现

## 在 WordPress 输出 meta description，有三种常见方式：

1. **用 SEO 插件（最简单）**

   - 如 Rank Math、Yoast SEO、All in One SEO
   - 这些插件会在后台提供“Meta Description”输入框，并自动在 `<head>` 输出标签

2. **主题模板里手写代码**   在 `functions.php` 里添加：

   ```php
   add_action('wp_head', function() {
       if (is_singular()) {
           $desc = get_the_excerpt();
           echo '<meta name="description" content="' . esc_attr($desc) . '">' . "\n";
       }
   });
   ```

   这样会用文章摘要作为 meta description

3. **用自定义字段**

   - 在文章里加一个 `meta_description` 自定义字段
   - 在 `wp_head` 钩子里读取并输出
   - 这样可以和你 remark 构建时生成的 description 对接

【缺少 description，会导致搜索引擎自动抓正文首句（往往效果不好）。】

【👉 所以强烈建议在 frontmatter 或 WordPress 的 SEO Meta 字段里，**自己写一条 description**。】

【WordPress 本身不直接生成 `<meta name="description">`，但大多数主题会在模板里加逻辑】