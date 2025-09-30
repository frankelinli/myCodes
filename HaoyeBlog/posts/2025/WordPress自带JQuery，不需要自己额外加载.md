---
id: 126
title: WordPress自带JQuery，不需要自己额外加载
slug: wordpress%e8%87%aa%e5%b8%a6jquery%ef%bc%8c%e4%b8%8d%e9%9c%80%e8%a6%81%e8%87%aa%e5%b7%b1%e9%a2%9d%e5%a4%96%e5%8a%a0%e8%bd%bd
date: '2025-04-19T12:08:53'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/wordpress%e8%87%aa%e5%b8%a6jquery%ef%bc%8c%e4%b8%8d%e9%9c%80%e8%a6%81%e8%87%aa%e5%b7%b1%e9%a2%9d%e5%a4%96%e5%8a%a0%e8%bd%bd/
---

WordPress 核心已经自带了 jQuery，您不需要在子主题中专门 enqueue jQuery。

具体来说：

1. WordPress 自带的 jQuery 文件位于：

```
wp-includes/js/jquery/jquery.js
```

2. WordPress 自动注册了以下 jQuery 相关的脚本：\
   – jquery\
   – jquery-core\
   – jquery-migrate

3. 很多 WordPress 核心功能依赖 jQuery，所以它会自动加载。

如果您要在子主题中写 jQuery 代码，只需要这样：

```
// functions.php 中添加自己的 JS 文件
function my_theme_scripts() {
    wp_enqueue_script('my-custom-js', get_stylesheet_directory_uri() . '/js/custom.js', array(), '1.0', true);
}
add_action('wp_enqueue_scripts', 'my_theme_scripts');
```

然后在 custom.js 中直接使用 jQuery 即可：

```
jQuery(document).ready(function($) {
    // 您的代码
});
```

不需要这样做：

```
// ❌ 不需要这样
wp_enqueue_script('jquery');  // 不需要，WordPress 已经加载了
```

小提示：\
– 如果您的代码需要确保 jQuery 已加载，可以在 wp\_enqueue\_script 时将 jquery 添加为依赖：

```
wp_enqueue_script('my-custom-js', get_stylesheet_directory_uri() . '/js/custom.js', array('jquery'), '1.0', true);
```
