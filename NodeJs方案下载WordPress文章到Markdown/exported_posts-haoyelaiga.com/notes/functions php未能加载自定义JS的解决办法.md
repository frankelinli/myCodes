---
id: 79
title: functions php未能加载自定义JS的解决办法
date: '2025-04-17T17:49:05'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/functions-php%e6%9c%aa%e8%83%bd%e5%8a%a0%e8%bd%bd%e8%87%aa%e5%ae%9a%e4%b9%89js%e7%9a%84%e8%a7%a3%e5%86%b3%e5%8a%9e%e6%b3%95/
---

在开发或修改 WordPress 主题时，我们常常需要添加自定义的 JavaScript 文件。然而，有时候即使我们正确地在 `functions.php` 文件中排队（enqueue）了这些脚本，它们仍然不会加载。在这篇博客中，我将分享一个真实的案例，描述问题的发现、排查过程以及最终的解决方案。

#### 问题背景

我在 `functions.php` 文件中使用了 `wp_enqueue_script` 函数来添加自定义的 JavaScript 文件，但在检查网页时，发现脚本并没有正确加载。即使尝试了各种方法，包括检查文件路径和权限，问题依旧存在。

#### 排查和纠错过程

1. **验证 `functions.php` 文件是否被正确加载**

我首先确保 `functions.php` 文件被正确加载。为此，我添加了一些调试信息：

“\`php\ <!--?php
   error_log('functions.php is loaded'); // 输出日志到服务器日志文件
   ?-->

“\`

2. **确保 `wp_enqueue_script` 函数被调用**

我在 `functions.php` 文件中进一步添加调试信息来确认 `wp_enqueue_script` 函数是否被调用：

“\`php\ <!--?php
   if (!function_exists('my_theme_enqueue_scripts')) {
       function my_theme_enqueue_scripts() {
           error_log('my_theme_enqueue_scripts function called'); // 调试输出

           // 检查 jQuery 是否被正确加载
           if (!wp_script_is('jquery', 'enqueued')) {
               wp_enqueue_script('jquery');
           }

           // 注册并排队自定义的 JavaScript 文件
           wp_enqueue_script(
               'custom-js',
               get_template_directory_uri() . '/js/custom.js',
               array('jquery'),
               null,
               true
           );

           error_log('custom.js path: ' . get_template_directory_uri() . '/js/custom.js'); // 调试输出
       }

       add_action('wp_enqueue_scripts', 'my_theme_enqueue_scripts');
   }
   ?-->

“\`

3. **检查 `get_template_directory_uri()` 的输出**

为确保 `get_template_directory_uri()` 返回正确的 URL，我添加了以下代码：

“\`php\ <!--?php
   error_log('Template Directory URI: ' . get_template_directory_uri());
   ?-->

“\`

4. **检查文件路径和权限**

我确保 `js/custom.js` 文件存在且具有正确的读取权限。目录结构如下：

`your-theme/
│
├── functions.php
├── js/
│ └── custom.js
└── ...`

文件权限为 `644`，目录权限为 `755`。

5. **使用 `wp_head` 钩子进行测试**

我尝试使用 `wp_head` 钩子直接输出脚本标签进行测试：

“\`php\ <!--?php
   if (!function_exists('my_theme_enqueue_scripts')) {
       function my_theme_enqueue_scripts() {
           echo '<script src="' . get_template_directory_uri() . '/js/custom.js"-->‘;\
}

add\_action(‘wp\_head’, ‘my\_theme\_enqueue\_scripts’);\
}\
?>

“\`

6. **检查主题的 `header.php` 文件**

:::caution

最终，我发现问题的根源在于 `header.php` 文件中缺少 `wp_head()` 函数调用。![image-20240718215815036](https://docu-1319658309.cos.ap-guangzhou.myqcloud.com/image-20240718215815036.png)

确保你的 `header.php` 文件包含以下代码：

“\`php

\>\
\
\ <!--?php wp_head(); ?-->\
\
\>\
“\`

同时，确保 \`footer.php\` 文件中包含 \`wp\_footer()\` 函数调用：

“\`php\ <!--?php wp_footer(); ?-->

“\`

:::

### 解决方案总结

通过确保在 `header.php` 和 `footer.php` 文件中包含 `wp_head()` 和 `wp_footer()` 函数调用，问题得以解决。`wp_head()` 和 `wp_footer()` 是 WordPress 主题中非常重要的钩子，它们允许插件和主题在页面头部和底部添加必要的代码。

### 结语

在 WordPress 主题开发中，细节往往决定了最终的结果。通过这个案例，我们学到了在排查问题时需要从多个角度进行检查，包括文件加载、函数调用、路径和权限等。如果你在开发过程中遇到了类似的问题，希望这篇博客能对你有所帮助
