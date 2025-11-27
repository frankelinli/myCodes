<?php
// Replace the session handling section at the top of index.php with this:

// 开始会话处理
session_start();

// 安全头部设置 - 添加在任何输出之前
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('X-Content-Type-Options: nosniff');

// 设置会话和cookie有效期（秒）
$sessionTimeout = 432000; // 5天
$cookieName = 'weight_tracker_auth';

// 设置简单密码
$password = "jfcg666888"; // 修改为你的密码

// 检查是否有持久化cookie
if (!isset($_SESSION['authenticated']) && isset($_COOKIE[$cookieName])) {
    $storedHash = $_COOKIE[$cookieName];
    // 验证cookie值（简单的安全哈希验证）
    $expectedHash = hash('sha256', $password . '_auth_salt');

    if ($storedHash === $expectedHash) {
        // 从cookie恢复认证状态
        $_SESSION['authenticated'] = true;
        $_SESSION['auth_time'] = time();
    }
}

// 检查会话是否过期
if (isset($_SESSION['auth_time']) && (time() - $_SESSION['auth_time'] > $sessionTimeout)) {
    // 会话过期，清除认证状态
    unset($_SESSION['authenticated']);
    unset($_SESSION['auth_time']);
    if (isset($_COOKIE[$cookieName])) {
        setcookie($cookieName, '', time() - 3600, '/'); // 删除cookie
    }
}

// 处理隐藏的身份验证请求
if (isset($_GET['auth']) && $_GET['auth'] === 'login') {
    $showLoginForm = true;
} else {
    $showLoginForm = false;
}

// 处理密码提交
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['auth_password'])) {
    if ($_POST['auth_password'] === $password) {
        $_SESSION['authenticated'] = true;
        $_SESSION['auth_time'] = time();

        // 设置持久化cookie，有效期5天
        $hash = hash('sha256', $password . '_auth_salt');
        setcookie($cookieName, $hash, time() + $sessionTimeout, '/', '', false, true);

        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    } else {
        $auth_error = "密码不正确";
        $showLoginForm = true; // 保持表单显示
    }
}

