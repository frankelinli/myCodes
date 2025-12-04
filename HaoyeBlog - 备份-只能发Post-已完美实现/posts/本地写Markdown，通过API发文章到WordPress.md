---
id: 546
title: 本地写Markdown，通过API发文章到WordPress
slug: 本地写Markdown，通过API发文章到WordPress

categories:
  - notes
tags: []
---

在本地写Markdown文件，然后通过REST API 自动发送到WordPress。不用再通过WordPress后台发布文章了。在本地随意新增、更改Markdown，然后一键更新，WordPress站点就对应的更新内容.

把 **unified/remark/rehype 生态**和 **WordPress API** 结合，其实就是两步：

1. **在 Node.js 里处理 Markdown 内容**（解析、清洗、增强）
2. **通过 WordPress REST API 发布文章**（通常发 HTML 或 `content` 字段）。

从此让发文章、更新文章，走向质的跨越。

这样就把静态内容+WordPress结合起来了。以前喜欢静态站点的Markdown渲染功能，但是静态网站的功能都太弱鸡了。现在使用WordPress的强大控制力，结合Markdown的渲染为帖子内容。直接原地起飞了。

![spacex-Ptd-iTdrCJM-unsplash](https://images.haoyelaiga.com/spacex-Ptd-iTdrCJM-unsplash.jpg)

[ChatGPT聊天库存Markdown解析为HTML方案](https://chatgpt.com/c/68c847be-4da0-8331-96d5-84e6a77ff3cd)

## 生产级、可组合的 AST 管线：**unified + remark + rehype**（推荐用于复杂/企业项目）

适用场景：需要对 AST 操作（插入 TOC、处理 front-matter、处理自定义语法、严格的安全消毒、渲染为 React 元素等）。这是当前社区最推荐的可组合方案。[unified+1](https://unifiedjs.com/learn/guide/using-unified/?utm_source=chatgpt.com)

关键包：

- `remark-parse`（把 markdown 解析为 mdast）
- `remark-rehype`（mdast 转为 hast）
- `rehype-stringify`（把 hast 序列化为 HTML）
- `rehype-sanitize`（消毒）或 `rehype-highlight` 等插件
- `gray-matter`（解析 front-matter）

安装示例：

```
npm install unified remark-parse remark-rehype rehype-stringify rehype-sanitize rehype-highlight gray-matter
```

示例（ESM 风格）：

```
import { unified } from 'unified';
import parse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import fs from 'fs';
import matter from 'gray-matter';

const file = fs.readFileSync('example.md', 'utf8');
const { content, data } = matter(file); // front-matter

const html = await unified()
  .use(parse)                 // markdown -> mdast
  .use(remarkRehype)         // mdast -> hast (HTML AST)
  .use(rehypeHighlight)      // 代码高亮（可选）
  .use(rehypeSanitize)       // **消毒**（非常重要）
  .use(rehypeStringify)      // hast -> HTML string
  .process(content);

console.log(String(html));
```

优点：极强的可扩展性、组件化插件、官方生态活跃，且可以在转换链中插入任意处理（例如自动生成目录、替换节点等）。缺点：学习曲线比前两者高一点，但对于复杂需求非常值得。[GitHub+1](https://github.com/remarkjs/remark-rehype?utm_source=chatgpt.com)

------

## 额外实用工具/注意点

- **Front-matter**：用 `gray-matter` 解析 YAML/MDX front-matter（元数据）。（示例已包含）
- **语法高亮**：`highlight.js`、`prismjs` 或 `rehype-highlight`。[npm+1](https://www.npmjs.com/package/markdown-it-highlightjs?utm_source=chatgpt.com)
- **安全（XSS）**：任何允许用户输入 Markdown 并在浏览器显示的场景，**必须**在服务器端或渲染前对生成的 HTML 做消毒。常见工具：`rehype-sanitize`（与 unified 管线结合良好）、`dompurify`（浏览器端）或 `sanitize-html`。不要把未消毒的 HTML 直接 innerHTML 到页面。[GitHub+1](https://github.com/rehypejs/rehype-sanitize?utm_source=chatgpt.com)
- **MDX / React**：如果要把 Markdown 与 React 组件混合（博客/组件化文档），可以用 `@mdx-js/mdx` 或在 unified 管线中配合 `rehype-react`。
- **性能**：若有大量文档/高并发，建议把渲染步骤在构建时（build-time）完成并缓存 HTML，而不是每次请求都转一次 Markdown。
- **CLI / 静态站点**：很多静态站点生成器（Next.js、VitePress、Docusaurus、Gatsby 等）都基于这些库，你可以参考它们的实现做集成。



太好了 👍 你已经用上了 **unified + remark + rehype** 这个方案，那基本上就是目前社区里最灵活、最可扩展的 Markdown→HTML 流水线了。

![image-20250921021442543](https://images.haoyelaiga.com/image-20250921021442543.png)

接下来你可以根据实际需求，逐步叠加插件和配置：

------

## ✅ 常用增强点

1. **Front-matter**
    你已经看到 `gray-matter` 的用法了，可以把 YAML/JSON metadata 提取出来用于文章标题、标签、时间等。

2. **目录（TOC）生成**
    用 `remark-toc` 插件自动生成目录：

   ```
   npm install remark-toc
   ```

   ```
   .use(require('remark-toc'), { heading: 'Table of contents' })
   ```

3. **图片/链接处理**

   - `remark-gfm` → 支持 GitHub 风格 Markdown（表格、任务列表、删除线）。
   - `rehype-autolink-headings` → 自动给标题加锚点链接。
   - `rehype-slug` → 给标题生成 id，方便目录锚点跳转。

4. **安全（XSS 防护）**
    既然你打算把 HTML 输出到网页，一定要保留：

   ```
   .use(rehypeSanitize)
   ```

   如果你需要允许自定义 HTML 标签/属性，可以传自定义 schema。

5. **代码高亮**
    你现在应该是用 `rehype-highlight`，如果需要更细粒度控制（比如暗黑主题），可以切换到 `rehype-prism-plus`。

6. **性能优化**

   - 对不变的文章（例如博客），在构建时就生成 HTML，缓存结果。
   - 对用户输入的 Markdown，尽量只在必要时运行 `process()`，避免频繁解析。

------

## 🎯 可以往下扩展的方向

- 如果你网站是 React/Next.js/VitePress 之类的，可以加上 `rehype-react`，直接把 Markdown 转成 React 组件。
- 如果考虑 SEO，可以在 pipeline 里插入 `rehype-meta` 或自定义 plugin，自动给文章加 `<meta>` 标签。
- 如果文章多，可以搞一个 **自定义 plugin**，在 AST 层面做批量处理，比如自动加版权声明、替换外链、收集标题用于侧边栏。



通过 **WordPress REST API** 发文章时，`content` 字段就是一个 **HTML 字符串**。

------

## 🔗 举例

假设你用 `unified` 把 Markdown 转成了：

```
<h1>Hello</h1>
<p>This is <strong>Markdown</strong> text.</p>
<pre><code class="hljs language-js"><span class="hljs-keyword">const</span> a = 1;</code></pre>
```

那么你在请求体里就是这样：

```
{
  "title": "测试文章",
  "content": "<h1>Hello</h1>\n<p>This is <strong>Markdown</strong> text.</p>\n<pre><code class=\"hljs language-js\"><span class=\"hljs-keyword\">const</span> a = 1;</code></pre>",
  "status": "publish"
}
```

WordPress 收到后会把这段 HTML 存到 `wp_posts.post_content`，文章前端页面就直接渲染你给的 HTML 元素。

------

## ⚡ 注意

- **不会自动做 Markdown 渲染**，你传过去的就是最终要显示的 HTML。
- WordPress 默认允许大部分 HTML 标签，但部分危险标签（`<script>`）可能会被过滤。
- 代码高亮也是依赖你传的 `<pre><code class="hljs language-js">…</code></pre>` + 前端的 CSS/JS。

------

👉 换句话说：
 你在 Node.js 里 Markdown → HTML → REST API 发过去，WordPress 只是保存 & 输出，你就是文章内容的“最终控制者”。



好问题 👌 既然你已经走 **unified + remark + rehype**，那么你能渲染的不只是 Markdown → HTML，还能在 **渲染阶段加各种功能**。我给你列几个常见的增强点，方便你选择要不要加到 pipeline 里：

------

## 🔖 Markdown 基础增强

- **GFM 支持** → `remark-gfm`（表格、任务列表、删除线、自动链接等 GitHub 风格语法）。
- **数学公式** → `remark-math` + `rehype-katex`（LaTeX/KaTeX 渲染），支持 `$x^2$` 或 `$$E=mc^2$$`。
- **脚注** → `remark-footnotes`（自动把 `[^1]` 转换为脚注）。
- **自动目录** → `remark-toc`（生成目录）+ `rehype-slug`（标题 ID）+ `rehype-autolink-headings`（可点击标题）。

------

## 🎨 内容展示增强

- **代码高亮** → `rehype-highlight` 或 `rehype-prism-plus`（Prism.js 风格，行号、主题多）。
- **图片优化** → 自定义插件处理 Markdown 图片，例如：
  - 给 `<img>` 自动加 `loading="lazy"`。
  - 把本地图片路径替换为 CDN 地址。
- **视频/音频嵌入** → 自己写 remark 插件，比如 `@[youtube](id)` 转成 `<iframe>`。
- **表格增强** → `remark-gfm` 的表格配合 CSS 美化，或者额外插件加 zebra-striping。

------

## 🛡️ 安全 & 格式

- **HTML 消毒** → `rehype-sanitize`（防 XSS）。
- **HTML 压缩** → `rehype-minify`（输出更小的 HTML）。
- **SEO 元数据** → 自定义 plugin，在 `<head>` 部分插入 `<meta>` 标签，或在文章开头生成 structured data JSON-LD。

------

## 📝 编辑体验增强

- **Front-matter 提取** → `gray-matter`（解析 YAML/JSON front-matter）。
- **自动加版权声明 / 文章签名** → 在 AST 末尾插入一个 `<p>© 2025 Jerry</p>`。
- **链接处理** → `rehype-external-links`（外链自动加 `target="_blank" rel="noopener noreferrer"`）。
- **表情支持** → `remark-emoji`（`:smile:` → 😄）。

------

## 🚀 高阶玩法

- **自定义语法**：自己写 remark 插件，例如 `:::note` 转成 `<div class="note">…</div>`。
- **React 组件渲染**：用 `rehype-react` 把 Markdown 转成 React 组件树（如果你有 React 前端）。
- **MDX**：用 `@mdx-js/mdx`，在 Markdown 中直接写 React/Vue/Svelte 组件。
- **批量生成目录 / 索引**：插件遍历所有文章 AST，收集标题，生成 sitemap / RSS feed。

------

## 🎯 总结

你目前的 pipeline（`remark-parse → remark-gfm → remark-rehype → rehype-highlight → rehype-sanitize → rehype-stringify`）已经能：
 ✅ 支持常见 Markdown
 ✅ 生成安全 HTML
 ✅ 带代码高亮

你还可以加：

- `remark-toc`（目录）
- `remark-math` + `rehype-katex`（数学公式）
- `rehype-slug` + `rehype-autolink-headings`（锚点标题）
- `rehype-external-links`（外链处理）
- `remark-emoji`（表情）

你在本地用 Markdown 渲染文章 **123.md** → 转成 HTML → 通过 WordPress REST API 发到某一篇文章（`POST /wp-json/wp/v2/posts/:id`），只会影响这篇文章的内容，不会波及其他文章。

------

### 🔍 原理

- WordPress 每篇文章的内容存在数据库表 `wp_posts.post_content`。
- 你通过 API 更新时，只更新了指定文章 ID 的 `post_content` 字段。
- 其他文章的内容完全不变。

------

### ⚠️ 唯一可能影响到其他文章的情况

- 如果你的 HTML 依赖全局的 **CSS/JS 样式**（比如你生成了 `<div class="tip">`），而你的主题全局加载了样式文件，那其他文章也能用这个样式。
  - 但这属于样式共享，不会改动其他文章的内容。

------

👉 所以结论：
 渲染出来的 HTML **只影响当前文章**，其他文章安全无虞。



等于把wordpress的一些处理工作给移出来了，在我自己的电脑上来处理了。

###### ChatGPT 說：

完全没错 ✅ 你抓住了核心。

你现在的做法，其实就是：

- **WordPress 原本做的事**：
  - 接收 Markdown/富文本
  - 转换成 HTML（段落、标题、代码块、目录等等）
  - 存数据库
- **你现在的做法**：
  - 在自己电脑（Node.js）里完成：Markdown → HTML（含代码高亮、ToC、自定义组件）
  - 然后把最终结果 **直接塞给 WordPress**，让它只负责存储和展示

------

### 🔹 优势

- 你控制了渲染规则（高亮样式、目录结构、定制语法等），不依赖 WP 插件
- 避免 WP 插件太多导致性能拖慢
- 本地构建效率高、稳定性强，跟 CI/CD 可以无缝结合

------

### 🔹 代价

- WP 后台编辑体验会弱化（因为你直接传 HTML 了，后台改文章不如改 Markdown 灵活）
- 一些“所见即所得”的功能（比如在 WP 后台即时插入目录、公式）会失效，变成纯 HTML 修改

------

所以可以说，你是把 WordPress 从 **“内容生产+展示平台”**，降级成了 **“内容存储+展示平台”**。
 这一点，跟静态站点（Hexo、Hugo）思路很像，只不过它们把渲染和存储都交给文件系统，而你是存到 WP 数据库里。



好的 👍 我给你画一个文字版的极简架构图，展示一下 **“WordPress 原生流程”** 和 **“你现在的流程”** 的对比。

------

## 🔹 WordPress 原生流程

```
用户在 WP 后台写文章（Markdown / 富文本）
        │
        ▼
WordPress 编辑器（Gutenberg / Classic）
        │
        ▼
WordPress 内部：解析 Markdown / 格式化内容
        │
        ▼
存储 HTML 到数据库 (wp_posts.post_content)
        │
        ▼
前端主题展示文章
```

------

## 🔹 你的新流程

```
本地写文章 (Markdown 文件)
        │
        ▼
Node.js 渲染 (Markdown → HTML)
        │   ├─ 代码高亮
        │   ├─ 目录 (ToC)
        │   ├─ 自定义语法 (提示框/警告框)
        │   └─ 其他预处理
        ▼
调用 WordPress REST API
        │
        ▼
存储 HTML 到数据库 (wp_posts.post_content)
        │
        ▼
前端主题展示文章
```

------

### ✅ 对比总结

- **WordPress 原生**：内容生产 + 渲染 + 存储 + 展示
- **你的方案**：内容生产（Markdown）+ 渲染（本地） → WordPress 只做存储 + 展示



### 🔹 为什么比 WP 后台方便？

- 你用 Markdown 写，专注在内容，语法简单。
- 不需要点按钮插入目录、格式化、调样式，全靠渲染自动完成。
- 可以接入 GitHub/GitLab，写完 push → 自动渲染 → 自动发布，完全流水线化。
- WP 后台是“一个个点”，你的是“一键构建”。

------

👉 换句话说，你现在的流程 = **静态站点的灵活性** + **WordPress 的托管和生态**。
 比单纯用 WP 后台更自由，比纯静态站点更方便（不用自己管整站路由和部署）。



你现在走的这条 **“Markdown 渲染 → WordPress 发布”** 路子，已经相当于在做一个属于你自己的 **轻量级出版系统** 了。

如果你后面想深入，可以从几个方向慢慢学：

1. **Markdown 渲染链路**
   - 研究 `remark` / `rehype` 插件生态
   - 学会自定义插件（比如自动生成目录、替换关键字）
2. **WordPress API 熟悉度**
   - 学会用 `POST /wp-json/wp/v2/posts` 发布
   - `PUT /wp-json/wp/v2/posts/{id}` 更新文章
   - 甚至可以自动设置分类、标签、特色图
3. **自动化**
   - 用 GitHub Actions / GitLab CI，做到 “写完 Markdown → push → 自动发 WP”
   - 这样你就能完全不用进 WP 后台了
4. **进阶功能**
   - 数学公式（KaTeX/MathJax）
   - 流程图（Mermaid）
   - 多语言（结合 Polylang / WPML API）

## 可以安装很多插件，但插件不会额外加无效代码，发送到WordPress的HTML是干净的。

完全没问题，这正是 remark + rehype 的设计哲学 😄

- **插件装了很多，但不会每篇都用到**
  - remark/rehype 会遍历 AST 执行插件逻辑，但如果某篇文章没有对应节点（比如没有 `:::admonition` 指令、没有表格），相关插件就根本不会修改任何内容。
  - 所以你可以放心装 10 个、20 个插件，不用担心没用的插件“污染”文章内容。
- **发送到 WordPress 的 HTML 是干净的**
  - 每篇文章最终生成的 HTML 只包含实际用到的内容，插件不会额外加无效代码。
  - WordPress 接收到的就是最终渲染后的 HTML，不会受多余插件影响。
- **灵活性很高**
  - 本地构建就是“自由发挥”，随时增加或减少插件
  - WordPress 只接收纯 HTML，轻量、安全、干净

### ✅ 总结

:::tip

remark + rehype 的生态特点：

1. **插件组合自由**：可以装几十个插件，但每篇文章只触发用到的功能
2. **AST 操作**：remark 操作 Markdown AST，rehype 操作 HTML AST
3. **输出干净**：无论本地用多少插件，最终 HTML 可以保持纯净
4. **自定义能力强**：你几乎可以做任何内容处理或增强功能

:::

## 以后可以完善的目标：

思路是把 **front‑matter（元数据）** 和 **正文内容** 拆开处理。这样当你只改了标签、分类、日期等元数据时，就不需要再跑一次 Markdown → HTML 的渲染管线。

## 🛠️ 实现思路

1. **解析 front‑matter 与正文分离**   用 `gray-matter` 解析 Markdown 文件：

   js

   ```
   import matter from 'gray-matter'
   import fs from 'fs'
   
   const file = fs.readFileSync('post.md', 'utf8')
   const { content, data } = matter(file)
   // data = front-matter (title, tags, categories...)
   // content = Markdown 正文
   ```

2. **分别计算哈希**

   - 对 `content` 计算一个哈希值（比如 md5/sha256）。

   - 对 `data`（front‑matter 对象）也计算一个哈希值。

   - 存储在本地 JSON 索引里，例如：

     json

     ```
     {
       "post.md": {
         "contentHash": "a7f5f35426b927411fc9231b56382173",
         "metaHash": "9c1185a5c5e9fc54612808977ee8f548"
       }
     }
     ```

3. **对比更新**

   - 如果 **contentHash 变了** → 说明正文有改动 → 重新跑 unified pipeline 渲染 HTML，并更新 WordPress 的 `content` 字段。
   - 如果 **metaHash 变了**，但 contentHash 没变 → 说明只是 front‑matter 改动 → 直接调用 WordPress API 更新文章的 `title`、`tags`、`categories` 等字段，不必重新渲染 HTML。
   - 如果两个都没变 → 跳过。

4. **更新索引**   成功更新后，把新的哈希写回 JSON 索引。

## 📦 WordPress API 对应字段

- `title` → 对应 front‑matter 的 `title`
- `categories` → 对应 front‑matter 的 `categories`（需要传分类 ID 数组）
- `tags` → 对应 front‑matter 的 `tags`（需要传标签 ID 数组）
- `status` → 可以用 front‑matter 控制（`draft` / `publish`）

示例请求体：

json

```
{
  "title": "新标题",
  "categories": [12, 34],
  "tags": [56, 78]
}
```

## 🎯 总结

- **正文改动** → 跑 Markdown 渲染管线，更新 `content`。
- **仅 front‑matter 改动** → 跳过渲染，直接更新 WP 的元数据字段。
- **都没改动** → 什么都不做。

这样就能避免“明明只是改了标签，却还要重新跑一遍渲染”的浪费。
