---
id: 896
title: 使用wpAPI上传图片到WordPress媒体库和设为特色封面图片的项目demo
slug: 使用wpAPI上传图片到WordPress媒体库和设为特色封面图片的项目demo
categories:
  - notes
tags: []
---

本文记录了一个 Node.js 脚本的技术细节与实现思路，用于自动上传本地图片到 WordPress 媒体库，并设置为指定文章的特色图（featured image）。该脚本基于 使用WordPress的wpAPI库，适合批量或自动化内容管理场景。

![image-20251008115246404](https://haoyelaiga.com/wp-content/uploads/2025/10/image-20251008115246404.webp)

## 主要功能

- 读取本地图片文件
- 通过 WordPress REST API 上传图片到媒体库
- 获取图片的媒体 ID
- 将媒体 ID 设置为指定文章的特色图（featured_media 字段）

## 技术要点

### 1. 环境变量配置

脚本通过环境变量读取 WordPress 站点地址、用户名和应用密码，便于安全管理和多环境切换：

```js
const WP_SITE = process.env.WP_SITE || 'https://haoiga.com';
const WP_USER = process.env.WP_USER || 'haoye';
const WP_APP_PASS = process.env.WP_APP_PASS || 'Weees83P9PqdppdwddO5';
```

### 2. WordPress API 客户端初始化

使用 [wpapi](https://github.com/WP-API/node-wpapi) 包初始化 REST API 客户端，方便后续文章更新操作：

```js
const wp = new WPAPI({
  endpoint: `${WP_SITE}/wp-json`,
  username: WP_USER,
  password: WP_APP_PASS
});
```

### 3. 媒体文件上传

通过原生 fetch（或 node-fetch）向 `/wp-json/wp/v2/media` 发送 POST 请求，上传图片文件：

- 设置 `Authorization` 头为 Basic Auth（用户名:应用密码）
- `Content-Disposition` 指定文件名
- `Content-Type` 指定图片类型（如 image/jpeg、image/png、image/webp）
- 请求体为图片二进制数据

上传成功后，解析返回的 JSON，获取媒体 ID 和图片 URL。

### 4. 设置文章特色图

调用 wpapi 的 `posts().id(postId).update()` 方法，将 `featured_media` 字段设置为刚上传的媒体 ID，实现文章特色图自动绑定。

### 5. 错误处理与日志

脚本对上传和设置过程均有错误捕获，便于调试和批量处理时定位问题。

## 使用方法

1. 准备好 WordPress 应用密码，并在 .env 或环境变量中配置站点、用户名、密码。
2. 修改脚本中的图片路径和目标文章 ID：
   ```js
   uploadFeaturedImage('./house.webp', 796)
   ```
3. 运行脚本：
   ```bash
   node set_feature_image.js
   ```
4. 成功后会输出图片 URL 和文章 ID。

## 适用场景

- 批量内容迁移
- 自动化发布流程
- 本地 Markdown/静态博客同步到 WordPress 时自动设置特色图

:::tip 注意事项

- 需确保 WordPress 站点开启 REST API 并支持应用密码认证
- 图片类型需与实际文件一致（Content-Type）
- 文章 ID 必须有效，否则会报错
- 若有多种图片格式，可根据文件扩展名动态设置 Content-Type

:::

:::note

分为2步骤：1-使用API上传图片到媒体库；2-使用API把媒体库的某个图片设置为thumbnail

:::

## 总结

本脚本实现了本地图片自动上传并设置为 WordPress 文章特色图的功能，简洁高效，便于集成到更大的内容自动化发布流程中。后续可扩展为批量处理、自动识别图片类型、或结合 Markdown 解析自动提取封面等功能。



## 源代码

```js
import WPAPI from 'wpapi';
import fs from 'fs';
import path from 'path';

// 从环境变量读取配置
const WP_SITE = process.env.WP_SITE || 'https://haoyelaiga.com';
const WP_USER = process.env.WP_USER || 'xxx';
const WP_APP_PASS = process.env.WP_APP_PASS || 'WAxxxXxxxxx';

// 初始化 WordPress API 客户端
const wp = new WPAPI({
  endpoint: `${WP_SITE}/wp-json`,
  username: WP_USER,
  password: WP_APP_PASS
});

// 上传并设置特色图
async function uploadFeaturedImage(filePath, postId) {
  const fileName = path.basename(filePath);
  const fileData = fs.readFileSync(filePath);

  // 上传到媒体库
  const response = await fetch(`${WP_SITE}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString('base64'),
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': 'image/webp' // 可根据文件类型改成 image/png, image/webp 等
    },
    body: fileData
  });

  if (!response.ok) {
    throw new Error(`上传失败: ${response.status} ${response.statusText}`);
  }

  const media = await response.json();
  console.log('✅ 上传成功:', media.source_url);

  // 设置为文章特色图
  const updatedPost = await wp.posts().id(postId).update({
    featured_media: media.id
  });

  console.log(`🎉 已为文章 ${updatedPost.id} 设置特色图: ${media.source_url}`);
}

// 调用示例
uploadFeaturedImage('./house.webp', 796) // 796 替换为目标文章 ID
  .catch(err => console.error('❌ 出错:', err));
	
```



