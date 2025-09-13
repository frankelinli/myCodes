---
author: haoye
categories:
- 随记
date: '2025-05-06T21:57:06'
id: 226
tags: []
title: wordpress根据URL中的关键词条件来弹出通知
---

我们可以通过添加一个PHP函数来实现这个功能。这个函数将在页面加载时检查URL，如果URL中包含“twitter”，则输出相应的JavaScript代码来弹出通知。

请按照以下步骤进行操作：

  1. **编辑子主题的`functions.php` 文件**：

在 `wp-content/themes/astra-child/` 目录中找到并编辑 `functions.php` 文件。

  2. **添加以下PHP代码** ：

    
    
    // Function to add notification on IETP pages
    function add_ietp_notification() {
        if (strpos($_SERVER['REQUEST_URI'], '/twittr') !== false) {
            echo '<div class="ietp-notification" style="background-color: #ffeb3b; padding: 10px; text-align: center;">
                    <p>注意：Twitter 已更名为 X。请访问 <a href="/x">新的 X 文档</a> 获取最新信息。</p>
                  </div>';
        }
    }
    add_action('wp_head', 'add_ietp_notification');
    

这个PHP函数 `add_notification_for_ietp_pages`
会检查当前请求的URL中是否包含“twitter”。如果包含，则在页面底部添加一段JavaScript代码，该代码会在页面加载完成后弹出一个通知。

这样，当用户访问包含“twitter”的URL时，就会弹出一个通知。

如果你有其他定制需求或需要进一步的帮助，请随时告诉我！

