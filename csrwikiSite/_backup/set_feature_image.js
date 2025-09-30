import WPAPI from 'wpapi';
import fs from 'fs';
import path from 'path';

// 从环境变量读取配置
const WP_SITE = process.env.WP_SITE || 'https://csrwiki.com';
const WP_USER = process.env.WP_USER || 'weizhan';
const WP_APP_PASS = process.env.WP_APP_PASS || 'zwBscciRRVsJxecwiWVjfZfw';

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
      'Content-Type': 'image/jpeg' // 可根据文件类型改成 image/png, image/webp 等
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
uploadFeaturedImage('./woerma.webp', 7073) // 7073 替换为目标文章 ID
  .catch(err => console.error('❌ 出错:', err));
