---
author: haoye
categories:
- 随记
date: '2025-04-17T01:13:33'
id: 45
tags: []
title: astra主题使用钩子函数给单篇文章添加面包屑
---

当然可以使用模板部件（template part）来引入面包屑导航。这是一个很好的做法，因为它可以提高代码的可重用性和可维护性。以下是如何实现这一点的步骤：

  1. 创建面包屑模板部件文件
  2. 在模板部件文件中编写面包屑代码
  3. 使用Astra主题的钩子函数来引入这个模板部件

步骤 1：创建面包屑模板部件文件

在你的主题目录（如果使用子主题，则在子主题目录）中创建一个新文件，命名为 `template-parts/breadcrumbs.php`。

步骤 2：编写面包屑代码

在 `template-parts/breadcrumbs.php` 文件中添加以下代码：

    
    
    <?php
    if (!defined('ABSPATH')) {
        exit; // Exit if accessed directly
    }
    
    // 不在首页显示面包屑
    if (is_front_page()) {
        return;
    }
    
    $output = '<div class="breadcrumbs">';
    $output .= '<a href="' . home_url() . '">首页</a> » ';
    
    if (is_single()) {
        $categories = get_the_category();
        if ($categories) {
            $output .= '<a href="' . esc_url(get_category_link($categories[0]->term_id)) . '">' . esc_html($categories[0]->name) . '</a> » ';
        }
        $output .= get_the_title();
    } elseif (is_page()) {
        $output .= get_the_title();
    } elseif (is_category()) {
        $output .= single_cat_title('', false);
    }
    
    $output .= '</div>';
    
    echo $output;
    

步骤 3：使用Astra主题的钩子函数引入模板部件

在你的 `functions.php` 文件中添加以下代码：

    
    
    function add_breadcrumbs_to_single_post() {
        if (is_single()) {
            get_template_part('template-parts/breadcrumbs');
        }
    }
    add_action('astra_primary_content_top', 'add_breadcrumbs_to_single_post');
    

这段代码会在单篇文章页面的内容顶部引入面包屑导航。

使用模板部件的优势：

  1. 代码组织更清晰：面包屑的代码被独立到一个单独的文件中。
  2. 可重用性：你可以在需要的地方轻松地重用这个面包屑模板。
  3. 易于维护：如果需要修改面包屑，你只需要修改一个文件。
  4. 主题兼容性：如果你更换主题，只需要移动模板部件文件即可。

如果你想在其他类型的页面（如页面或分类页面）也显示面包屑，你可以修改 `add_breadcrumbs_to_single_post` 函数：

    
    
    function add_breadcrumbs() {
        if (is_single() || is_page() || is_category()) {
            get_template_part('template-parts/breadcrumbs');
        }
    }
    add_action('astra_primary_content_top', 'add_breadcrumbs');
    

这样，面包屑就会显示在单篇文章、页面和分类页面上。

记得根据需要调整CSS样式来美化面包屑的外观。你可以在主题的样式表中添加相应的CSS代码。

