---
author: haoye
categories:
- 随记
date: '2025-04-21T06:45:08'
id: 174
tags: []
title: WordPress插件按需加载CSS-不要全局加载CSS
---

这是一个很好的问题！在当前插件的实现中，CSS 文件是全站加载的。将主插件文件 `simple-changelog.php`
中的相关部分替换为上面的按需加载代码，就能确保 CSS 只在访问 changelog 页面时才加载，而不会影响网站的其他部分。

## 当前实现 (全站加载)

在我提供的插件代码中，CSS 的注册和加载是通过以下代码完成的：

    
    
    // 注册和加载样式
    function changelog_enqueue_styles() {
        wp_enqueue_style(
            'changelog-styles',
            plugin_dir_url(__FILE__) . 'css/changelog.css',
            array(),
            '1.0.0'
        );
    }
    add_action('wp_enqueue_scripts', 'changelog_enqueue_styles');
    

这里使用的 `wp_enqueue_scripts` 钩子会在每个页面加载时触发，因此 CSS 会在全站的每个页面上加载，无论用户是否访问
changelog 页面。

## 优化实现 (按需加载)

为了只在用户访问 changelog 模板页面时加载 CSS，我们应该修改代码如下：

    
    
    // 只在 changelog 模板页面加载样式
    function changelog_enqueue_styles() {
        // 检查当前是否是我们的 changelog 模板页面
        if (is_page_template('changelog-template.php')) {
            wp_enqueue_style(
                'changelog-styles',
                plugin_dir_url(__FILE__) . 'css/changelog.css',
                array(),
                '1.0.0'
            );
        }
    }
    add_action('wp_enqueue_scripts', 'changelog_enqueue_styles');
    

这个修改后的函数会检查当前页面是否使用了 `changelog-template.php` 模板，只有在使用该模板时才会加载 CSS 文件。

## 好处

按需加载的好处包括：

  1. **性能优化** - 减少不必要的资源加载，提高网站整体速度
  2. **避免冲突** - 降低与其他页面样式冲突的可能性
  3. **更加高效** - 只在实际需要时才使用带宽和浏览器资源

## 更新插件代码

将主插件文件 `simple-changelog.php` 中的相关部分替换为上面的按需加载代码，就能确保 CSS 只在访问 changelog
页面时才加载，而不会影响网站的其他部分。

这样修改后，用户只有在实际访问 changelog 页面时才会下载和处理这些 CSS 样式，提高了网站的整体性能和效率。

