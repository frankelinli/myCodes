---
author: haoye
categories:
- 随记
date: '2025-05-07T00:00:41'
id: 249
tags: []
title: 为何我制作的主题中不显示admin bar
---

如果您自己制作的主题没有显示 admin bar（管理员工具栏），这可能是由几个原因造成的。让我们逐一检查可能的原因：

  1. 主题支持：  
确保您的主题声明了对 admin bar 的支持。在您的 functions.php 文件中，应该有类似这样的代码：

    
    
    add_theme_support( 'admin-bar', array( 'callback' => '__return_false' ) );
    

  2. body_class 函数：  
确保您在`<body>` 标签中调用了 body_class() 函数。这个函数会添加必要的类，包括 admin-bar 类：

    
    
    <body <?php body_class(); ?>>
    

  3. wp_body_open 钩子：  
在 `<body>` 标签之后立即添加 wp_body_open() 函数调用：

    
    
    <body <?php body_class(); ?>>
    <?php wp_body_open(); ?>
    

  4. wp_footer 函数：  
确保在 `</body>`标签之前调用了 wp_footer() 函数：

    
    
    <?php wp_footer(); ?>
    </body>
    </html>
    

  5. CSS 冲突：  
检查您的主题 CSS 是否有可能覆盖或隐藏了 admin bar。尤其注意 body 和 html 元素的 margin-top 属性。

  6. JavaScript 冲突：  
确保您的主题或插件中没有 JavaScript 代码意外地隐藏或移除了 admin bar。

  7. 用户设置：  
在 WordPress 后台，进入 Users > Your Profile，确保"Show Toolbar when viewing
site"选项被勾选。

  8. 插件冲突：  
暂时停用所有插件，看看 admin bar 是否出现。如果出现了，逐个启用插件以找出冲突的插件。

  9. 主题函数：  
确保您的主题没有使用 show_admin_bar(false) 函数来禁用 admin bar。

  10. 权限问题：  
确保登录的用户有足够的权限查看 admin bar。

如果您检查了这些点仍然无法解决问题，可能需要更深入地检查主题代码。您可以尝试使用默认主题（如 Twenty Twenty-Three）来测试 admin
bar 是否正常显示，以确定问题是否特定于您的自定义主题。

如果需要进一步的帮助，您可以提供更多关于主题结构或相关代码的信息，我会很乐意协助您解决这个问题。

