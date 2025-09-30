---
id: 60
title: php文件开头不能有空格
slug: php%e6%96%87%e4%bb%b6%e5%bc%80%e5%a4%b4%e4%b8%8d%e8%83%bd%e6%9c%89%e7%a9%ba%e6%a0%bc
date: '2025-04-17T07:26:12'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/php%e6%96%87%e4%bb%b6%e5%bc%80%e5%a4%b4%e4%b8%8d%e8%83%bd%e6%9c%89%e7%a9%ba%e6%a0%bc/
---

检查你的代码，我发现了几处可能导致额外空白字符的地方。建议做如下修改：

1. 文件开头：

```
<?php
// 确保第一行没有任何空行，直接以 <?php 开始
define( 'CHILD_THEME_ASTRA_CHILD_VERSION', '1.0.0' );
```

1. 修改包含文件的代码：

```
// 修改这两行，移除多余空格
require_once get_stylesheet_directory().'/template-parts/submit-to-baidu.php';
require_once get_stylesheet_directory().'/template-parts/wordpress-optimizations.php';
```

1. 检查模板文件：\
   确保 `/template-parts/submit-to-baidu.php` 和 `/template-parts/wordpress-optimizations.php` 这两个文件：

- 开头没有空行
- 不包含 PHP 结束标签 `?>`

1. 添加输出缓冲控制，在文件开头添加：

```
if (!function_exists('remove_whitespace_output')) {
    function remove_whitespace_output() {
        ob_start(function($buffer) {
            return trim($buffer);
        });
    }
    add_action('init', 'remove_whitespace_output', 1);
}
```

1. 检查HTML输出函数：

```
function display_left_doc_sidebar() {
    if (is_single() && !has_category('csr')) {
        if (is_active_sidebar('left-doc')) {
            echo '<div class="left-doc-sidebar">';
            dynamic_sidebar('left-doc');
            echo '</div>';
        }
    }
}
```

1. 其他建议：

- 移除所有PHP文件末尾的 `?>` 结束标签
- 确保所有文件使用UTF-8无BOM编码
- 检查 `custom.js` 和 `style.css` 文件的编码格式

1. 添加空白控制：

```
add_action('init', function() {
    ob_start(function($buffer) {
        return trim(preg_replace('/\s+/', ' ', $buffer));
    });
}, 0);
```

你需要我详细解释任何修改吗？也建议检查一下你网站根目录的 .htaccess 文件是否有额外的空行。
