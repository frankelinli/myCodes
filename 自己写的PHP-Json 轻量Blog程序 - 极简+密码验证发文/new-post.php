<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>发表新文章</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>发表新文章</h1>
        <nav>
            <a href="index.php">首页</a> |
            <a href="new-post.php">发表新文章</a>
        </nav>
    </header>
    <form action="submit-post.php" method="post">
        <label for="title">标题：</label>
        <input type="text" id="title" name="title" required><br>
        <label for="content">内容：</label><br>
        <textarea id="content" name="content" rows="10" cols="30" required></textarea><br>
        <button type="submit">提交</button>
    </form>
    <footer>
        <p>&copy; 2025 我的博客. 保留所有权利.</p>
    </footer>
</body>
</html>