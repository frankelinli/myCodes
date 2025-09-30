---
id: 222
title: docusaurus页面调用WordPress文章
slug: docusaurus%e9%a1%b5%e9%9d%a2%e8%b0%83%e7%94%a8wordpress%e6%96%87%e7%ab%a0
date: '2025-05-06T21:57:04'
categories:
  - notes
tags: []
url: https://haoyelaiga.com/docusaurus%e9%a1%b5%e9%9d%a2%e8%b0%83%e7%94%a8wordpress%e6%96%87%e7%ab%a0/
---

我的React项目docusaurus网站，可以调用WordPress里的文章吗？

是的，你可以在 Docusaurus 网站中调用 WordPress 里的文章。有几种方法可以实现这个目标，其中一种常见的方法是使用 WordPress 的 REST API 来获取文章数据。这里是一个基本的步骤指南：

### 1. 确保 WordPress REST API 启用

WordPress 默认启用 REST API，你可以通过访问以下 URL 来检查：

```
https://your-wordpress-site.com/wp-json/wp/v2/posts
```

这将返回一个 JSON 格式的帖子列表。

### 2. 设置 Docusaurus 项目

假设你已经有一个 Docusaurus 项目。如果没有，可以通过以下命令创建一个：

```
npx create-docusaurus@latest my-website classic
cd my-website
```

### 3. 安装 Axios

在 Docusaurus 项目中，你可以使用 Axios 来请求 WordPress API。首先安装 Axios：

```
npm install axios
```

### 4. 创建一个 React 组件来获取和显示文章

在 `src/components` 目录下创建一个新的组件，例如 `WordPressPosts.js`：

```
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WordPressPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://your-wordpress-site.com/wp-json/wp/v2/posts')
      .then(response => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>WordPress Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <a href={post.link} target="_blank" rel="noopener noreferrer">
              {post.title.rendered}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WordPressPosts;
```

### 5. 使用组件

在 Docusaurus 项目中，编辑 `src/pages/index.js` 或任何你想显示 WordPress 文章的页面，并导入并使用 `WordPressPosts` 组件：

```
import React from 'react';
import Layout from '@theme/Layout';
import WordPressPosts from '../components/WordPressPosts';

function Home() {
  return (
    <Layout title="Home" description="Description will go into a meta tag in <head />">
      <div style={{ padding: '2rem' }}>
        <WordPressPosts />
      </div>
    </Layout>
  );
}

export default Home;
```

### 6. 启动 Docusaurus 开发服务器

```
npm start
```

现在，访问 Docusaurus 网站，你应该能看到从 WordPress 获取的文章列表。

### 进一步优化

- **错误处理**：可以添加更健壮的错误处理逻辑。
- **分页**：处理 WordPress API 的分页，以获取更多文章。
- **样式**：根据需要添加 CSS 样式，使文章列表更美观。

通过上述步骤，你可以在 Docusaurus 网站中显示来自 WordPress 的文章。你可以根据需要进一步定制和扩展这个功能。
