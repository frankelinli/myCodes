frankelinli: 解释本文档功能

GitHub.copilot-chat.github.copilot.editor: 这段代码是一个 WordPress 模板文件，名为 template-changelog.php，用于显示一个“变更日志”（Changelog）页面。以下是它的功能分解和详细解释：

---

### 1. **模板声明**
```php
/*
Template Name: Changelog
*/
```
- 这段注释告诉 WordPress，这个文件是一个自定义页面模板，名为“Changelog”。
- 在 WordPress 后台创建页面时，可以选择这个模板来生成一个变更日志页面。

---

### 2. **加载头部模板**
```php
get_header();
```
- 调用 WordPress 的 `get_header()` 函数，加载主题的头部文件（通常是 `header.php`）。

---

### 3. **查询变更日志文章**
```php
$changelogs = new WP_Query(array(
    'post_type' => 'changelog',
    'posts_per_page' => -1,
    'orderby' => 'date',
    'order' => 'DESC'
));
```
- 使用 `WP_Query` 查询自定义文章类型 `changelog`。
- 查询所有变更日志文章（`posts_per_page => -1` 表示不限制数量）。
- 按日期降序排列（`orderby => 'date'` 和 `order => 'DESC'`）。

---

### 4. **循环输出变更日志**
```php
if ($changelogs->have_posts()) :
    while ($changelogs->have_posts()) : $changelogs->the_post();
```
- 检查是否有符合条件的文章。
- 如果有，使用 `while` 循环遍历每篇文章。

---

### 5. **生成锚点链接**
```php
$anchor_id = sanitize_title(get_the_title());
```
- 使用 `sanitize_title()` 函数将文章标题转换为 URL 友好的格式，作为锚点 ID。
- 例如，标题 "Version 1.0 Released" 会被转换为 `version-1-0-released`。

---

### 6. **文章结构**
每篇文章的 HTML 结构如下：
```php
<article id="<?php echo esc_attr($anchor_id); ?>" class="changelog-entry">
    <div class="changelog-header">
        <div class="author-meta">
            <?php echo get_avatar(get_the_author_meta('email'), 40); ?>
            <div class="author-info">
                <span class="author-name"><?php echo get_the_author(); ?></span>
                <time datetime="<?php echo get_the_date('c'); ?>">
                    <?php echo get_the_date(); ?>
                </time>
            </div>
        </div>
        <h2><a href="#<?php echo esc_attr($anchor_id); ?>"><?php the_title(); ?></a></h2>
    </div>
    <div class="changelog-content">
        <?php the_content(); ?>
    </div>
</article>
```
- **`<article>` 标签**：每篇变更日志用 `<article>` 包裹，`id` 是锚点 ID。
- **作者信息**：
  - 使用 `get_avatar()` 显示作者头像。
  - 显示作者名称和发布日期。
- **标题和锚点链接**：
  - 标题用 `<h2>` 包裹，链接到文章的锚点 ID。
- **内容**：
  - 使用 `the_content()` 输出文章内容。

---

### 7. **平滑滚动功能**
```javascript
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.changelog-entry h2 a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.history.pushState(null, '', `#${targetId}`);
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }
});
```
- **点击锚点链接时**：
  - 阻止默认跳转行为。
  - 获取目标元素的 ID，并平滑滚动到该位置。
  - 更新浏览器地址栏的 URL，但不刷新页面。
- **页面加载时**：
  - 如果 URL 包含锚点（如 `#version-1-0-released`），页面加载后会平滑滚动到对应的文章。

---

### 8. **重置查询**
```php
wp_reset_postdata();
```
- 在循环结束后，重置 WordPress 的全局查询对象，避免影响后续的查询。

---

### 9. **加载页脚模板**
```php
get_footer();
```
- 调用 `get_footer()` 函数，加载主题的页脚文件（通常是 `footer.php`）。

---

### 总结
这个模板的主要功能是：
1. 查询并显示所有 `changelog` 类型的文章。
2. 为每篇文章生成锚点链接，支持点击标题跳转到对应位置。
3. 实现平滑滚动效果，提升用户体验。
4. 页面加载时自动滚动到 URL 中指定的锚点位置。

适用场景：用于展示版本更新记录、变更日志等内容，方便用户快速浏览和定位到特定版本的更新信息。