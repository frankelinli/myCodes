---
id: 37
title: add_post_meta()给文章添加阅读时间
date: '2025-04-17T01:13:28'
author: haoye
categories:
  - notes
tags: []
url: https://haoyelaiga.com/add_post_meta%e7%bb%99%e6%96%87%e7%ab%a0%e6%b7%bb%e5%8a%a0%e9%98%85%e8%af%bb%e6%97%b6%e9%97%b4/
---

假设我们有一个博客，需要为每篇文章存储一个自定义的阅读时间。那么，我们可以使用 `add_post_meta()` 来实现这一功能。

### 示例代码

在主题的 `functions.php` 文件中添加以下代码：

```
function add_reading_time_meta($post_id) {
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    // 检查用户权限
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $meta_key = 'reading_time';

    // 假设每分钟阅读200个字
    $content = get_post_field('post_content', $post_id);
    $word_count = str_word_count(strip_tags($content));
    $reading_time = ceil($word_count / 200);

    // 添加或更新阅读时间元数据
    if (!add_post_meta($post_id, $meta_key, $reading_time, true)) {
        update_post_meta($post_id, $meta_key, $reading_time);
    }
}

add_action('save_post', 'add_reading_time_meta');
```

### 代码说明

1. **自动保存检查**:\
   – 确保不在自动保存时执行代码。

2. **权限检查**:\
   – 确保用户有权限编辑文章。

3. **计算阅读时间**:\
   – 获取文章内容。\
   – 计算字数，假设每分钟阅读 200 个字。\
   – 计算阅读时间并向上取整。

4. **添加或更新元数据**:\
   – 使用 `add_post_meta()` 添加阅读时间。\
   – 如果已存在，则用 `update_post_meta()` 更新。

### 使用场景

- **显示阅读时间**:
- 在文章模板中显示阅读时间，提升用户体验。

### 前端显示

在文章模板中，可以使用以下代码显示阅读时间：

```
$reading_time = get_post_meta(get_the_ID(), 'reading_time', true);
if ($reading_time) {
    echo '<p>Estimated reading time: ' . $reading_time . ' min</p>';
}
```

这样，每次保存文章时，都会自动计算并存储阅读时间，并可以在前端显示。
