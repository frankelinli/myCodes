<?php
session_start();
$error = '';
$return = isset($_GET['return']) ? $_GET['return'] : 'new-post.php';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    // 从 config.php 读取账号和加密密码
    $config = require __DIR__ . '/config.php';
    $correct_username = $config['username'];
    $correct_password_hash = $config['password_hash'];

    if ($username === $correct_username && password_verify($password, $correct_password_hash)) {
        $_SESSION['is_logged_in'] = true;
        // 登录成功后跳转到return参数指定页面
        header('Location: ' . $return);
        exit;
    } else {
        $error = '账号或密码错误';
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>登录</title>
</head>
<body>
    <h2>登录</h2>
    <?php if ($error) echo "<p style='color:red;'>$error</p>"; ?>
    <form method="post">
        <input type="hidden" name="return" value="<?= htmlspecialchars($return) ?>">
        <label>账号：<input type="text" name="username" required></label><br>
        <label>密码：<input type="password" name="password" required></label><br>
        <button type="submit">登录</button>
    </form>
</body>
</html>
