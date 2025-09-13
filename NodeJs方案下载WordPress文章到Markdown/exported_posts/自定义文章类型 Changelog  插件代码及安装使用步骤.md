---
id: 166
title: 自定义文章类型 Changelog  插件代码及安装使用步骤
date: '2025-04-20T19:51:42'
author: haoye
categories:
  - notes
tags: []
---

基于您提供的代码，我将把它转化为一个完整的 WordPress 插件。以下是插件代码和使用步骤。

## 插件代码

创建一个名为 `simple-changelog` 的文件夹，并在其中创建以下文件：

### 1. `simple-changelog.php` (主插件文件)

```
<?php
/**
 * Plugin Name: Simple Changelog
 * Plugin URI: 
 * Description: 添加更新日志(Changelog)自定义文章类型和显示模板
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: simple-changelog
 */

// 如果直接访问此文件，则退出
if (!defined('ABSPATH')) {
    exit;
}

// 注册自定义文章类型 Changelog
function register_changelog_post_type() {
    register_post_type(
        'changelog',
        array(
            'labels' => array(
                'name' => __('Changelog', 'simple-changelog'),
                'singular_name' => __('Changelog Entry', 'simple-changelog'),
                'add_new' => __('Add New Entry', 'simple-changelog'),
                'add_new_item' => __('Add New Changelog Entry', 'simple-changelog'),
                'edit_item' => __('Edit Changelog Entry', 'simple-changelog'),
            ),
            'public' => true,
            'publicly_queryable' => false, // 禁用单个文章页面访问
            'show_ui' => true,
            'show_in_menu' => true,
            'supports' => array('title', 'editor', 'author'),
            'menu_icon' => 'dashicons-backup',
            'show_in_rest' => true, // 启用古腾堡编辑器支持
        )
    );
}
add_action('init', 'register_changelog_post_type');

// 添加自定义模板页面
function changelog_page_template($templates) {
    $templates['changelog-template.php'] = 'Changelog Template';
    return $templates;
}
add_filter('theme_page_templates', 'changelog_page_template');

// 加载自定义模板
function changelog_template_include($template) {
    if (is_page_template('changelog-template.php')) {
        $new_template = plugin_dir_path(__FILE__) . 'changelog-template.php';
        if (file_exists($new_template)) {
            return $new_template;
        }
    }
    return $template;
}
add_filter('template_include', 'changelog_template_include');

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

// 插件激活时运行的函数
function changelog_plugin_activation() {
    register_changelog_post_type();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'changelog_plugin_activation');

// 插件停用时运行的函数
function changelog_plugin_deactivation() {
    flush_rewrite_rules();
}
register_deactivation_hook(__FILE__, 'changelog_plugin_deactivation');
```

### 2. `changelog-template.php` (模板文件)

```
<?php
/**
 * 更新日志 (Changelog) 模板
 * 
 * 此模板用于以日期降序显示更新日志的文章列表。
 * 每个更新日志条目包含标题、内容以及更新日期。
 */

get_header();
?>

<div class="changelog-wrapper">
    <?php
    $changelogs = new WP_Query(array(
        'post_type' => 'changelog',
        'posts_per_page' => 3,
        'orderby' => 'date',
        'order' => 'DESC'
    ));

    if ($changelogs->have_posts()) :
        while ($changelogs->have_posts()) : $changelogs->the_post();
            $anchor_id = sanitize_title(get_the_title());
            $post_date = get_the_date('Y-m-d'); // Full date
    ?>
            <article id="<?php echo esc_attr($anchor_id); ?>" class="changelog-entry">
                <div class="changelog-header">
                    <div class="title-wrapper">
                        <h2><a href="#<?php echo esc_attr($anchor_id); ?>"><?php the_title(); ?></a></h2>
                    </div>
                </div>

                <div class="changelog-content">
                    <?php the_content(); ?>
                    <p class="changelog-date">
                        与 <?php echo esc_html($post_date); ?> 日期更新
                    </p>
                </div>
            </article>
    <?php
        endwhile;
        wp_reset_postdata();
    endif;
    ?>
</div>

<script>
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
</script>

<?php get_footer(); ?>
```

### 3. `/css/changelog.css` (CSS 样式文件)

```
.changelog-wrapper .changelog-entry {
    border-radius: 15px;
    border: 0.5rem solid antiquewhite;
    padding: 0.5rem;
    margin-bottom: 4.5rem;
    background-color: #f9f9f9;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: relative;
}

.changelog-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.title-wrapper {
    flex: 1;
}

.changelog-header h2 {
    font-size: 1.25rem;
    color: #333;
    margin-top: -1.5rem;
}

.changelog-content {
    font-size: 1rem;
    line-height: 1.6;
    color: #555;
    margin-top: 2.5rem;
}

.changelog-date {
    font-size: 0.875rem;
    color: #777;
    margin-top: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .changelog-wrapper {
        padding: 0 1rem;
    }

    .changelog-wrapper .changelog-entry {
        border-width: 0.3rem;
    }
}
```

## 安装与使用步骤

1. **创建插件文件结构**:\
   – 创建文件夹 `simple-changelog`\
   – 在此文件夹中创建 `simple-changelog.php` 文件\
   – 创建 `changelog-template.php` 文件\
   – 创建 `/css` 文件夹，并在其中创建 `changelog.css` 文件
2. **将插件上传到 WordPress**:\
   – 将整个 `simple-changelog` 文件夹压缩为 ZIP 文件\
   – 在 WordPress 后台进入 “插件” > “添加插件”\
   – 点击 “上传插件”，选择您的 ZIP 文件并安装
3. **激活插件**:\
   – 在插件列表中找到 “Simple Changelog” 并点击 “激活”
4. **创建 Changelog 条目**:\
   – 在 WordPress 后台菜单中找到新添加的 “Changelog” 菜单项\
   – 点击 “添加新条目” 并填写标题和内容\
   – 发布几个 changelog 条目
5. **创建显示页面**:\
   – 创建新页面，例如 “更新日志”\
   – 在右侧的 “页面属性” 面板中，从 “模板” 下拉菜单选择 “Changelog Template”\
   – 发布页面
6. **查看您的 Changelog 页面**:\
   – 访问您刚创建的页面，查看 changelog 显示效果

## 自定义设置

- **更改每页显示数量**: 在 `changelog-template.php` 中修改 `posts_per_page` 参数
- **调整样式**: 编辑 `css/changelog.css` 文件以匹配您网站的设计
- **添加更多功能**: 您可以根据需要扩展插件，添加设置页面、自定义字段等

现在您有了一个完整的 Changelog 插件，可以独立于主题使用，并在需要时轻松转移到其他网站。
