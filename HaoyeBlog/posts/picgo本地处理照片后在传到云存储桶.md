---
id: 782
title: picgo本地处理照片后在传到云存储桶
slug: picgo本地处理照片后在传到云存储桶
categories:
  - notes
tags: []
---

Picgo加上小插件，实现把 PicGo 当成全自动图片处理器，在Markdown写作、传图片、非常省心。图片随手贴到typora的Markdown里面，无需关心上传，在本地电脑上会通过picgo的脚本，自动化进行处理，处理好了后会自动传到腾讯云存储，然后把照片的云存储地址返回到Markdown。这个流程就是瞬间完成的事情。



这样整个工作流程丝滑般体验。

![image-20250923215208155](https://images.haoyelaiga.com/image-20250923215208155.png)

1. **在 Markdown 本地编写文章**

   ```markdown
   ![](./images/demo.png)
   ```

   👉 引用的是原始大图，方便你随手截图或保存。

2. **增量构建脚本扫描 Markdown**

   - 找到 `![](路径)` 的图片
   - 如果检测到是本地文件，还没有上传过，则进入处理流程

3. **本地处理环节**（Node.js + sharp/picgo 插件 hook）

   - 压缩（避免原始几 MB 大图直接上云）
   - 转换格式（统一转 WebP/JPEG，进一步瘦身）
   - 加水印（可选，避免盗用）
   - 重命名（用 hash 或 slug，保证唯一性）

4. **PicGo 上传 → 腾讯云 COS (或其他存储，如 OSS/S3)**

   - 返回最终云端 URL（你已经配置了 `https://images.haoyelaiga.com`）

5. **替换 Markdown**

   - 脚本在本地自动把 `![](./images/demo.png)` 替换成：

     ```markdown
     ![](https://images.haoyelaiga.com/upload-20250923-xxxx.webp)
     ```

6. **Remark 转换 + WordPress 发布**

   - 最终发到 WordPress / 前端网站时，文章里的图片已经都是优化过的云存储链接。

整个过程丝滑。

这样图片的压缩、转换Webp，加水印等都在本地电脑处理好了。不需要云存储再二次加工了。腾讯云存储里的图片处理（压缩、水印）都是收费的，而且还很不好用。
