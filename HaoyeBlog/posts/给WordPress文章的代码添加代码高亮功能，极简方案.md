---
id: 89
title: 给WordPress文章的代码添加代码高亮功能，极简方案
slug: simple-method-to-add-code-hightlight-solve
date: '2025-04-17T18:28:42'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/simple-method-to-add-code-hightlight-solve/
---

Highlight.js 代码高亮功能是一个轻量级代码高亮解决方案，使用 Highlight.js 库自动识别并美化您博客中的代码块。不需要为每个代码片段指定语言，系统会自动检测。功能包括：代码语法高亮显示、自适应主题风格、右上角复制按钮以及移动设备友好的响应式显示。

使用时只需将代码放在 `<pre>` 标签内即可，例如 `<pre>function example() { console.log("Hello"); }</pre>`，**无需修改已有文章的代码块格式。**

这个方案优势在于配置简单、兼容性好、自动识别语言，为读者提供更好的代码阅读和复制体验。

```
<?php
/**
 * 简单可靠的代码高亮实现 - 修复复制按钮问题
 *
 * @package HaoWiki
 */

// 防止直接访问
if (!defined('ABSPATH')) {
    exit;
}

/**
 * 加载 Highlight.js 资源
 */
function haowiki_enqueue_highlightjs() {
    // CDN 链接
    wp_enqueue_style(
        'highlightjs-style',
        'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/default.min.css',
        array(),
        '11.7.0'
    );

    wp_enqueue_script(
        'highlightjs',
        'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js',
        array('jquery'),
        '11.7.0',
        true
    );

    // 添加初始化代码
    wp_add_inline_script('highlightjs', '
        jQuery(document).ready(function($) {
            if (typeof hljs !== "undefined") {
                // 简单配置
                hljs.configure({
                    ignoreUnescapedHTML: true
                });

                // 高亮所有pre代码块
                $("pre").each(function(i, block) {
                    hljs.highlightElement(block);
                });

                console.log("HaoWiki代码高亮已启用");
            }
        });
    ');
}
add_action('wp_enqueue_scripts', 'haowiki_enqueue_highlightjs');

/**
 * 添加基本样式和复制按钮功能
 * 修复：将复制按钮功能完全重写，确保正确位置和功能
 */
function haowiki_code_highlight_styles() {
    ?>
    <style>
        /* 基本样式增强 */
        pre {
            padding: 16px;
            overflow: auto;
            border-radius: 4px;
            background-color: #f6f8fa;
            border: 1px solid #e1e4e8;
            margin: 1em 0;
            position: relative; /* 确保能正确定位按钮 */
        }

        /* 复制按钮样式 - 修复定位问题 */
        .code-copy-button {
            position: absolute;
            top: 5px;
            right: 5px;
            padding: 3px 8px;
            font-size: 12px;
            background: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 3px;
            cursor: pointer;
            z-index: 10;
            opacity: 0.6;
            transition: opacity 0.3s;
        }

        .code-copy-button:hover {
            opacity: 1;
            background: #f1f1f1;
        }

        /* 成功反馈样式 */
        .copy-success {
            background: #e8f5e9 !important;
            border-color: #a5d6a7 !important;
        }
    </style>
    <?php
}
add_action('wp_head', 'haowiki_code_highlight_styles');

/**
 * 添加复制按钮功能 - 完全分离处理以修复问题
 */
function haowiki_add_copy_buttons() {
    ?>
    <script>
    jQuery(document).ready(function($) {
        // 等待高亮.js完成处理
        setTimeout(function() {
            // 为每个pre添加复制按钮
            $("pre").each(function() {
                var $pre = $(this);

                // 创建按钮元素 - 使用独立容器防止干扰代码展示
                var $button = $('<button class="code-copy-button">复制</button>');

                // 将按钮添加到pre后面，而不是内部
                $pre.append($button);

                // 绑定点击事件
                $button.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // 获取pre中的代码文本
                    var codeText = $pre.text().replace('复制', '');

                    try {
                        // 现代剪贴板API
                        navigator.clipboard.writeText(codeText).then(function() {
                            // 成功复制的反馈
                            $button.text('已复制!');
                            $button.addClass('copy-success');

                            setTimeout(function() {
                                $button.text('复制');
                                $button.removeClass('copy-success');
                            }, 2000);
                        });
                    } catch (err) {
                        // 回退方法
                        var textarea = document.createElement('textarea');
                        textarea.value = codeText;
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();

                        try {
                            document.execCommand('copy');
                            $button.text('已复制!');
                            $button.addClass('copy-success');
                        } catch (err) {
                            $button.text('复制失败');
                            console.error('复制失败:', err);
                        }

                        document.body.removeChild(textarea);

                        setTimeout(function() {
                            $button.text('复制');
                            $button.removeClass('copy-success');
                        }, 2000);
                    }
                });
            });
        }, 1000); // 给页面足够时间加载和处理高亮
    });
    </script>
    <?php
}
add_action('wp_footer', 'haowiki_add_copy_buttons', 100); // 较高优先级确保在其他脚本之后运行   
```
