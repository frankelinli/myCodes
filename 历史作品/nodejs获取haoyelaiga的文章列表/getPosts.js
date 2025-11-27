
// Node.js 18+ 原生支持 fetch
async function getWordPressPosts() {
  try {
    // 替换为你的WordPress站点域名
    const url = 'https://haoyelaiga.com/wp-json/wp/v2/posts';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status}`);
    }
    const data = await response.json();
    console.log('文章列表:', data);
  } catch (error) {
    console.error('获取文章失败:', error.message);
  }
}

getWordPressPosts();
