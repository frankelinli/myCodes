---
id: 734
title: remark生态在Markdown里自定义文字高亮和tip提示
slug: remark生态在Markdown里自定义文字高亮和tip提示
categories:
  - notes
tags: ["doc"]
---



一个 **remark 插件**实现！我们让 Markdown 里的 `【xxx】` 变成一个带高亮和提示的 `<span>`。

🔹 Markdown 输入`【青山依旧在，只是夕阳红】`，`【】`这个符号是暗号，Markdown里任何在这个符号里的文字，解析为网页后，都会变成预定的样式

【青山依旧在，只是夕阳红，鼠标悬停在这段文字上，查看效果】

🔹 输出 HTML

```html
<span style="background: yellow; cursor: help; padding: 0 2px; border-radius: 3px;" title="提示：青山依旧在，只是夕阳红">青山依旧在，只是夕阳红</span>
```

下面是实现代码。remark的插件其实就是**一个函数**，直接把 `【xxx】` 转换成带 **内联样式 + tooltip** 的 `<span>`，本案例不用再写额外的 CSS。【当然写外部CSS也可以，看情况】

------

## 🔹 插件代码

```js
import { visit } from 'unist-util-visit'

function remarkHighlightTipInline() {
  return function transformer(tree) {
    visit(tree, 'text', (node, index, parent) => {
      const regex = /【(.*?)】/g
      const matches = [...node.value.matchAll(regex)]
      if (matches.length === 0) return

      const children = []
      let lastIndex = 0

      matches.forEach(match => {
        const [raw, inner] = match
        const start = match.index

        // 普通文字
        if (start > lastIndex) {
          children.push({ type: 'text', value: node.value.slice(lastIndex, start) })
        }

        // 高亮 span（内联样式+tooltip）
        children.push({
          type: 'html',
          value: `<span 
            style="background: yellow; cursor: help; padding: 0 2px; border-radius: 3px;" 
            title="提示：${inner}"
          >${inner}</span>`
        })

        lastIndex = start + raw.length
      })

      // 剩余部分
      if (lastIndex < node.value.length) {
        children.push({ type: 'text', value: node.value.slice(lastIndex) })
      }

      parent.children.splice(index, 1, ...children)
    })
  }
}
```

![Markdown remark生态](https://images.haoyelaiga.com/image-20250921220630700.png)

## 再举个插件小例子，在文章末尾挂在一段文字：

```js
// 在文章末尾添加签名，测试用；过后可以删除
function addSignature() {
  return function transformer(tree) {
    tree.children.push({
      type: 'paragraph',
      children: [{ type: 'text', value: '--- Written with remark 🚀' }]
    })
  }
}
```

