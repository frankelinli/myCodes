<?php
// 检查是否通过 POST 方法提交
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 设置返回 JSON 响应的 Content-Type
    header('Content-Type: application/json');

    // 获取提交的标题和内容
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';

    // 验证标题和内容是否为空
    if (empty($title) || empty($content)) {
        echo json_encode(['status' => 'error', 'message' => '标题和内容不能为空！']);
        exit;
    }

    // 模拟保存数据为 JSON 文件
    $file = 'articles.json';
    $articles = [];

    // 如果文件存在，读取现有数据
    if (file_exists($file)) {
        $articles = json_decode(file_get_contents($file), true) ?? [];
    }

    // 添加新文章
    $articles[] = [
        'title' => $title,
        'content' => $content,
        'date' => date('Y-m-d H:i:s')
    ];

    // 保存回 JSON 文件
    file_put_contents($file, json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // 重定向到首页
    header('Location: index.php');
    exit;
} else {
    // 设置返回 JSON 响应的 Content-Type
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => '无效的请求方法！']);
}
?>