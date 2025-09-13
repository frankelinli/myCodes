---
author: haoye
categories:
- 随记
date: '2025-04-19T12:19:21'
id: 144
tags: []
title: 善用管理员可见的wp_footer来调试
---

输出到管理员可见的wp-footer，可以用来调试，很方便啊。举几个例子说明

以下是几个实用的调试输出示例，都添加到 functions.php 中：

  1. 检查当前页面模板：

    
    
    function debug_template_info() {
        if ( current_user_can( 'administrator' ) ) {
            echo '<!-- Debug Template Info -->';
            echo '<div style="background:#f1f1f1;padding:10px;margin:20px;border:1px solid #ddd;">';
            echo 'Template File: ' . get_page_template_slug();
            echo '<br>Post Type: ' . get_post_type();
            echo '<br>Page Type: ' . (is_single() ? 'Single' : (is_page() ? 'Page' : 'Other'));
            echo '</div>';
        }
    }
    add_action( 'wp_footer', 'debug_template_info' );
    

  2. 显示当前使用的钩子：

    
    
    function debug_current_hooks() {
        if ( current_user_can( 'administrator' ) ) {
            global $wp_actions;
            echo '<!-- Debug Hooks -->';
            echo '<div style="background:#f1f1f1;padding:10px;margin:20px;border:1px solid #ddd;">';
            echo 'Current Active Hooks:<br>';
            foreach ( $wp_actions as $action => $count ) {
                echo $action . ' (' . $count . ')<br>';
            }
            echo '</div>';
        }
    }
    add_action( 'wp_footer', 'debug_current_hooks' );
    

  3. 查看Astra主题设置：

    
    
    function debug_astra_settings() {
        if ( current_user_can( 'administrator' ) ) {
            echo '<!-- Debug Astra Settings -->';
            echo '<div style="background:#f1f1f1;padding:10px;margin:20px;border:1px solid #ddd;">';
            echo 'Astra Settings:<br>';
            $theme_options = get_option( 'astra-settings' );
            echo '<pre>';
            print_r( $theme_options );
            echo '</pre>';
            echo '</div>';
        }
    }
    add_action( 'wp_footer', 'debug_astra_settings' );
    

  4. 查看当前页面的查询：

    
    
    function debug_current_query() {
        if ( current_user_can( 'administrator' ) ) {
            global $wp_query;
            echo '<!-- Debug Query -->';
            echo '<div style="background:#f1f1f1;padding:10px;margin:20px;border:1px solid #ddd;">';
            echo 'Current Query:<br>';
            echo '<pre>';
            print_r( $wp_query->query );
            echo '</pre>';
            echo '</div>';
        }
    }
    add_action( 'wp_footer', 'debug_current_query' );
    

  5. 显示已加载的脚本和样式：

    
    
    function debug_enqueued_scripts() {
        if ( current_user_can( 'administrator' ) ) {
            global $wp_scripts, $wp_styles;
            echo '<!-- Debug Enqueued Scripts/Styles -->';
            echo '<div style="background:#f1f1f1;padding:10px;margin:20px;border:1px solid #ddd;">';
            echo 'Enqueued Scripts:<br>';
            foreach( $wp_scripts->queue as $script ) {
                echo $script . '<br>';
            }
            echo '<br>Enqueued Styles:<br>';
            foreach( $wp_styles->queue as $style ) {
                echo $style . '<br>';
            }
            echo '</div>';
        }
    }
    add_action( 'wp_footer', 'debug_enqueued_scripts' );
    

这些调试输出都：  
1\. 仅对管理员可见  
2\. 添加在页面底部  
3\. 使用容易识别的HTML注释  
4\. 有基本的样式便于阅读  
5\. 可以同时使用多个

使用时注意：  
- 只在开发环境中使用  
- 正式环境记得删除或注释掉  
- 可以根据需要修改样式让显示更醒目  
- 可以添加更多你需要的信息

