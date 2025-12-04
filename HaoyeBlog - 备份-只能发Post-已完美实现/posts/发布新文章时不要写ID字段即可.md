---
id: 379

title: 发布新文章时不要写ID字段即可
slug: 发布新文章时不要写ID字段即可

categories:
  - notes
tags: ["doc","哈哈"]
---

是的，你说得对！这是最简单的解决方案。

:::tip

**正确的做法：**

新文章的 front matter 这样写：
```yaml
---
title: OKprism-highlight-perfect
slug: OKprism-highlight-perfect
categories:
  - notes
tags: ["doc"]
---
```

**不要写** `id:` 这一行。

:::

**发布流程：**
1. 第一次发布时，front matter 中没有 `id` 字段
2. 脚本会创建新文章并自动在 front matter 开头添加 `id: 1234`
3. 以后再次发布时，脚本会根据这个 ID 更新文章

**最终结果：**
发布成功后，你的 Markdown 文件会自动变成：
```yaml
---
id: 1234
title: OKprism-highlight-perfect
slug: OKprism-highlight-perfect
categories:
  - notes
tags: ["doc"]
---
```

这样既简单又避免了空 `id:` 行的问题。脚本的设计本来就是这样工作的——只有在没有 `id` 字段时才会写回新的 ID。

你现在可以把那个 `aaa.md.md` 文件中的 `id:` 空行删掉，然后重新发布试试！