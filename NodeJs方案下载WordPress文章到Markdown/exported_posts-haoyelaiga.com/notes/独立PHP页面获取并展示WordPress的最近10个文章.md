---
id: 210
title: 独立PHP页面获取并展示WordPress的最近10个文章
date: '2025-05-03T20:28:33'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/%e7%8b%ac%e7%ab%8bphp%e9%a1%b5%e9%9d%a2%e8%8e%b7%e5%8f%96%e5%b9%b6%e5%b1%95%e7%a4%bawordpress%e7%9a%84%e6%9c%80%e8%bf%9110%e4%b8%aa%e6%96%87%e7%ab%a0/
---

最近文章展示页面\
\* 展示最新的10篇WordPress文章\
\* 该页面通过加载WordPress环境，展示最近发布的10篇文章，包括标题、发布日期、作者和摘要。

```
<?php
/**
 * 最近文章展示页面
 * 
 * 展示最新的10篇WordPress文章
 */

// 加载WordPress环境
require_once('wp-load.php');

// 现在WordPress环境已加载，可以使用WordPress函数
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>最近文章展示</title>
    <link rel="stylesheet" href="<?php echo get_stylesheet_uri(); ?>">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div class="recent-posts-container">
    <h1 class="page-title">最近发布的文章</h1>

    <style>
        .recent-posts-container {
            max-width: 1000px;
            margin: 40px auto;
            padding: 0 20px;
        }
        .page-title {
            margin-bottom: 30px;
            text-align: center;
        }
        .recent-posts-table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .recent-posts-table th {
            background-color: #f5f5f5;
            padding: 12px 15px;
            text-align: left;
            border-bottom: 2px solid #ddd;
        }
        .recent-posts-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }
        .recent-posts-table tr:hover {
            background-color: #f9f9f9;
        }
        .post-excerpt {
            color: #666;
            margin-top: 5px;
            font-size: 0.9em;
        }
        .no-posts {
            text-align: center;
            padding: 30px;
            background: #f9f9f9;
            border-radius: 4px;
        }
    </style>

    <?php
    // Fetch the latest 10 posts
    $args = array(
        'numberposts' => 10,
        'post_status' => 'publish',
    );
    $recent_posts = get_posts($args);

    // Display posts in a table
    if (!empty($recent_posts)) {
        echo '<table class="recent-posts-table">';
        echo '<tr><th>标题</th><th>发布日期</th><th>作者</th><th>摘要</th></tr>';

        foreach ($recent_posts as $post) {
            setup_postdata($post);
            $author = get_the_author();
            $post_date = get_the_date('Y年m月d日');

            // 获取文章摘要
            $excerpt = has_excerpt() ? get_the_excerpt() : wp_trim_words(strip_shortcodes(get_the_content()), 50, '...');

            echo '<tr>';
            echo '<td><a href="' . get_permalink() . '">' . esc_html(get_the_title()) . '</a></td>';
            echo '<td>' . esc_html($post_date) . '</td>';
            echo '<td>' . esc_html($author) . '</td>';
            echo '<td><div class="post-excerpt">' . esc_html($excerpt) . '</div></td>';
            echo '</tr>';
        }
        wp_reset_postdata();

        echo '</table>';
    } else {
        echo '<div class="no-posts">暂无文章发布</div>';
    }
    ?>
</div>

<?php wp_footer(); ?>
</body>


</html>
```
