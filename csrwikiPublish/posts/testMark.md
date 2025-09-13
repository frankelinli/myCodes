---
title: 复杂展示 Demo
slug: complex-demo
categories: [BCI]
---

# 复杂展示 Demo

## 1. 标准 Markdown 语法

**粗体**、*斜体*、~~删除线~~、`行内代码`

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

> 这是一个引用块。

---

## 2. 表格

| 姓名 | 年龄 | 城市 |
| ---- | ---- | ---- |
| 张三 | 28   | 北京 |
| 李四 | 32   | 上海 |
| 王五 | 25   | 深圳 |

---

## 3. 代码块

```js
function hello(name) {
  console.log('Hello, ' + name + '!');
}
hello('World');
```

---

## 4. 本地图片

![本地图片示例](C:\Users\wingxu\Desktop\myCodes\csrwikiPublish\posts\images\demo.jpg)

---

## 5. 原生 HTML + CSS

<div style="border:2px solid #007acc; border-radius:8px; padding:16px; background:#f0f8ff;">
  <h3 style="color:#007acc;">自定义 HTML 区块</h3>
  <ul>
    <li>支持 <b>内联样式</b></li>
    <li>支持 <span style="color:#e67e22;">颜色高亮</span></li>
    <li>支持嵌套结构</li>
  </ul>
  <p style="font-size:14px;">你可以在 Markdown 里直接写 HTML，WordPress 会完整保留。</p>
</div>

---

## 6. 组合内容

> <b>温馨提示：</b>  
> 你可以混合使用 Markdown 和 HTML，甚至在 HTML 里嵌入 Markdown 支持的内容。

---

## 7. 任务列表（GFM）

- [x] 支持标准 Markdown
- [x] 支持表格
- [x] 支持本地图片上传
- [x] 支持 HTML+CSS
- [ ] 支持数学公式（需扩展）

---

## 8. 响应式按钮（HTML）

<a href="https://csrwiki.com" style="display:inline-block; padding:10px 24px; background:#007acc; color:#fff; border-radius:4px; text-decoration:none; font-weight:bold;">访问 CSRWiki</a>