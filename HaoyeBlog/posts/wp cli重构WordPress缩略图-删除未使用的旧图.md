---
id: 802
title: WP‑CLI命令行来重构WordPress的缩略图
slug: WP‑CLI命令行来重构WordPress的缩略图
categories:
  - notes
tags: []
---

WP‑CLI命令行来重构WordPress的缩略图，并删除不使用的旧图。

![image-20250927223342943](https://images.haoyelaiga.com/image-20250927223342943.webp)

## 🔹 推荐的完整流程

1. **先确认目前有哪些尺寸**（避免误删）：

   

   ```bash
   wp image-size list
   ```

   输出里会显示尺寸名称、宽高、裁剪方式，比如：

   

   ```apache
   name                      width  height  crop
   thumbnail                 150    150     1
   medium                    300    300     0
   large                     1024   1024    0
   woocommerce_thumbnail     300    300     1
   woocommerce_single        600    600     0
   ...
   ```

2. **移除不需要的尺寸**（比如 WooCommerce 的），在 `functions.php` 里写上：

   

   ```php
   remove_image_size('woocommerce_thumbnail');
   remove_image_size('woocommerce_single');
   remove_image_size('woocommerce_gallery_thumbnail');
   ```

3. **执行重建**：

   

   ```bash
   wp media regenerate --yes
   ```

   - WP‑CLI 会发现 WooCommerce 的尺寸已经不再定义，于是重建时就不会再生成它们；
   - 旧的 WooCommerce 缩略图也会被删除。

4. （可选）清理缓存/CDN：

   - 如果你有用缓存插件 / CDN，要清理一下，否则前端可能还会引用旧图。

------

## 🔹 总结

- **关键点就在不加 `--skip-delete`**
- WP‑CLI 会非常智能：它只保留当前注册的尺寸，其余就删掉。



这是个非常好的做法 —— 先用一个图片 ID 来试，确认效果没问题再批量处理。

------

## 先用1个来测试：针对单个 ID 重建缩略

比如你要处理 ID 为 `123` 的图片：

```bash
wp media regenerate 123
```

执行后：

- WordPress 会删除这张图的旧缩略图（不再定义的也会清除）。
- 然后按你当前保留的尺寸重新生成缩略图。
- 原始文件（比如 `photo.jpg`）不会被删除，只是附带的尺寸文件更新。

## 🔹 怎么查文章的封面图 ID？

封面图在 WP 数据库里存储在文章的 meta 字段 `_thumbnail_id`。

你可以用 WP‑CLI 很快查出来：

bash



```bash
wp post meta get 6483 _thumbnail_id
```

如果有结果（例如显示数字 `7120`），那就是这篇文章的封面图 ID。

------

## 🔹 再重建缩略图

拿到这个 ID 后，可以直接跑：

```bash
wp media regenerate 7120 --yes
```

（假设 `_thumbnail_id` 返回的是 `7120`）。

这样只会对这张封面图重建缩略图，并删除不再需要的旧尺寸。

------

## 🔹 如果没查到

- 如果命令输出为空 → 说明这篇文章「没有设置特色图」。
- 有可能文章里插入了图片，但不是作为封面图，而是文章内容里的 `<img>`。那种情况你需要在编辑器里点开图片，找到媒体库里的 ID 或文件名再处理。



你这里的 **6483 是文章 ID**（`post_type = post`），而你想要的其实是这篇文章的 **特色图 / 封面图（Featured Image）的附件 ID**。

------

## 🔹 怎么查文章的封面图 ID？

封面图在 WP 数据库里存储在文章的 meta 字段 `_thumbnail_id`。

你可以用 WP‑CLI 很快查出来：

bash



```bash
wp post meta get 6483 _thumbnail_id
```

如果有结果（例如显示数字 `7120`），那就是这篇文章的封面图 ID。

------

## 🔹 再重建缩略图

拿到这个 ID 后，可以直接跑：

```bash
wp media regenerate 7120 --yes
```

（假设 `_thumbnail_id` 返回的是 `7120`）。

这样只会对这张封面图重建缩略图，并删除不再需要的旧尺寸。

## 🔹 下一步建议

1. **检查 uploads 目录**

   - 确认旧的 WooCommerce 缩略图（比如 `-woocommerce_thumbnail-xxx.jpg`）是否已经消失。
   - 新生成的缩略图是否符合你保留的尺寸（比如 `-150x150.jpg`, `-medium.jpg` 等）。

2. **刷新缓存**

   - 如果用了缓存插件/CDN，记得清理缓存，否则前端可能还在引用旧图。

3. **批量执行**

   - 如果测试没问题，可以跑全站：

     bash

     

     ```bash
     wp media regenerate --yes
     ```

   - 这样会遍历所有上传过的图片。
