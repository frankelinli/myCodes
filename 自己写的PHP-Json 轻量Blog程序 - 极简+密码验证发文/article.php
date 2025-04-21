<?php
// 读取文章数据
$articles = json_decode(file_get_contents('articles.json'), true);

// 获取 URL 参数中的标题
$articleTitle = isset($_GET['title']) ? $_GET['title'] : '';
$article = null;

// 查找对应的文章
foreach ($articles as $a) {
    if ($a['title'] === $articleTitle) {
        $article = $a;
        break;
    }
}
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($article ? $article['title'] : '文章未找到') ?></title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>文章详情</h1>
        <nav>
            <a href="index.php">首页</a> |
            <a href="new-post.php">发表新文章</a>
        </nav>
    </header>
    <div id="content">
        <?php if ($article): ?>
            <h1><?= htmlspecialchars($article['title']) ?></h1>
            <p><?= nl2br(htmlspecialchars($article['content'])) ?></p>
            <small><?= htmlspecialchars($article['date']) ?></small>
        <?php else: ?>
            <p>未找到对应的文章。</p>
        <?php endif; ?>
    </div>
    <footer>
        <p>&copy; 2025 我的博客. 保留所有权利.</p>
    </footer>
</body>
</html>