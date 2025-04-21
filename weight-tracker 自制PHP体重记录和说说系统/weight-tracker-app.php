<?php
/**
 * 体重追踪应用
 * WordPress 集成版本
 */

// 如果直接访问则退出
if (!defined('ABSPATH')) {
    exit;
}

// 开始输出缓冲，防止"headers already sent"错误
ob_start();

// 数据文件位置（使用WordPress上传目录以保持持久性）
$upload_dir = wp_upload_dir();
$dataFile = $upload_dir['basedir'] . '/weight-tracker/weight-data.json';

// 如果目录不存在则创建
if (!file_exists(dirname($dataFile))) {
    wp_mkdir_p(dirname($dataFile));
}

// 设置目标体重（公斤）
$targetWeight = 70; // 140斤等于70公斤

// 检查用户认证（使用WordPress认证）
$isAuthenticated = is_user_logged_in() && current_user_can('edit_posts');

// 初始化数据
$data = [];
if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    $data = json_decode($jsonData, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $error = "读取数据失败: " . json_last_error_msg();
        $data = [];
    }
}

// 处理表单提交
$data_updated = false; // 用于JavaScript重定向
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['weight_tracker_submit']) && $isAuthenticated) {
    $weight = isset($_POST['weight']) && is_numeric($_POST['weight']) && $_POST['weight'] > 0 ? floatval($_POST['weight']) : null;
    $note = isset($_POST['note']) && trim($_POST['note']) !== '' ? trim($_POST['note']) : null;
    $date = date('Y-m-d H:i:s');

    // 验证输入
    if ($weight === null && $note === null) {
        $error = "请至少输入体重或备注";
    } else {
        // 添加新数据
        $entry = ['date' => $date];
        if ($weight !== null) {
            $entry['weight'] = $weight;
        }
        if ($note !== null) {
            $entry['note'] = $note;
        }

        // 添加到数据数组
        $data[] = $entry;

        // 保存数据
        if (file_put_contents($dataFile, json_encode($data)) === false) {
            $error = "保存数据失败，请检查文件权限";
        } else {
            // 设置标志用于JavaScript重定向，而不是使用PHP重定向
            $data_updated = true;
        }
    }
}

// 处理数据以便显示
// 排除无效数据
$data = array_filter($data, function ($entry) {
    return isset($entry['date']);
});

// 按时间降序排序数据（最新的在前面）
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

// 将数据转换为JSON格式供JavaScript使用
$chartData = array_map(function($item) {
    return [
        'date' => isset($item['date']) ? date("Y-m-d", strtotime($item['date'])) : '',
        'weight' => isset($item['weight']) ? floatval($item['weight']) : 0
    ];
}, $data);

$chartDataJSON = json_encode($chartData);

// 如果数据已更新，使用JavaScript进行重定向
if ($data_updated) {
    echo '<script>
        window.location.href = "' . esc_js(add_query_arg('updated', '1', get_permalink())) . '";
    </script>';
    // 在JavaScript重定向后停止执行（虽然页面会继续加载）
    // 不使用exit，因为我们想让内容正常显示，以防JavaScript被禁用
}
?>

<header class="weight-tracker-header">
    <h1>体重记录助手</h1>
    <p class="site-description">记录每一步减重历程，科学管理健康体重</p>
</header>

<?php if (isset($error)): ?>
    <div class="error" style="color: red; background: #ffe8e8; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
        <?php echo esc_html($error); ?>
    </div>
<?php endif; ?>

<?php if (isset($_GET['updated']) && $_GET['updated'] == '1'): ?>
    <div class="updated" style="color: green; background: #e8ffe8; padding: 10px; margin-bottom: 15px; border-radius: 5px;">
        数据已成功更新！
    </div>
<?php endif; ?>

<!-- 体重输入表单 -->
<form method="POST" style="display: flex; flex-direction: column; gap: 12px;" autocomplete="off">
    <div style="display: flex; align-items: center;">
        <label for="weight" style="white-space: nowrap; margin-right: 8px;">输入体重 (kg):</label>
        <input type="number" step="0.1" id="weight" name="weight" min="30" max="200" style="flex: 1; padding: 8px;" <?php echo !$isAuthenticated ? 'disabled' : ''; ?>>
    </div>

    <div style="display: flex; align-items: center;">
        <label for="note" style="white-space: nowrap; margin-right: 8px;">说说:</label>
        <input type="text" id="note" name="note" maxlength="255" style="flex: 1; padding: 8px;" <?php echo !$isAuthenticated ? 'disabled' : ''; ?>>
        <input type="hidden" name="weight_tracker_submit" value="1">
        <button type="submit" style="margin-left: 8px; padding: 8px 15px; white-space: nowrap;" <?php echo !$isAuthenticated ? 'disabled' : ''; ?>>提交</button>
    </div>

    <?php if (!$isAuthenticated): ?>
        <div class="login-notice" style="margin-top: 10px; color: #856404; background-color: #fff3cd; padding: 10px; border-radius: 5px;">
            请<a href="<?php echo esc_url(wp_login_url(get_permalink())); ?>">登录</a>后记录体重数据。
        </div>
    <?php endif; ?>
</form>

<?php if ($stats['count'] > 0 && $stats['last'] !== null): ?>
    <div class="progress-container">
        <?php if ($stats['change'] !== null): ?>
            <div class="progress-item">
                已经减掉:
                <strong style="color: <?php echo $stats['change'] > 0 ? 'green' : ($stats['change'] < 0 ? 'red' : 'gray'); ?>; display: block; margin-top: 5px;">
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

<div class="weight-tracker-container">
    <div class="left-column">
        <h2>体重趋势表格</h2>
        <?php if (!empty($data)): ?>
            <table class="weight-tracker-table">
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
                        echo '<td>' . esc_html($formattedDate) . '</td>';

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
                            echo esc_html(number_format($entry['weight'], 1)) . ' kg';
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
                            echo esc_html(number_format($currentWeightJin, 1)) . ' 斤';
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

                        // 备注行
                        echo '<tr><td></td><td colspan="2" style="font-style: italic; color: #666;">';
                        echo isset($entry['note']) ? esc_html($entry['note']) : ' ';
                        echo '</td></tr>';
                    }
                    ?>
                </tbody>
            </table>
        <?php else: ?>
            <p>暂无记录。</p>
        <?php endif; ?>
    </div>

    <div class="right-column">
        <!-- BMI模块 -->
        <div class="module-container">
            <?php include(get_stylesheet_directory() . '/weight-tracker/bmi-module.php'); ?>
        </div>

        <!-- 体重图表模块 -->
        <div class="module-container">
            <div class="chart-container">
                <h3>体重变化趋势</h3>
                <canvas id="weightChart" width="800" height="300"></canvas>
            </div>
            <script>
                // 使数据可以被JavaScript访问
                window.weightChartData = <?php echo $chartDataJSON; ?>;
                console.log('体重数据已加载:', window.weightChartData.length, '条记录');
            </script>
        </div>

        <!-- FAQ部分 -->
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
</footer>

<?php
// 结束输出缓冲并发送内容
ob_end_flush();
?>