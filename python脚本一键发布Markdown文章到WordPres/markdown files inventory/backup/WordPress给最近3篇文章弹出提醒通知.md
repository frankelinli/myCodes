在访客浏览最近 3 篇文章时，在顶部显示一个通知。将所有逻辑封装在一个函数里，并在 `functions.php` 文件中添加这个函数。这个函数将包含通知的 HTML、JavaScript 和 CSS。

以下是封装后的完整代码示例：



### 1. 在 `functions.php` 文件中添加代码

将以下代码添加到你的子主题的 `functions.php` 文件中：

```php
function display_recent_posts_notification() {
    if (is_single() && !is_admin()) {
        global $post;
        $recent_posts = wp_get_recent_posts(array(
            'numberposts' => 3, // 获取最近的3篇文章
            'post_status' => 'publish',
        ));

        $post_ids = wp_list_pluck($recent_posts, 'ID');

        if (in_array($post->ID, $post_ids)) {
            // 输出通知的HTML和CSS
            echo '
            <style>
                #recent-posts-notification {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background-color: #ffeb3b;
                    color: #000;
                    text-align: center;
                    padding: 10px;
                    z-index: 1000;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    display: none; /* 初始隐藏，JavaScript 控制显示 */
                }
            </style>
            <div id="recent-posts-notification">
                You are reading one of the latest 3 posts!
            </div>
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    var notification = document.getElementById("recent-posts-notification");
                    if (notification) {
                        notification.style.display = "block";
                        setTimeout(function() {
                            notification.style.display = "none";
                        }, 5000); // 通知显示5秒
                    }
                });
            </script>';
        }
    }
}
add_action('wp_footer', 'display_recent_posts_notification');
```

### 2. 解释代码

- **检查是否为单篇文章页面**：`is_single()` 确保代码仅在单篇文章页面执行。
- **获取最近的 3 篇文章**：使用 `wp_get_recent_posts()` 函数获取最近发布的 3 篇文章。
- **检查当前文章是否在最近的 3 篇文章中**：使用 `in_array()` 检查当前文章的 ID 是否在最近文章的 ID 列表中。
- **输出通知的 HTML、CSS 和 JavaScript**：
  - **CSS**：样式化通知栏，使其固定在页面顶部。
  - **HTML**：定义通知栏的内容。
  - **JavaScript**：在页面加载时显示通知，并在 5 秒后隐藏。

### 总结

通过将所有代码封装在一个函数中，并使用 `wp_footer` 钩子将其添加到页脚，你可以确保通知在访客浏览最近 3 篇文章时显示，并且实现过程简单且易于维护。如果需要调整通知的样式或行为，可以直接在函数内部进行修改。
