---
id: 901
title: WordPress自动提取文章第一张图片为封面特色图片
slug: wordpress use 1st photo as feature image
categories:
  - notes
tags: []
---

![](https://haoyelaiga.com/wp-content/uploads/2025/10/image-20251013085420559.webp)

在 WordPress 的 PHP 端，完全可以实现“自动提取文章首图并设置为封面图”的逻辑，无需在 Markdown 层处理。这通常通过钩子函数（如 `save_post` 或 `wp_insert_post`) 来实现。下面是技术原理和代码示例：

## 技术原理：提取首图 → 设置 `featured_media`

:::info

技术原理：提取首图 → 设置 `featured_media`

1. **监听文章保存事件**
   
   - 使用 `save_post` 钩子，在<u>文章发布或更新时</u>触发。
   
2. **提取文章内容中的首张图片**
   
   - 使用<u>正则或 DOM</u> 解析，获取 `<img>` 标签的 `src`。
   
     本项目使用正则匹配（简单快速）
   
3. **根据图片URL倒推它的媒体库ID**
   
   - 使用 `attachment_url_to_postid()` 获取对应的媒体 ID。
   
4. **设置为封面图**
   
   - 使用 `set_post_thumbnail()` 将该媒体 ID 设为文章的封面图。

:::

## 根据图片URL倒推它的媒体库ID

### `attachment_url_to_postid()函数`

在 WordPress 中，经常需要根据图片 URL 找到它在媒体库中的 **附件 ID（attachment ID）**。 可以用到的函数是：`attachment_url_to_postid()`。

```php
attachment_url_to_postid( string $url ): int
```

**作用**：根据媒体文件（图片、音/视频等）的 **完整 URL**，返回对应的 **attachment ID**。 **返回值**：找到返回 `int`（ID），找不到返回 `0`。

`attachment_url_to_postid()` 主要匹配的是数据库中记录的 `'_wp_attached_file'`（即上传目录下的**原始文件路径**），函数把 URL 中的上传路径部分提取出来，用它在数据库里查找对应附件记录。

### `attachment_url_to_postid()`函数无法识别`-1024x768`等自动缩略图URL

该函数做的是**精确 / 基于文件名的匹配**，并不会主动去“去掉”或“忽略”派生文件名后缀（例如 `-1024x768`、`-150x150`、`-scaled` 等）。
 因此，如果你传入的 URL 是派生尺寸文件（`photo-1024x768.webp`）或 `photo-scaled.webp`，而数据库只记录了 `photo.webp`，`attachment_url_to_postid()` 会返回 `0`。

```php
    <!-- 媒体库图片URL转ID示例 -->
<?PHP
$url = 'http://localhost:10004/wp-content/uploads/2025/10/ride-motor-150x150.jpg';
$attachment_id = attachment_url_to_postid($url);

if ($attachment_id) {
  echo "该图片的媒体ID是：$attachment_id";
} else {
  echo "未找到对应的媒体库文件";
}

```

上述代码会返回“未找到对应的媒体库文件。因为`attachment_url_to_postid()` 无法处理图片的`-150x150.jpg`后缀。它只能处理媒体库的原图URL http://localhost:10004/wp-content/uploads/2025/10/ride-motor.jpg 

### 增强版函数`get_attachment_id_from_url()` ，能处理带`-150x150.jpg`后缀的图片

下面给出一个实用增强版函数 `get_attachment_id_from_url()`，它会尝试多种变体（原 URL、去除 `-scaled`、去除 `-NxM`）来查找 attachment_id。把这个函数放到主题 `functions.php` 或工具类里即可复用。

