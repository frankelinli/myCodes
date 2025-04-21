<?php
// 读取文章数据
$articles = json_decode(file_get_contents('articles.json'), true);

// 分页设置
$articlesPerPage = 10;
$totalArticles = count($articles);
$totalPages = ceil($totalArticles / $articlesPerPage);
$currentPage = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$currentPage = max(1, min($totalPages, $currentPage));

// 当前页的文章
$startIndex = ($currentPage - 1) * $articlesPerPage;
$endIndex = min($startIndex + $articlesPerPage, $totalArticles);
$currentArticles = array_slice($articles, $startIndex, $articlesPerPage);
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">

    <!-- SEO元标签 -->
    <meta name="robots" content="index, follow">
    <meta name="keywords" content="博客,技术文章,个人分享,编程,生活感悟">
    <meta name="author" content="博客作者">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>博客首页</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>我的博客</h1>
        <nav>
            <a href="index.php">首页</a> |
            <a href="new-post.php">发表新文章</a>
        </nav>
    </header>
    <div id="articles">
        <?php foreach ($currentArticles as $article): ?>
            <div>
                <h2><a href="article.php?title=<?= urlencode($article['title']) ?>"><?= htmlspecialchars($article['title']) ?></a></h2>
                <p><?= htmlspecialchars(substr($article['content'], 0, 100)) ?>...</p>
                <small><?= htmlspecialchars($article['date']) ?></small>
                <hr>
            </div>
        <?php endforeach; ?>
    </div>
    <div id="pagination" class="pagination">
        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
            <a href="?page=<?= $i ?>" <?= $i === $currentPage ? 'style="font-weight: bold;"' : '' ?>><?= $i ?></a>
        <?php endfor; ?>
    </div>
    <footer>
        <p>&copy; 2025 我的博客. 保留所有权利.</p>
    </footer>
</body>
</html>