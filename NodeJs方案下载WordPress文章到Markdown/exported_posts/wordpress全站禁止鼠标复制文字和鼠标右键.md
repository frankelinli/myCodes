---
id: 130
title: wordpress全站禁止鼠标复制文字和鼠标右键
date: '2025-04-19T12:17:13'
author: haoye
categories:
  - notes
tags: []
---

在WordPress网站上禁止鼠标左键和右键点击，可以通过添加自定义的JavaScript代码来实现。这些代码可以放在主题的`functions.php`文件中，或者通过安装插件来添加自定义代码。以下是两种实现方法：

### 方法一：在`functions.php`文件中添加代码

1. 进入WordPress后台，导航到外观 > 主题文件编辑器。
2. 在右侧选择`functions.php`文件。
3. 在文件的末尾添加以下代码：

```
function disable_mouse_clicks() {
    ?>
    <script type="text/javascript">
        // 禁止鼠标右键点击
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        // 禁止鼠标左键点击选择文本
        document.addEventListener('mousedown', function(e) {
            if (e.button == 0) {
                e.preventDefault();
            }
        });

        // 禁止键盘快捷键 (如Ctrl+C)
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'a')) {
                e.preventDefault();
            }
        });
    </script>
    <?php
}
add_action('wp_footer', 'disable_mouse_clicks');
```

我是通过修改子主题的function来实现的。

***

上面是复杂化的方法。其实很简单，把JS代码放入网站就好了。可以直接放进`<head>`里，用elementor的自定义代码，放进去也可以。用Astra hook代码或者可视化来实现更简单

## 对未登录用户禁用左右键和下载按钮

当然可以实现。为了在 WordPress 中对未登录的访客应用这些限制，而对已登录的会员解除限制，你可以使用 WordPress 提供的函数来检测用户的登录状态，并根据状态动态插入 JavaScript 代码。

以下是一个示例，展示如何在 WordPress 中实现这一点：

1. 将以下代码添加到您主题的 `functions.php` 文件中：

```
function restrict_content_for_guests() {
    if (!is_user_logged_in()) {
        ?>
        <script type="text/javascript">
            // 禁止鼠标右键点击
            document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });

            // 禁止鼠标左键点击选择文本
            document.addEventListener('mousedown', function(e) {
                if (e.button == 0) {
                    e.preventDefault();
                }
            });

            // 禁止键盘快捷键 (如Ctrl+C)
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'a' || e.key === 'p')) {
                    e.preventDefault();
                }
            });

            // 禁用全站的下载按钮
            document.addEventListener('click', function(e) {
                var target = e.target;
                if (target.tagName.toLowerCase() === 'a' && target.hasAttribute('download')) {
                    e.preventDefault();
                    alert('下载功能已禁用');
                }
            });

            // 禁用PDF另存为功能
            document.querySelectorAll('object, embed').forEach(function(element) {
                element.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                });
            });
        </script>
        <style>
            /* 禁用对象和嵌入类型的内容选择 */
            object, embed {
                pointer-events: none;
            }
        </style>
        <?php
    }
}
add_action('wp_footer', 'restrict_content_for_guests');
```

2. 保存 `functions.php` 文件。

在这个代码片段中：

- `restrict_content_for_guests` 函数首先检查用户是否已登录。
- 如果用户未登录，则插入包含限制功能的 JavaScript 和 CSS 代码到网页的底部（`wp_footer` 钩子）。

这样，只有未登录的访客会受到这些限制，而已登录的会员将不会受到影响。确保在修改 `functions.php` 文件之前备份您的主题文件，以防出现意外问题。