```php
/**
 * 根据图片 URL 智能查找 attachment ID（兼容 -scaled 与 -{width}x{height} 后缀）
 *
 * @param string $url 完整图片 URL
 * @return int attachment ID 或 0
 */
function get_attachment_id_from_url( $url ) {
    if ( empty( $url ) ) return 0;

    // 1) 直接匹配
    $id = attachment_url_to_postid( $url );
    if ( $id ) return $id;

    // 2) 去掉 -scaled 后缀（photo-scaled.webp -> photo.webp）
    $url_noscale = preg_replace( '/-scaled(\.[a-zA-Z0-9]+)$/', '$1', $url );
    if ( $url_noscale !== $url ) {
        $id = attachment_url_to_postid( $url_noscale );
        if ( $id ) return $id;
    }

    // 3) 去掉 -{width}x{height}（photo-1024x768.webp -> photo.webp）
    $url_nosize = preg_replace( '/-\d+x\d+(\.[a-zA-Z0-9]+)$/', '$1', $url );
    if ( $url_nosize !== $url ) {
        $id = attachment_url_to_postid( $url_nosize );
        if ( $id ) return $id;
    }

    // 4) 同时去掉 scaled 与尺寸（photo-scaled-1024x768.webp -> photo.webp）
    $url_clean = preg_replace( '/(-scaled)?(-\d+x\d+)?(\.[a-zA-Z0-9]+)$/', '$3', $url );
    if ( $url_clean !== $url ) {
        $id = attachment_url_to_postid( $url_clean );
        if ( $id ) return $id;
    }

    return 0;
}
```

