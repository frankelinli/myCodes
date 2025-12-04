---
id: 146
title: 极简WordPress插件
slug: '%e6%9e%81%e7%ae%80wordpress%e6%8f%92%e4%bb%b6'
date: '2025-04-19T12:19:23'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e6%9e%81%e7%ae%80wordpress%e6%8f%92%e4%bb%b6/
---

极简WordPress插件: 一个更加极简的版本，不包含设置页面。以下是一个极简版的插件，只实现在文章标题前添加绿色竖线的功能；只做测试学习；

```
<?php
/**
 * Plugin Name: Simple Green Line Title
 * Plugin URI: http://www.example.com/
 * Description: Adds a green vertical line before post titles
 * Version: 1.0
 * Author: Your Name
 * Author URI: http://www.example.com/
 */

// 添加自定义 CSS
function sglt_add_custom_css() {
    ?>
    <style type="text/css">
        .entry-title {
            position: relative;
            padding-left: 15px;
        }
        .entry-title::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5px;
            background-color: #4CAF50; /* 绿色 */
        }
    </style>
    <?php
}
add_action('wp_head', 'sglt_add_custom_css');
```

这个极简版插件的功能如下：

1. 插件头部注释：包含插件的基本信息。

2. 添加自定义 CSS (`sglt_add_custom_css`):\
   – 使用 `add_action('wp_head', 'sglt_add_custom_css')` 在页面头部添加自定义 CSS。\
   – CSS 使用 `::before` 伪元素在标题前添加一个绿色竖线。\
   – 竖线的宽度为 5px，颜色为 #4CAF50（绿色）。

使用这个插件的步骤：

1. 创建一个新文件夹，名为 “simple-green-line-title”。
2. 在该文件夹中创建一个 PHP 文件，名为 “simple-green-line-title.php”。
3. 将上面的代码复制到这个 PHP 文件中。
4. 将整个文件夹上传到 WordPress 安装目录的 `wp-content/plugins/` 文件夹中。
5. 在 WordPress 后台的插件页面激活这个插件。

激活后，您应该能看到所有文章的标题前都添加了一个绿色竖线。

:::warning

这个版本没有设置页面，也没有额外的功能，就是一个最简单的实现。演示学习使用

:::
