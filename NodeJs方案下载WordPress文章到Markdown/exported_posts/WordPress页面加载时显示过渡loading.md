---
id: 204
title: WordPress页面加载时显示过渡loading
date: '2025-04-28T23:10:55'
author: haoye
categories:
  - notes
tags: []
---

### 页面加载动画

在页面加载时显示一个动画，增强用户体验。

#### 在 `functions.php` 文件中添加代码

```
function add_page_loading_animation() {
    if (!is_admin()) {
        echo '
        <style>
            #loading-animation {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: #fff;
                z-index: 10000;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 24px;
                color: #000;
            }
        </style>
        <div id="loading-animation">Loading...</div>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                var loadingAnimation = document.getElementById("loading-animation");
                window.addEventListener("load", function() {
                    loadingAnimation.style.display = "none";
                });
            });
        </script>';
    }
}
add_action('wp_footer', 'add_page_loading_animation');
```

:::info

把html, CSS, JS封装在一个函数里，只是为了快速实现效果，并不是实际最佳方案。实际生产中，把html, JS，CSS放到专门的外部文件是最好。那样可以缓存。

将 HTML、CSS 和 JavaScript 封装在一个函数里有其特定的用途和意义，主要在于以下几个方面：

### 1. 快速原型设计和开发

在开发阶段，尤其是在进行快速原型设计时，将所有代码封装在一个函数里可以加快开发速度。这样做可以立即看到效果，而不用去管理多个文件。

### 2. 简化插件和主题开发

当开发插件或特定功能的主题时，可能需要在激活插件或主题时立即添加一些功能。在这种情况下，将所有代码封装在一个函数中更为方便，不用去处理额外的文件依赖。

### 3. 方便演示或分享代码

在展示或分享某个特定功能的实现时，封装在一个函数中可以让代码更易于理解和复制，尤其是在论坛、博客或问答平台上，这样可以减少外部文件的依赖，确保代码片段完整性。

### 4. 临时解决方案

在临时需要实现某些功能或进行测试时，将代码放在一个函数里可以快速实现所需效果，待功能确认后再进行代码优化和分离。

:::

### 夜间模式切换

为网站添加一个夜间模式切换按钮，用户可以在白天和夜间模式之间切换，偏好通过 `localStorage` 保存。

#### 在 `functions.php` 文件中添加代码

```
function add_night_mode_toggle() {
    if (!is_admin()) {
        echo '
        <style>
            #night-mode-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #000;
                color: #fff;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
                z-index: 1000;
            }
            body.night-mode {
                background-color: #121212;
                color: #ffffff;
            }
        </style>
        <div id="night-mode-toggle">Night Mode</div>
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                var nightModeToggle = document.getElementById("night-mode-toggle");
                var body = document.body;

                // Check for saved night mode preference
                if (localStorage.getItem("nightMode") === "enabled") {
                    body.classList.add("night-mode");
                }

                nightModeToggle.addEventListener("click", function() {
                    body.classList.toggle("night-mode");
                    if (body.classList.contains("night-mode")) {
                        localStorage.setItem("nightMode", "enabled");
                    } else {
                        localStorage.removeItem("nightMode");
                    }
                });
            });
        </script>';
    }
}
add_action('wp_footer', 'add_night_mode_toggle');
```

:::warning

这个夜间切换功能非常粗糙。只是演示功能。

:::

### 总结

这些例子展示了如何利用 WordPress 的内置函数、JavaScript 和 CSS 实现一些令人惊讶且实用的功能：

1. **实时字符计数器**：帮助用户在评论时了解剩余字符数量。
2. **动态内容推荐**：根据当前文章的标签推荐相关内容。
3. **限时优惠倒计时**：在页面顶部显示一个限时优惠倒计时条。
4. **页面加载动画**：在页面加载时显示一个动画。
5. **夜间模式切换**：为网站添加一个夜间模式切换按钮。

这些功能不仅提升了网站的用户体验，还展示了前端和后端技术的整合应用。你可以根据具体需求进一步调整和扩展这些代码。
