---
id: 727
title: Markdown渲染为HTML时的allowDangeroursHTML
slug: Markdown渲染为HTML时的allowDangeroursHTML
categories:
  - notes
tags: []
---



默认情况下，**remark → rehype** 会把 Markdown AST 转成 HTML AST，但会忽略或删除原始 HTML 标签，以防止“危险 HTML”（XSS、恶意代码）

所以 `<div style="color:red">` 默认可能被过滤掉.

`allowDangerousHtml: true` 的作用是：

> 告诉 `remark-rehype`：**保留 Markdown 中原本写的 HTML**，不要自动过滤掉。

### XSS风险演示

在Markdown里插入下方元素：

```
<script>alert('你的账号被盗了!');</script>
```

然后通过 **remark → rehype → HTML → WordPress** 发送出去：

1. **浏览器会执行这个脚本**
   
   - 当你访问这篇文章时，会弹出 `alert('你的账号被盗了!')`
   - 这是 JS 被执行的正常行为
   
   ![image-20250921222915571](https://images.haoyelaiga.com/image-20250921222915571.png) 
2. **风险来源**
   
   - 这里不是 XSS 攻击，因为没有陌生人注入脚本
   - 只是你自己写了一个脚本在网页上执行
3. **后果**
   - 弹窗只是示例
   - 如果脚本写得复杂，可能修改页面内容、访问 cookie、发请求等
4. **安全性**
   - 对你自己写的内容，你完全知道代码是什么，所以可以控制
   - 如果是给用户看的文章，**千万不要写任意 `<script>`**，否则可能真的执行不想要的动作

------

💡 总结：

- **XSS 的“危险”是来自外部输入**，而你自己写的脚本，只会执行你自己允许的操作
- 你写 `<script>`，浏览器就执行；没别人注入，所以不算攻击，只是**页面自带脚本**
- 如果你只是想测试或调试，可以写；如果文章面向用户，建议不要写 `<script>`