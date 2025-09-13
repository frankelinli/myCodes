---
id: 274
title: wordpress使用React列出站点全部帖子
date: '2025-05-11T18:14:12'
author: haoye
categories:
  - notes
tags: []
---

在主题下创建一个php页面模板文件，比如customlist.php。然后发布新页面时，使用这个模板。

```
<?php
/*
Template Name: React Categories List
*/

//这个是自定义页面模板，在发布页面时，可以选择此模板 
get_header(); // 引入页眉

// 获取所有分类
$categories = get_categories(array(
    'hide_empty' => false,
));

// 获取每个分类的文章
$categories_with_posts = array();
foreach ($categories as $category) {
    $posts = get_posts(array(
        'category' => $category->term_id,
        'numberposts' => -1,
    ));
    $categories_with_posts[] = array(
        'category' => $category,
        'posts' => $posts,
    );
}

// 将数据转换为 JSON 格式
$categories_with_posts_json = json_encode($categories_with_posts);
?>

<div id="app"></div>

<?php
get_footer(); // 引入页脚
?>

<!-- 引入 React 和 ReactDOM -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js"></script>

<!-- 引入 Babel 编译器 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js"></script>

<!-- 将 PHP 数据传递给 JavaScript -->
<script type="text/javascript">
  const categoriesWithPosts = <?php echo $categories_with_posts_json; ?>;
</script>

<!-- 引入我们的 React 组件 -->
<script type="text/babel">
  const { useState, useEffect } = React;

  const CategoryList = ({ categories }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredCategories = categories.filter(categoryData => 
      categoryData.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryData.posts.some(post => post.post_title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="categories">
        <input 
          type="text"
          placeholder="Search categories or posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {filteredCategories.map((categoryData, index) => (
          <Category key={index} categoryData={categoryData} />
        ))}
        {filteredCategories.length === 0 && <p>No categories or posts found.</p>}
      </div>
    );
  };

  const Category = ({ categoryData }) => {
    const { category, posts } = categoryData;
    const [isExpanded, setIsExpanded] = useState(true);

    return (
      <div className="category">
        <h2 onClick={() => setIsExpanded(!isExpanded)}>{category.name}</h2>
        {isExpanded && (
          posts.length > 0 ? (
            <ul>
              {posts.map(post => (
                <li key={post.ID}>
                  <a href={post.guid} dangerouslySetInnerHTML={{ __html: post.post_title }}></a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No posts available</p>
          )
        )}
      </div>
    );
  };

  const App = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setCategories(categoriesWithPosts);
      setLoading(false);
    }, []);

    if (loading) {
      return <p>Loading...</p>;
    }

    return (
      <div>
        <h1>All Categories and Posts</h1>
        <CategoryList categories={categories} />
      </div>
    );
  };

  ReactDOM.render(<App />, document.getElementById('app'));
</script>

<!-- 添加一些基本的样式 -->
<style>
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
  }

  #app {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
  }

  .search-input {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    font-size: 16px;
  }

  .categories {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .category {
    border: 1px solid #ddd;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .category h2 {
    font-size: 1.5em;
    margin-bottom: 10px;
    cursor: pointer;
  }

  .category ul {
    list-style: none;
    padding: 0;
  }

  .category li {
    margin-bottom: 10px;
  }

  .category a {
    text-decoration: none;
    color: #0073aa;
  }

  .category a:hover {
    text-decoration: underline;
  }
</style>
```
