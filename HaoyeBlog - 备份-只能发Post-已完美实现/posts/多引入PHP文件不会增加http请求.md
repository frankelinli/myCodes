---
id: 218
title: 多引入PHP文件不会增加http请求
slug: '%e5%a4%9a%e5%bc%95%e5%85%a5php%e6%96%87%e4%bb%b6%e4%b8%8d%e4%bc%9a%e5%a2%9e%e5%8a%a0http%e8%af%b7%e6%b1%82'
date: '2025-05-04T21:20:46'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e5%a4%9a%e5%bc%95%e5%85%a5php%e6%96%87%e4%bb%b6%e4%b8%8d%e4%bc%9a%e5%a2%9e%e5%8a%a0http%e8%af%b7%e6%b1%82/
---

在`functions.php`中通过`include`或`require`引入额外的PHP文件不会增加HTTP请求数量，这只是服务器端的文件包含，对客户端完全透明。

```
/**
 * 在functions.php中引入额外PHP文件的示例
 */
function haowiki_include_extra_files() {
    // 获取子主题目录路径
    $theme_dir = get_stylesheet_directory();

    // 引入额外的PHP文件
    require_once $theme_dir . '/includes/external-links.php';
    require_once $theme_dir . '/includes/custom-functions.php';
    // 可以引入更多文件...
}
haowiki_include_extra_files();
```

PHP的`include`、`include_once`、`require`或`require_once`是在服务器执行阶段合并文件内容，这个过程发生在服务器生成HTML响应之前。当浏览器接收到响应时，它只看到一个完整的HTML文档，完全不知道服务器端执行了多少个PHP文件。

这与前端资源（如CSS、JavaScript）的引入方式完全不同：

1. **PHP文件引入（服务器端）**：\
   – 在服务器处理阶段完成\
   – 不会产生额外HTTP请求\
   – 对客户端完全透明\
   – 常用于代码模块化和组织
2. **前端资源引入（客户端端）**：\
   – 例如`<link href="style.css">`或`<script src="script.js">`\
   – 每个引用通常会产生一个额外的HTTP请求\
   – 直接影响页面加载性能

这正是为什么将PHP代码分拆到多个文件是一种良好的实践 – 它可以提高代码的组织性和可维护性，而不会对网站性能产生负面影响。

**模块化思路提醒：** 你可以创建一个`includes`目录在你的子主题中，将不同功能的PHP代码分别放在不同文件中，然后在`functions.php`中统一引入。这样可以使代码更有组织性，便于维护，同时不会增加任何HTTP请求数。
