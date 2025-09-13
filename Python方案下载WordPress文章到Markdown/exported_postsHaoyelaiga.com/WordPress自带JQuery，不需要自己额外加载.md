---
author: haoye
categories:
- 随记
date: '2025-04-19T12:08:53'
id: 126
tags: []
title: WordPress自带JQuery，不需要自己额外加载
---

WordPress 核心已经自带了 jQuery，您不需要在子主题中专门 enqueue jQuery。

具体来说：

  1. WordPress 自带的 jQuery 文件位于：

    
    
    wp-includes/js/jquery/jquery.js
    

  2. WordPress 自动注册了以下 jQuery 相关的脚本：  
- jquery  
- jquery-core  
- jquery-migrate

  3. 很多 WordPress 核心功能依赖 jQuery，所以它会自动加载。

如果您要在子主题中写 jQuery 代码，只需要这样：

    
    
    // functions.php 中添加自己的 JS 文件
    function my_theme_scripts() {
        wp_enqueue_script('my-custom-js', get_stylesheet_directory_uri() . '/js/custom.js', array(), '1.0', true);
    }
    add_action('wp_enqueue_scripts', 'my_theme_scripts');
    

然后在 custom.js 中直接使用 jQuery 即可：

    
    
    jQuery(document).ready(function($) {
        // 您的代码
    });
    

不需要这样做：

    
    
    // ❌ 不需要这样
    wp_enqueue_script('jquery');  // 不需要，WordPress 已经加载了
    

小提示：  
- 如果您的代码需要确保 jQuery 已加载，可以在 wp_enqueue_script 时将 jquery 添加为依赖：
    
    
    wp_enqueue_script('my-custom-js', get_stylesheet_directory_uri() . '/js/custom.js', array('jquery'), '1.0', true);
    