// 处理注销请求
if (isset($_GET['logout'])) {
    unset($_SESSION['authenticated']);
    unset($_SESSION['auth_time']);
    if (isset($_COOKIE[$cookieName])) {
        setcookie($cookieName, '', time() - 3600, '/'); // 删除cookie
    }
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// 检查用户是否已认证
$isAuthenticated = isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;

// 文件路径
$dataFile = __DIR__ . '/weight-data.json';

// 设置目标体重（单位：kg）
$targetWeight = 70; // 140斤等于70公斤


$jsonString = file_get_contents($dataFile);
$data = json_decode($jsonString, true) ?: [];

// 处理表单提交
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['note']) && $isAuthenticated) {
    $weight = isset($_POST['weight']) && is_numeric($_POST['weight']) && $_POST['weight'] > 0 ? floatval($_POST['weight']) : null;
    $note = isset($_POST['note']) && trim($_POST['note']) !== '' ? trim($_POST['note']) : null;
    $date = date('Y-m-d H:i:s');

    // 验证输入
    if ($weight === null && $note === null) {
        $error = "请至少输入体重或备注";
    } else {
        // 读取现有数据
        $data = file_exists($dataFile) ? json_decode(file_get_contents($dataFile), true) : [];

        // 数据验证
        if (json_last_error() !== JSON_ERROR_NONE) {
            $data = []; // 如果JSON解析出错，重置数据
        }

        // 对数据按时间降序排序（最新的在前面）
        usort($data, function ($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        // 添加新数据
        $entry = ['date' => $date];

        // 如果没有输入体重但有输入备注，尝试使用最近一次的体重记录
        if ($weight === null && $note !== null && !empty($data)) {
            // 查找最新的一条带有体重记录的数据
            $lastWeight = null;
            foreach ($data as $item) {
                if (isset($item['weight'])) {
                    $lastWeight = $item['weight'];
                    break;  // 找到第一个有体重记录的条目就停止（这是最新的）
                }
            }

            // 如果找到最近体重记录，则使用它
            if ($lastWeight !== null) {
                $entry['weight'] = $lastWeight;
                // 可选：添加标记表明这是继承的体重值
                $entry['weight_inherited'] = true;
            }
        } else if ($weight !== null) {
            $entry['weight'] = $weight;
        }

        if ($note !== null) {
            $entry['note'] = $note;
        }

        // 将新数据添加到 $data 数组中
        array_unshift($data, $entry);  // 添加到数组开头，保持降序排序

        // 错误处理
        if (file_put_contents($dataFile, json_encode($data)) === false) {
            $error = "保存数据失败，请检查文件权限";
        } else {
            // 使用 PRG 模式，重定向到当前页面
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        }
    }
}

// 读取数据
$data = [];
if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    $data = json_decode($jsonData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $error = "读取数据失败: " . json_last_error_msg();
        $data = [];
    }
}

// 排除无效数据
$data = array_filter($data, function ($entry) {
    return isset($entry['date']);
});

// 对数据按时间降序排序（最新的在前面）
usort($data, function ($a, $b) {
    return strtotime($b['date']) - strtotime($a['date']);
});

// 计算一些统计数据
$stats = [
    'count' => count($data),
    'min' => null,
    'max' => null,
    'avg' => null,
    'first' => null,
    'last' => null,
    'change' => null,
    'to_target' => null,
    'progress' => null
];

if (!empty($data)) {
    $weights = array_filter(array_column($data, 'weight'), function ($w) {
        return $w !== null;
    });
    if (!empty($weights)) {
        $stats['min'] = min($weights);
        $stats['max'] = max($weights);
        $stats['avg'] = array_sum($weights) / count($weights);

        // 按时间顺序的数据
        $chronoData = $data;
        usort($chronoData, function ($a, $b) {
            return strtotime($a['date']) - strtotime($b['date']);
        });

        // 找到第一个和最后一个有体重记录的数据
        $firstWeight = null;
        $lastWeight = null;

        foreach ($chronoData as $entry) {
            if (isset($entry['weight'])) {
                if ($firstWeight === null) {
                    $firstWeight = $entry['weight'];
                }
                $lastWeight = $entry['weight'];
            }
        }

        $stats['first'] = $firstWeight;
        $stats['last'] = $lastWeight;

        if ($firstWeight !== null && $lastWeight !== null) {
            $stats['change'] = $firstWeight - $lastWeight; // 正值表示减少了多少
        }

        // 计算距离目标的差距
        if ($lastWeight !== null) {
            $stats['to_target'] = $lastWeight - $targetWeight; // 正值表示还需减少多少

            // 如果已经有减重，计算减重进度
            if ($stats['change'] > 0) {
                $totalNeeded = $firstWeight - $targetWeight;
                if ($totalNeeded > 0) {
                    $stats['progress'] = ($stats['change'] / $totalNeeded) * 100; // 减重进度百分比
                } else {
                    $stats['progress'] = 100; // 已经达到或超过目标
                }
            }
        }
    }
}

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>体重记录跟踪 | 个人健康管理工具 - 轻松监控减重进度</title>
    <link rel="icon" href="weight-icon.jpg" type="image/jpeg">
    <link rel="stylesheet" href="style.css">

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <meta name="description" content="个人体重记录与跟踪工具，轻松监控减重进度，设定目标体重，查看体重趋势图表和数据统计。">
    <meta name="keywords" content="体重记录,减肥,减重,体重跟踪,健康管理,体重统计,目标体重">
    <meta name="author" content="您的名字">
    <meta name="robots" content="index, follow">
    <!-- 移动设备优化 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <!-- 社交媒体分享优化 -->
    <meta property="og:title" content="体重记录 - 个人健康管理工具">
    <meta property="og:description" content="轻松记录体重变化，追踪减重进度，实现健康目标。">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://您的网站地址.com">

</head>

<body>
    <header>
        <h1>体重记录助手</h1>
        <p class="site-description">记录每一步减重历程，科学管理健康体重</p>
    </header>

    <?php if ($showLoginForm): ?>
        <!-- 身份验证表单，仅当访问特定URL时显示 -->
        <div class="auth-form">
            <h2>访问控制</h2>
            <?php if (isset($auth_error)): ?>
                <div class="auth-error"><?php echo htmlspecialchars($auth_error); ?></div>
            <?php endif; ?>
            <form method="POST">
                <label for="auth_password">请输入密码：</label>
                <input type="password" id="auth_password" name="auth_password" required>
                <button type="submit">登录</button>
            </form>
        </div>
    <?php endif; ?>



    <?php if (isset($error)): ?>
        <div class="error" style="color: red; background: #ffe8e8; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
            <?php echo htmlspecialchars($error); ?>
        </div>
    <?php endif; ?>

    <!-- 始终显示表单，但对未认证用户禁用 -->
    <form method="POST" style="display: flex; flex-direction: column; gap: 12px;" autocomplete="off">
        <div style="display: flex; align-items: center;">
            <label for="weight" style="white-space: nowrap; margin-right: 8px;">输入体重 (kg):</label>
            <input type="number" step="0.1" id="weight" name="weight" min="30" max="200" style="flex: 1; padding: 8px; " <?php echo !$isAuthenticated ? 'disabled' : ''; ?>>
        </div>

        <div style="display: flex; align-items: center;">
            <label for="note" style="white-space: nowrap; margin-right: 8px;">说说:</label>
            <textarea id="note" name="note" maxlength="255" style="flex: 1; padding: 8px; height: 38px;" <?php echo !$isAuthenticated ? 'disabled' : ''; ?>></textarea>
            <button type="submit" style="margin-left: 8px; padding: 8px 15px; white-space: nowrap;" <?php echo !$isAuthenticated ? 'disabled' : ''; ?>>提交</button>
        </div>
    </form>

    <?php if ($stats['count'] > 0 && $stats['last'] !== null): ?>
        <div class="progress-container">
            <?php if ($stats['change'] !== null): ?>
                <div class="progress-item">
                    已经减掉:
                    <strong style="color: <?php echo $stats['change'] > 0 ? 'green' : ($stats['change'] < 0 ? 'red' : 'gray'); ?>; display: block; margin: top -5px;">
                        <?php echo $stats['change'] > 0 ? number_format($stats['change'] * 2, 1) : number_format($stats['change'] * -2, 1); ?> 斤
                    </strong>
                </div>
            <?php endif; ?>

            <div class="progress-bar">
                <?php if ($stats['first'] !== null && $stats['last'] !== null): ?>
                    <?php
                    // 计算相对位置
                    $range = max($stats['first'], $stats['last']) - min(min($stats['first'], $stats['last']), $targetWeight);
                    if ($range > 0) {
                        $startPos = 0;
                        $currentPos = ($stats['first'] - $stats['last']) / $range * 100;
                        $targetPos = ($stats['first'] - $targetWeight) / $range * 100;

                        // 确保位置在合理范围内
                        $currentPos = max(0, min(100, $currentPos));
                        $targetPos = max(0, min(100, $targetPos));
                    }
                    ?>
                    <div class="progress-fill <?php echo $stats['to_target'] <= 0 ? 'completed' : ''; ?>" style="width: <?php echo $stats['to_target'] <= 0 ? '100' : ($stats['progress'] ?? 0); ?>%;"></div>
                    <div class="progress-marker start" style="left: <?php echo $startPos ?? 0; ?>%;" title="起始：<?php echo number_format($stats['first'], 1); ?> kg"></div>
                    <div class="progress-marker current" style="left: <?php echo $currentPos ?? 0; ?>%;" title="当前：<?php echo number_format($stats['last'], 1); ?> kg"></div>
                    <div class="progress-marker target" style="left: <?php echo $targetPos ?? 100; ?>%;" title="目标：<?php echo number_format($targetWeight, 1); ?> kg"></div>
                <?php endif; ?>
            </div>

            <?php if ($stats['to_target'] !== null): ?>
                <div class="progress-item">
                    距离目标还差:
                    <strong style="color: <?php echo $stats['to_target'] <= 0 ? 'green' : 'orange'; ?>; display: block; margin-top: 5px;">
                        <?php
                        if ($stats['to_target'] > 0) {
                            echo number_format($stats['to_target'] * 2, 1) . " 斤";
                        } else {
                            echo "已达成！";
                        }
                        ?>
                    </strong>
                </div>
            <?php endif; ?>



            <div class="progress-item">
                目标体重: <strong style="display: block; margin-top: 5px"><?php echo number_format($targetWeight * 2, 0); ?> 斤</strong>
            </div>
        </div>
    <?php endif; ?>

    <div class="container">
        <div class="left-column">

            <!-- 引入BMI模块 -->
            <div class="module-container">
                <?php include 'bmi-module.php'; ?>

                <!-- 引入BMI样式和脚本 -->
                <link rel="stylesheet" href="bmi-module.css">
                <script src="bmi-module.js"></script>
            </div>


        </div>

        <div class="right-column">


            <h2>体重趋势表格</h2>
            <?php if (!empty($data)): ?>
                <table>
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>体重 (kg)</th>
                            <th>体重 (斤)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        // 创建一个按时间升序的数组，用于查找上一条记录
                        $chronologicalData = $data;
                        usort($chronologicalData, function ($a, $b) {
                            return strtotime($a['date']) - strtotime($b['date']);
                        });

                        // 创建日期索引，便于查找
                        $dateIndex = [];
                        foreach ($chronologicalData as $index => $entry) {
                            $dateIndex[$entry['date']] = $index;
                        }

                        foreach ($data as $entry) {
                            // 体重行
                            echo '<tr>';
                            // 格式化日期显示
                            $formattedDate = date('Y-m-d H:i', strtotime($entry['date']));
                            echo '<td>' . htmlspecialchars($formattedDate) . '</td>';

                            // 查找时间上的前一条有体重记录的记录
                            $previousEntry = null;
                            $currentIndex = $dateIndex[$entry['date']];
                            for ($i = $currentIndex - 1; $i >= 0; $i--) {
                                if (isset($chronologicalData[$i]['weight'])) {
                                    $previousEntry = $chronologicalData[$i];
                                    break;
                                }
                            }

                            // 公斤对比逻辑
                            echo '<td>';
                            if (isset($entry['weight'])) {
                                echo htmlspecialchars(number_format($entry['weight'], 1)) . ' kg';
                                if ($previousEntry && isset($previousEntry['weight'])) {
                                    $diff = $entry['weight'] - $previousEntry['weight'];
                                    $diffText = number_format(abs($diff), 1);
                                    if ($diff > 0) {
                                        echo ' <span style="display: block; color: red; font-weight: bold;">+' . $diffText . ' kg ↑</span>';
                                    } elseif ($diff < 0) {
                                        echo ' <span style="display: block; color: green; font-weight: bold;">-' . $diffText . ' kg ↓</span>';
                                    }
                                }
                            } else {
                                echo ' ';
                            }
                            echo '</td>';

                            // 斤对比逻辑
                            echo '<td>';
                            if (isset($entry['weight'])) {
                                $currentWeightJin = $entry['weight'] * 2;
                                echo htmlspecialchars(number_format($currentWeightJin, 1)) . ' 斤';
                                if ($previousEntry && isset($previousEntry['weight'])) {
                                    $previousWeightJin = $previousEntry['weight'] * 2;
                                    $diff = $currentWeightJin - $previousWeightJin;
                                    $diffText = number_format(abs($diff), 1);
                                    if ($diff > 0) {
                                        echo ' <span style="display: block; color: red; font-weight: bold;">+' . $diffText . ' 斤 ↑</span>';
                                    } elseif ($diff < 0) {
                                        echo ' <span style="display: block; color: green; font-weight: bold;">-' . $diffText . ' 斤 ↓</span>';
                                    }
                                }
                            } else {
                                echo ' ';
                            }
                            echo '</td>';
                            echo '</tr>';

                            // 备注行 - 无论是否有备注都显示
                            echo '<tr><td></td><td colspan="2" style="font-style: italic; color: #666;">';
                            echo isset($entry['note']) ? htmlspecialchars($entry['note']) : ' ';
                            echo '</td></tr>';
                        }
                        ?>
                    </tbody>
                </table>
            <?php else: ?>
                <p>暂无记录。</p>
            <?php endif; ?>





            <!-- 引入体重趋势图模块 -->
            <div class="module-container">
                <?php include 'weight-chart.php'; ?>
                <!-- 先确保数据已传递，然后再加载图表脚本 -->
                <!-- 引入体重折线图样式 -->
                <link rel="stylesheet" href="weight-chart.css">
                <script src="weight-chart.js"></script>

            </div>


            <div class="module-container">
                <h3>FAQ</h3>
                <details>
                    <summary>多久记录一次体重最合适？</summary>
                    <p>健康专家建议每周记录1-2次体重，最好选择固定的时间（如早晨起床后、上厕所后、进食前）进行测量，以获得最一致的数据。</p>
                </details>
                <details>
                    <summary>如何设定合理的目标体重？</summary>
                    <p>合理的目标体重应基于BMI指数、体型、年龄和整体健康状况来设定。快速减重通常不健康且难以维持，建议每周减重不超过0.5-1公斤。</p>
                </details>
                <details>
                    <summary>为什么体重会出现波动？</summary>
                    <p>日常体重波动很正常，受水分摄入、饮食、排泄、运动等多种因素影响。长期趋势比单日数据更重要，这也是为什么记录体重很有价值。</p>
                </details>
            </div>




        </div>
    </div>




    <div>
        <?php
        if (!empty($data)) {
            $latestWeight = null;
            foreach ($data as $entry) {
                if (isset($entry['weight'])) {
                    $latestWeight = $entry['weight'];
                    break;
                }
            }

            if ($latestWeight !== null) {
                if ($latestWeight > $targetWeight) {
                    echo "<p style='text-align: center; margin-top: 20px; font-size: 1.2em; font-weight: bold; color: #d9534f;'>体重还在" . $targetWeight . "kg以上？别吃了，快去跑步！</p>";
                } else {
                    echo "<p style='text-align: center; margin-top: 20px; font-size: 1.2em; font-weight: bold; color: #5cb85c;'>太棒了！已经达到目标体重！继续保持！</p>";
                }
            }
        }
        ?>
    </div>





    <footer style="margin-top: 30px; text-align: center; color: #777; font-size: 0.9em;">
        <p>体重记录应用 &copy; <?php echo date('Y'); ?> | 记录总数: <?php echo count($data); ?></p>
        <p>专注于帮助用户追踪体重变化、实现健康目标的个人工具</p>

        <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "体重记录工具",
                "description": "个人体重记录与跟踪工具，轻松监控减重进度，设定目标体重，查看体重趋势图表和数据统计。",
                "applicationCategory": "HealthApplication",
                "operatingSystem": "Web",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "CNY"
                },
                "featureList": [
                    "体重记录",
                    "减重进度跟踪",
                    "目标体重设定",
                    "数据可视化",
                    "趋势分析"
                ]
            }
        </script>

    </footer>

    <!-- 隐藏的授权信息 -->
    <?php if ($isAuthenticated): ?>
        <div style="display: none;">已授权用户</div>
    <?php endif; ?>

    <script>
        // 防止表单重复提交
        <?php if ($isAuthenticated): ?>
            document.querySelector('form').addEventListener('submit', function(e) {
                const weightInput = document.getElementById('weight');
                const noteInput = document.getElementById('note');

                if (!weightInput.value && !noteInput.value) {
                    e.preventDefault();
                    alert('请至少输入体重或备注！');
                    return false;
                }

                if (weightInput.value && (parseFloat(weightInput.value) < 30 || parseFloat(weightInput.value) > 200)) {
                    e.preventDefault();
                    alert('请输入30到200之间的有效体重！');
                    return false;
                }

                // 禁用提交按钮，防止重复提交
                this.querySelector('button').disabled = true;
            });
        <?php endif; ?>
    </script>
</body>

</html>