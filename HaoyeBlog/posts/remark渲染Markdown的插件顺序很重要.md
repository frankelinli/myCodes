---
id: 721
title: remark渲染Markdown的插件顺序很重要
slug: remark渲染Markdown的插件顺序很重要
categories:
  - notes
tags: ["doc"]
---

![remark markdown渲染构建](https://images.haoyelaiga.com/image-20250921201949766.png)

remark渲染Markdown的插件顺序很重要，不能乱放，必须按照逻辑顺序来使用代码。顺序非常关键，随便放可能会导致插件不起作用或报错。我们来看上图的例子：

1️⃣ 基本规则

1. **解析 Markdown → AST → HTML**
   - `remarkParse` **必须最先**，把 Markdown 转成 AST。
   - `remarkRehype` **必须在 remark 插件之后**，因为它把 remark AST 转成 rehype AST（HTML AST）。
   - `rehypeStringify` **必须最后**，把 AST 转成 HTML 字符串。
2. **remark 插件顺序**
   - 所有处理 Markdown AST 的插件（如 `remarkGfm`、`remarkDirective`、`remarkAdmonitionBlocks`、你的 `addTargetBlank`）**必须在 `remarkRehype` 之前**。
   - 因为一旦执行了 `remarkRehype`，AST 已经变成 HTML AST，remark 插件无法再操作。
3. **插件依赖**
   - 比如 `remarkAdmonitionBlocks` 可能依赖 `remarkDirective` 解析 `:::` 指令，所以 `remarkDirective` 必须在前面。
   - `addTargetBlank` 处理链接时，必须在 AST 还没转成 HTML AST 时执行。

------

## 2️⃣ 调整顺序建议

```
const file = await unified()
    .use(remarkParse)               // 必须最先
    .use(remarkGfm)                 // 支持表格、任务列表等
    .use(remarkDirective)           // 支持自定义指令
    .use(remarkAdmonitionBlocks)    // 使用指令生成 Admonition 块
    .use(addTargetBlank)            // 修改链接 target
    .use(remarkRehype, { allowDangerousHtml: true }) // 转换 HTML AST
    .use(rehypeStringify, { allowDangerousHtml: true }); // 输出 HTML
```

✅ 这个顺序是正确的，功能都会生效。

[外链新窗口打开代码](https://chatgpt.com/c/68cfe6c9-9660-832c-96ba-285958321833)

------

💡 **总结**

- **remark 插件顺序很重要**，因为它们都是操作 AST。
- **必须在 `remarkRehype` 之前**，否则 AST 类型变化了就操作不到了。
- **rehype 插件顺序也重要**，比如在 HTML AST 上再做操作（图片懒加载、表格样式等）。