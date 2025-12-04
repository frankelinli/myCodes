---
id: 890
title: remark-wordpress发布系统中自定义提示快Admonition插件说明
slug: remark-wordpress-myself-admonition plugins-perfect
categories:
  - notes
tags: []

---

[recent_posts count="3"]

remarkAdmonitionSimple 是我自己开发的极简的 remark 插件，用于把 Markdown 中的提示块（admonitions）转换为简洁、可样式化的 HTML 结构，支持五种类型：note、tip、info、warning、danger。插件输出的 HTML 结构保持最小化，仅包含 class="admonition <type>"，样式由WordPress的 CSS 控制。

一句话：在Markdown中任意位置插入提示快占位符，构建网页时，会自动解析成漂亮的提示快。

```
:::tip
这里是提示快
:::
```

![image-20251007163806997](https://haoyelaiga.com/wp-content/uploads/2025/10/image-20251007163806997.webp)

本插件实现了极大的自由度，根据自己的需要，可以显示提示快的标题，也可以不带标题，比docusaurus官方的还要好用。

## 支持的写法

![image-20251007164008381](https://haoyelaiga.com/wp-content/uploads/2025/10/image-20251007164008381.webp)

## 类型

- note、tip、info、warning、danger（不区分大小写）

输出的 HTML 结构（示例）
- 带标题的 tip：
```html
<div class="admonition tip">
  <p><strong>标题</strong></p>
  <p>正文内容…</p>
</div>
```
- 无标题的 tip：
```html
<div class="admonition tip">
  <p>正文内容…</p>
</div>
```
说明：插件只输出 class="admonition <type>"，不会添加额外 class 或复杂嵌套，以保证与现有的 CSS 完全兼容，即使修改，在WordPress里修改CSS也比较容易。

## 行为细节

- 优先使用 remark-directive 提供的 node.label（例如 :::tip[标题]）；
- 兼容常见写法 :::type 标题（同一行），会被预处理规范化为 :::type[标题]，从而被识别为 node.label；
- 若没有行内 label，插件还会检查 containerDirective 的首段是否被标记为 directiveLabel 且与容器同一行（仅在 remark-directive 产生此形式时生效）；仅在满足这些严格条件下才把首段当作标题并移除它以避免重复；
- 标题内容按纯文本处理（目前不解析内联 Markdown）。若需要支持 Markdown 格式的标题，可扩展为把 label 再次解析为 Markdown AST 并插入。

## 集成方法（要点）

1. 确保 pipeline 中已包含 remark-directive，并在其后使用插件：
```javascript
unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective)        // 必须先解析 directive
  .use(remarkAdmonitionSimple) // 插件
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify)
```
2. 插件会把 `:::type label`（同一行）规范化为 `:::type[label]`，以提高识别稳定性（只在同一行的情况做替换，避免把换行后的段落误判为标题）。
3. CSS 由你控制：插件不嵌入样式。若要在有标题时增加标题与正文的间距，可用：
```css
.admonition:has(> p:first-child > strong) > p:first-child + p { margin-top: 0.75rem; }
/* 回退 */
.admonition > p:first-child > strong { display:block; margin-bottom:0.75rem; }
```

## 示例用法（Markdown）

- 有标题：

  ```
  :::tip 性能优化
  使用 `npm run build -- --parallel` 开启并行构建。
  :::
  ```

:::tip 性能优化
使用 `npm run build -- --parallel` 开启并行构建。
:::

- 无标题：

  ```
  :::warning
  开启并行构建可以提升构建速度。
  :::
  ```

:::warning
开启并行构建可以提升构建速度。
:::

## 限制与扩展建议

- 当前 title 仅按纯文本处理，不支持复杂内联 Markdown（如强调、链接）。若需支持，可在插件中将 label 再 run 一次 remarkParse 并插入解析后的节点。
- 若希望标题使用自定义元素或图标（例如把标题放到特定的 .admonition-title 容器），可在插件中生成带 hName/hProperties 的节点，但会增加 HTML 复杂度；当前插件有意保持最小化以兼容你现有 CSS。

## 结论  
remarkAdmonitionSimple 目标是：最小侵入、行为可预测、与现有样式完全兼容。它在常见写法下能正确识别行内标题并用 <strong> 渲染，同时保证换行写法不会误判为标题。

## 代码备份

### Js插件代码

```js
// 自定义 Admonition 解析插件（简洁、可靠）
// 支持语法：:::tip ... ::: 以及 note/info/warning/danger
// 生成结构：<div class="admonition tip"> ... 原始段落/内容 ... </div>
function remarkAdmonitionSimple() {
  const TYPES = new Set(['note', 'tip', 'info', 'warning', 'danger']);
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      const type = String(node.name || '').toLowerCase();
      if (!TYPES.has(type)) return;

      // 设置外层 div 和 class（rehype 推荐使用 className 数组）
      const data = node.data || (node.data = {});
      data.hName = 'div';
      data.hProperties = data.hProperties || {};
      // 输出 class="admonition tip"（或 note/info/...）
      data.hProperties.className = ['admonition', type];

      // 先尝试 node.label（直接的 label 情况，例如 `:::type[label]`）
      let labelText = null;
      if (node.label && String(node.label).trim()) {
        labelText = String(node.label).trim();
      } else if (Array.isArray(node.children) && node.children.length > 0) {
        const first = node.children[0];
        // 仅当首段被标记为 directiveLabel 且其起始行与容器起始行相同
        // 才把它当作 label（这样可以避免把换行后的普通内容段落误判为标题）
        if (
          first && first.type === 'paragraph' && first.data && first.data.directiveLabel &&
          first.position && node.position && first.position.start && node.position.start &&
          first.position.start.line === node.position.start.line
        ) {
          const parts = [];
          for (const ch of first.children || []) {
            if (ch.type === 'text') parts.push(ch.value);
          }
          const extracted = parts.join('').trim();
          if (extracted) labelText = extracted;
          // 删除原始的 label 段落（因为我们将以新的强格式插入）
          node.children = node.children.slice(1);
        }
      }

      if (labelText) {
        const titleNode = {
          type: 'paragraph',
          children: [
            { type: 'strong', children: [{ type: 'text', value: labelText }] }
          ]
        };
        node.children = [titleNode, ...(node.children || [])];
      }
      // 否则保留原有子节点（通常为 paragraph 等）
    });
  };
}
```

### CSS

```css

/* 📦 提示块基础样式 */
.admonition {
    border-left: 4px solid;
    padding: 0.8rem 1rem;
    border-radius: 6px;
    margin-block: 0.7rem;
    transition: background 0.2s ease, box-shadow 0.2s ease;
}

.admonition p {
    margin: 0;
    font-size: 0.93rem;
    color: #1a1a1a;
}

/* 现代浏览器（优先）：当首段含 <strong> 且紧接着有正文段落时，为正文段落加间距 */
.admonition:has(> p:first-child > strong) > p:first-child + p {
  margin-top: 0.75rem;
}

.admonition code {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.9em;
    font-family: monospace;
}

/* 🎨 各类型样式（融合新版色彩 + Docusaurus 阴影） */
.note {
    border-color: #D4D5D8;
    background: #FDFDFE;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08);
}

.tip {
    border-color: #009400;
    background: #E6F6E6;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
}

.info {
    border-color: #4CB3D4;
    background: #EEF9FD;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

.warning {
    border-color: #E6A700;
    background: rgba(245, 158, 11, 0.10);
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.08);
}

.danger {
    border-color: #E13238;
    background: #FFEBEC;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
}

/* 📱 响应式 */
@media (max-width: 600px) {
    body {
        padding: 1rem;
    }

    .admonition {
        padding: 0.7rem;
    }
}

/* 🌙 简易暗色模式 */
@media (prefers-color-scheme: dark) {
    body {
        background: #111827;
        color: #f3f4f6;
    }

    .admonition p {
        color: #e5e7eb;
    }

    .admonition code {
        background: rgba(255, 255, 255, 0.1);
    }

    .note {
        border-color: #9ca3af;
        background: rgba(107, 114, 128, 0.25);
    }

    .tip {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.22);
    }

    .info {
        border-color: #38bdf8;
        background: rgba(59, 130, 246, 0.22);
    }

    .warning {
        border-color: #facc15;
        background: rgba(245, 158, 11, 0.22);
    }

    .danger {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.22);
    }
}
```

