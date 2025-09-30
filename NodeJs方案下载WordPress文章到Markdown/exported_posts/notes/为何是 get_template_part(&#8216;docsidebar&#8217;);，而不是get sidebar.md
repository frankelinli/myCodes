---
id: 251
title: 为何是 get_template_part(&#8216;docsidebar&#8217;);，而不是get sidebar
slug: '%e4%b8%ba%e4%bd%95%e6%98%af-get_template_partdocsidebar%ef%bc%8c%e8%80%8c%e4%b8%8d%e6%98%afget-sidebar'
date: '2025-05-07T00:00:42'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e4%b8%ba%e4%bd%95%e6%98%af-get_template_partdocsidebar%ef%bc%8c%e8%80%8c%e4%b8%8d%e6%98%afget-sidebar/
---

在 WordPress 中，使用 `get_template_part()` 和 `get_sidebar()` 是两种不同的方法，具体取决于你想要实现的功能以及习惯。以下是两者的区别，以及为何在上述情况下使用 `get_template_part('docsidebar')` 而不是 `get_sidebar()`。

### **1. `get_template_part()` 和 `get_sidebar()` 的区别**

#### **`get_sidebar()`**

- **功能**: `get_sidebar()` 是 WordPress 的一个专用函数，用于加载一个特定的侧边栏文件。
- **默认文件名**: 它会尝试加载主题目录中的 `sidebar.php` 文件，或者你可以指定一个名称，例如 `get_sidebar('custom')` 会加载 `sidebar-custom.php`。
- **适用场景**:
- 通常用于加载标准的侧边栏布局。
- 常见于主题中需要加载通用或自定义命名的侧边栏文件。

#### **`get_template_part()`**

- **功能**: `get_template_part()` 是一个更通用的函数，用于加载任何模板文件。
- **适用场景**:
- 当你需要加载某个自定义的模板部分（不仅限于侧边栏，例如：页眉、页脚、内容块等）。
- 你可以更灵活地组织模板文件，比如将特定功能封装到独立文件中。
- 加载文件时，它会优先检查子主题中的模板文件，然后再检查父主题。

***

### **2. 为什么这里使用 `get_template_part('docsidebar')`**

在本案例中，我们建议使用 `get_template_part()` 而不是 `get_sidebar()`，原因如下：

#### **(1) 文件的命名与用途**

- `get_sidebar()` 是专门用于加载侧边栏的，而它通常指向 `sidebar.php` 或类似 `sidebar-{name}.php` 的文件。
- 但在你的场景中，你希望创建一个用于显示分类文章列表的“自定义文档风格侧边栏（docsidebar）”。这实际上是一个特定功能的模板文件（不一定是通用的侧边栏）。
- 使用 `get_template_part('docsidebar')` 更符合语义化，因为它表示我们加载的不是一个通用的侧边栏文件，而是一个特定的模板文件。

#### **(2) 灵活性**

- `get_template_part()` 更加灵活，不仅限于侧边栏，可以加载任何类型的模板文件。
- 如果将来你需要重构或扩展功能，例如将 `docsidebar` 用于其他页面（比如分类页面、归档页面等），`get_template_part()` 会更通用。

#### **(3) 避免干扰默认侧边栏**

- 如果你使用了 `get_sidebar()`，可能会干扰主题中其他地方对侧边栏的调用（特别是如果主题正在调用默认的 `sidebar.php`）。
- `get_template_part()` 独立于 WordPress 对侧边栏的处理逻辑，因此不会对其他侧边栏产生影响。

***

### **3. 什么时候用 `get_sidebar()` 更合适？**

如果你的模板文件要加载的内容确实是一个标准的侧边栏，并且需要与 WordPress 的小工具区域（Widgets）或主题的侧边栏管理功能进行绑定，那么 `get_sidebar()` 是更合适的选择。

例如：

```
<?php get_sidebar(); ?>
```

或：

```
<?php get_sidebar('custom'); // 加载 sidebar-custom.php ?>
```

这种方法适合加载基于 WordPress 小工具（Widgets）的传统侧边栏。

***

### **4. 总结**

在你的场景中，`get_template_part('docsidebar')` 更适合，因为：\
– 你加载的是一个特定功能的模板文件（分类文章列表）。\
– 它不会干扰主题的默认侧边栏逻辑。\
– 它更加灵活，能适应未来扩展。

如果你将来希望与 WordPress 小工具系统集成（比如让用户可以通过后台拖放小工具管理这个区域），那可以考虑使用 `get_sidebar()` 并结合自定义小工具区域来实现。
