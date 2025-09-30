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

// ========================
// wpapi 常用操作案例演示
// ========================

// 1. 获取最新10篇文章
async function getPostsDemo() {
  const posts = await wp.posts().perPage(10).get();
  console.log('最新10篇文章：');
  posts.forEach(post => {
    console.log(`- [${post.id}] ${post.title.rendered}`);
  });
}

// 2. 发布一篇新文章
async function createPostDemo() {
  const newPost = await wp.posts().create({
    title: 'API 发布的文章',
    content: '这是一篇通过 wpapi 发布的文章。',
    status: 'publish'
  });
  console.log('已发布新文章：', newPost.id, newPost.link);
}

// 3. 更新文章内容
async function updatePostDemo(postId) {
  const updated = await wp.posts().id(postId).update({
    title: '【已更新】API 发布的文章'
  });
  console.log('已更新文章标题：', updated.id, updated.title.rendered);
}

// 4. 删除一篇文章
async function deletePostDemo(postId) {
  const deleted = await wp.posts().id(postId).delete();
  console.log('已删除文章：', deleted.id);
}

// 5. 获取媒体库图片
async function getMediaDemo() {
  const mediaList = await wp.media().perPage(5).get();
  console.log('媒体库前5项：');
  mediaList.forEach(media => {
    console.log(`- [${media.id}] ${media.source_url}`);
  });
}

// 6. 获取所有分类
async function getCategoriesDemo() {
  const categories = await wp.categories().get();
  console.log('所有分类：');
  categories.forEach(cat => {
    console.log(`- [${cat.id}] ${cat.name}`);
  });
}

// ==========
// 用法示例
// ========== 
// 取消注释下方任意一行，运行 node wpAPI-demo.js 即可体验
// getPostsDemo();
// createPostDemo();
// updatePostDemo(123); // 123 替换为实际文章ID
// deletePostDemo(123); // 123 替换为实际文章ID
// getMediaDemo();
// getCategoriesDemo();

/*
说明：
1. 每个函数都是独立的 wpapi 操作案例。
2. 运行前请确保 WP_USER、WP_APP_PASS 有对应权限。
3. 如需体验更多接口，参考 https://github.com/WP-API/node-wpapi 文档。
*/