---
id: 72
title: '`template-parts` 目录与 `get_template_part()` 函数详解'
slug: template-parts-%e7%9b%ae%e5%bd%95%e4%b8%8e-get_template_part-%e5%87%bd%e6%95%b0%e8%af%a6%e8%a7%a3
date: '2025-04-17T15:11:14'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/template-parts-%e7%9b%ae%e5%bd%95%e4%b8%8e-get_template_part-%e5%87%bd%e6%95%b0%e8%af%a6%e8%a7%a3/
---

# `template-parts` 目录与 `get_template_part()` 函数详解

`template-parts` 目录是WordPress主题中用于存放可复用模板片段的常见位置，配合 `get_template_part()` 函数使用。这是WordPress主题开发中一种非常重要的最佳实践，下面我来详细解释并举例说明。

它的主要特征是“可复用”，在其他地方，可以重复引用这个片段。

## `template-parts` 目录的用途

`template-parts` 目录通常用于存放：

- 文章循环 (loop) 的模板片段
- 内容块 (content blocks)
- 可重用的页面部分（如文章元数据、作者信息框等）
- 不同文章格式的内容模板

## `get_template_part()` 函数

`get_template_part()` 函数是WordPress内置函数，用于加载模板片段。其基本语法是：

```
get_template_part( $slug, $name = null, $args = array() );
```

- `$slug`: 必需，模板文件的基本名称
- `$name`: 可选，模板名称的特定修饰符
- `$args`: WordPress 5.5+支持的参数数组，可以传递到模板片段中

## 实际例子

### 例子1：基本的内容片段复用

假设我们有一个博客，想在多个页面复用文章卡片的展示样式。

1. 首先创建模板片段：

```
/wp-content/themes/your-theme/
  /template-parts/
    /content/
      card.php
```

`card.php` 的内容：

```
<article class="post-card">
    <div class="post-thumbnail">
        <?php if (has_post_thumbnail()) : ?>
            <?php the_post_thumbnail('medium'); ?>
        <?php endif; ?>
    </div>
    <div class="post-content">
        <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
        <div class="post-meta">
            <?php echo get_the_date(); ?> | <?php the_author(); ?>
        </div>
        <div class="post-excerpt">
            <?php the_excerpt(); ?>
        </div>
    </div>
</article>
```

1. 然后在主循环中调用这个模板片段：

```
<?php
// 在archive.php或index.php中
if (have_posts()) :
    while (have_posts()) :
        the_post();
        get_template_part('template-parts/content/card');
    endwhile;
endif;
?>
```

### 例子2：使用修饰符处理不同文章格式

1. 创建不同格式的内容模板：

```
/template-parts/
  /content/
    content.php (默认格式)
    content-video.php (视频格式)
    content-gallery.php (画廊格式)
```

1. 在single.php中根据文章格式加载相应模板：

```
<?php
while (have_posts()) :
    the_post();

    // 获取文章格式
    $format = get_post_format();
    if (empty($format)) {
        $format = 'standard';
    }

    // 加载相应的模板
    get_template_part('template-parts/content/content', $format);
endwhile;
?>
```

如果当前文章是视频格式，它会加载 `content-video.php`；如果是标准格式，它会加载 `content.php`。

### 例子3：传递参数到模板片段 (WordPress 5.5+)

1. 创建一个接收参数的模板片段：

```
<?php
// template-parts/components/featured-post.php
$title = isset($args['title']) ? $args['title'] : '推荐文章';
$post_id = isset($args['post_id']) ? $args['post_id'] : null;

if ($post_id) :
    $featured_post = get_post($post_id);
    setup_postdata($featured_post);
?>
    <div class="featured-post">
        <h3><?php echo esc_html($title); ?></h3>
        <h4><?php the_title(); ?></h4>
        <?php the_excerpt(); ?>
        <a href="<?php the_permalink(); ?>" class="read-more">阅读更多</a>
    </div>
<?php 
    wp_reset_postdata();
endif;
?>
```

1. 在页面中调用并传递参数：

```
<?php
// 首页特色文章
$featured_post_id = get_option('homepage_featured_post');
if ($featured_post_id) {
    get_template_part('template-parts/components/featured-post', null, array(
        'title' => '本周精选',
        'post_id' => $featured_post_id
    ));
}
?>
```

## 使用 `template-parts` 的优势

1. **可维护性**：将复杂模板拆分为更小、更可管理的部分
2. **可重用性**：相同的模板片段可以在多个位置使用
3. **模块化**：遵循DRY(Don’t Repeat Yourself)原则
4. **主题兼容性**：子主题可以覆盖父主题中的模板部分

## 为什么维护模式不适合放在 `template-parts`

现在回到我们讨论的维护模式模板。维护模式页面与普通模板片段有以下区别：

1. 它是一个完整的HTML文档，包括 `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` 等标签
2. 它直接输出并终止WordPress执行，而不是嵌入到主题其他部分
3. 它不是通过 `get_template_part()` 函数调用的
4. 它不属于WordPress正常的模板层次结构

因此，将维护模式页面放在 `inc` 目录或专门的 `maintenance` 子目录更加合适，体现其特殊性和与主题正常显示流程的区别。

使用 `inc/maintenance` 目录将功能代码和模板代码一起存放是更合理的选择。
