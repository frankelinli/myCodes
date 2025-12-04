---
id: 765
title: WordPress对搜索引擎要noindex日期、页面、作者等存档页
slug: WordPress对搜索引擎要noindex日期、页面、作者等存档页
categories:
  - notes
tags: []
---

默认 noindex 日期归档和作者归档，除非它们经过内容优化，能独立承载搜索价值。 保留 follow 以传递内部链接权重。 分页归档也通常 noindex，避免抓取浪费。 那你写个WordPress代码，我用代码来实现。我不用插件。

可以直接在主题的 `functions.php` 里用 WordPress 的 `wp_head` 钩子，根据条件输出 `<meta name="robots" content="noindex,follow">`，这样无需插件就能实现你说的策略。

![image-20250923170851846](https://images.haoyelaiga.com/image-20250923170851846.png)

下面是一个专业且可维护的实现示例：

## **functions.php  示例代码**

```php
<?php
// 在归档页输出 noindex,follow
add_action('wp_head', function () {
    // 日期归档（年/月/日）
    if (is_date()) {
        echo '<meta name="robots" content="noindex,follow">' . "\n";
    }

    // 作者归档
    if (is_author()) {
        echo '<meta name="robots" content="noindex,follow">' . "\n";
    }

    // 分页归档（包括分类、标签、首页的分页）
    if (is_paged()) {
        echo '<meta name="robots" content="noindex,follow">' . "\n";
    }
});
```

### 📌 说明

- `is_date()`：匹配 `/2025/04`、`/2025/04/15` 等日期归档页。
- `is_author()`：匹配 `/author/用户名` 作者归档页。
- `is_paged()`：匹配分页页 `/page/2`、`/category/xxx/page/3` 等。

输出的 `<meta name="robots" content="noindex,follow">` 会告诉搜索引擎：不要收录该页，但可以跟踪里面的链接。这样不会阻断内部链接权重传递，也不会影响正常抓取文章页。
