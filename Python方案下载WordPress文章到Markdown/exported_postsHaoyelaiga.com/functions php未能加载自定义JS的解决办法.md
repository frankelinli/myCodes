---
author: haoye
categories:
- 随记
date: '2025-04-17T17:49:05'
id: 79
tags: []
title: functions php未能加载自定义JS的解决办法
---

在开发或修改 WordPress 主题时，我们常常需要添加自定义的 JavaScript 文件。然而，有时候即使我们正确地在 `functions.php`
文件中排队（enqueue）了这些脚本，它们仍然不会加载。在这篇博客中，我将分享一个真实的案例，描述问题的发现、排查过程以及最终的解决方案。

#### 问题背景

我在 `functions.php` 文件中使用了 `wp_enqueue_script` 函数来添加自定义的 JavaScript
文件，但在检查网页时，发现脚本并没有正确加载。即使尝试了各种方法，包括检查文件路径和权限，问题依旧存在。

#### 排查和纠错过程

  1. **验证`functions.php` 文件是否被正确加载**

我首先确保 `functions.php` 文件被正确加载。为此，我添加了一些调试信息：

"`php  

"`

  2. **确保`wp_enqueue_script` 函数被调用**

我在 `functions.php` 文件中进一步添加调试信息来确认 `wp_enqueue_script` 函数是否被调用：

"`php  

"`

  3. **检查`get_template_directory_uri()` 的输出**

为确保 `get_template_directory_uri()` 返回正确的 URL，我添加了以下代码：

"`php  

"`

  4. **检查文件路径和权限**

我确保 `js/custom.js` 文件存在且具有正确的读取权限。目录结构如下：

`your-theme/  
│  
├── functions.php  
├── js/  
│ └── custom.js  
└── ...`

文件权限为 `644`，目录权限为 `755`。

  5. **使用`wp_head` 钩子进行测试**

我尝试使用 `wp_head` 钩子直接输出脚本标签进行测试：

"`php  
  
  
  
>  
"`

同时，确保 `footer.php` 文件中包含 `wp_footer()` 函数调用：

"`php  
  
  

"`

:::

### 解决方案总结

通过确保在 `header.php` 和 `footer.php` 文件中包含 `wp_head()` 和 `wp_footer()`
函数调用，问题得以解决。`wp_head()` 和 `wp_footer()` 是 WordPress
主题中非常重要的钩子，它们允许插件和主题在页面头部和底部添加必要的代码。

### 结语

在 WordPress
主题开发中，细节往往决定了最终的结果。通过这个案例，我们学到了在排查问题时需要从多个角度进行检查，包括文件加载、函数调用、路径和权限等。如果你在开发过程中遇到了类似的问题，希望这篇博客能对你有所帮助