![image-20251013230557501](https://haoyelaiga.com/wp-content/uploads/2025/10/image-20251013230557501.webp)

这个增强版函数的好处：

- 能同时识别 `-scaled` 及 尺寸后缀；
- 有多层 fallback（回退逻辑）；
- 考虑了 WordPress 不同版本行为；
- 在真实项目中几乎不可能漏掉合法媒体文件。

## 综合示例：自动将WordPress正文第一张图设为特色图（使用上面增强版函数函数）

```php
function auto_set_featured_image_from_first_img( $post_id ) {
    if ( wp_is_post_autosave( $post_id )) return;
    if ( has_post_thumbnail( $post_id ) ) return;

    $content = get_post_field( 'post_content', $post_id );
    if ( empty( $content ) ) return;

    if ( preg_match('/<img[^>]+src=["\']([^"\']+)["\']/i', $content, $matches) ) {
        $img_url = $matches[1];
        $attachment_id = get_attachment_id_from_url( $img_url );
        if ( $attachment_id ) {
            set_post_thumbnail( $post_id, $attachment_id );
        }
    }
}
add_action( 'save_post', 'auto_set_featured_image_from_first_img' );

```

## 代码说明

| 步骤                         | 说明                                    |
| ---------------------------- | --------------------------------------- |
| `save_post`                  | 每次保存文章时触发                      |
| `attachment_url_to_postid()` | 将图片 URL 映射为媒体库 ID              |
| `set_post_thumbnail()`       | 设置封面图，更新 `_thumbnail_id` 元字段 |

## 特点与优势

| 功能          | 描述                                   |
| ------------- | -------------------------------------- |
| 自动触发      | 每次保存文章时自动检查                 |
| 无需前端干预  | 不依赖 Markdown 或编辑器               |
| 兼容 REST API | **即使通过 API 发布文章也能生效**      |
| 可扩展性      | 可加条件限制，如仅对特定分类或作者生效 |



## 设置封面图片，不会再生成一次图片

**设置封面图片（**`set_post_thumbnail()` **或通过 REST API 设置** `featured_media`**）时，WordPress 并不会重新生成图片文件或尺寸**。它只是将文章的 `_thumbnail_id` 元字段指向已有的媒体库图片 ID。

| 阶段             | 是否生成图片尺寸 | 说明                                                         |
| ---------------- | ---------------- | ------------------------------------------------------------ |
| **上传图片时**   | ✅ 会生成         | WordPress 会根据注册的尺寸（如 `thumbnail`, `medium`, `large`）生成多个版本 |
| **设置封面图时** | ❌ 不会生成       | 只是建立引用，不会重新裁剪或处理图片                         |
| **前台展示时**   | 取决于主题       | 主题可能调用 `wp_get_attachment_image()`，自动选择合适尺寸输出 HTML |

举个例子。你上传了一张 `image.jpg`，WordPress默认 会生成：

- `image-150x150.jpg`（缩略图）
- `image-300x200.jpg`（中等尺寸）
- `image.jpg`（原图）

当你执行：

```
set_post_thumbnail($post_id, $attachment_id);
```

WordPress 只是将 `$post_id` 的 `_thumbnail_id` 设置为 `$attachment_id`，不会再生成任何新图。



:::warning

记得在Astra主题中关掉“正文内显示特色图片”，否则一篇文章内会有2个一模一样的图片。就重复了。

:::

[解读attachment_url_to_postid](https://chatgpt.com/c/68ebcf3b-7494-8333-9274-cd105ee040c3)

## 批量处理站内旧文章，提取文章内的第一张图片为特色封面图片

上面的函数是当保存文章时触发函数，提取文章内的第一张图片为特色封面图片。但是对于已经发布的文章，无法做到逐一去编辑保存-这太耗费时间了。

可以批处理。 简单来说，就是**把过去的所有文章重新执行一次这个函数**。
 本项目采用最稳定、可靠、可以批处理几千个文章的靠谱方法：WP-CLI（性能最佳）

如果你有服务器终端（SSH/Shell）权限，可以使用 WP-CLI 命令行工具。
 创建一个命令脚本（例如 `set-thumbnails.php`）：

```php
<?php
// set-thumbnails.php
// 注意：此脚本只能通过 WP-CLI 执行
//本程序放在wp-content/themes/my-child-theme/set-thumbnails.php
// 命令：ssh haoye→ wp eval-file set-thumbnails.php
//
$posts = get_posts([
    'post_type'      => 'post',
    'post_status'    => 'publish',
    'posts_per_page' => -1,
    'meta_query'     => [
        [
            'key'     => '_thumbnail_id',
            'compare' => 'NOT EXISTS',
        ],
    ],
]);

$count = 0;
foreach ( $posts as $post ) {
    auto_set_featured_image_from_first_img( $post->ID );
    echo "Processed: {$post->ID}\n";
    $count++;
}

echo "✅ 共处理 {$count} 篇文章。\n";
```

ssh haoye连接到服务器后，在命令行执行：

```bash
wp eval-file set-thumbnails.php
```

![image-20251014213615602](https://haoyelaiga.com/wp-content/uploads/2025/10/image-20251014213615602.webp)

> **WP‑CLI 是为后台批量任务而生的，它在命令行环境下运行，不受 PHP 的网页超时与资源限制影响，且更安全、更稳定。**

| 功能             | 在浏览器难用       | 在 WP‑CLI 超好用 |
| ---------------- | ------------------ | ---------------- |
| 访问服务器资源   | ⚠️ 有安全限制       | ✅ 完全控制       |
| 批量执行耗时任务 | ❌ 超时风险         | ✅ 无限时长       |
| 实时输出日志     | ❌ 浏览器不适合输出 | ✅ 终端友好输出   |
| 调试报错         | ❌ 只能看 error_log | ✅ 即时报错显示   |
| 分批 / 自动化    | ❌ 要写 Ajax        | ✅ 天然脚本式执行 |

WP-CLI **完全可以在命令行中执行自定义函数**（比如你的 `auto_set_featured_image_from_first_img()`），
 只要该函数在 functions.php中已经定义了。甚至还可以把auto_set_featured_image_from_first_img()写成一个真正的自定义 WP‑CLI 命令。

## 通过 WP‑CLI 批量设置文章特色图片后，文章算不算更新？

-不算

| 问题                               | 答案                                               |
| ---------------------------------- | -------------------------------------------------- |
| CLI 设置特色图像会不会算更新文章？ | ❌ 不算内容更新，只是增加了元数据 `_thumbnail_id`。 |
| 会触发 `save_post` 吗？            | 不会。除非你在函数内手动调用 `wp_update_post()`。  |
| 会更新 `post_modified` 时间吗？    | 不会。                                             |
| 后台显示有无变化？                 | 有新特色图片，但修改时间不变。                     |
