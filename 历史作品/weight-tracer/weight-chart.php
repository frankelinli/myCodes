<?php
/**
 * 体重趋势折线图模块
 */

// 确保有体重数据
if (!isset($data) || empty($data)) {
    echo '<div class="no-data-message">暂无体重数据可供分析</div>';
    return;
}

// 转换数据为JSON格式，供JavaScript使用
$chartData = array_map(function($item) {
    return [
        'date' => isset($item['date']) ? date("Y-m-d", strtotime($item['date'])) : '',
        'weight' => isset($item['weight']) ? floatval($item['weight']) : 0
    ];
}, $data);

$chartDataJSON = json_encode($chartData);
?>

<!-- 体重折线图容器 -->
<div class="chart-container">
    <h3>体重变化趋势</h3>
    <canvas id="weightChart" width="800" height="300"></canvas>
</div>

<!-- 将数据传递给JavaScript -->
<script>
    // 确保全局可访问
    window.weightChartData = <?php echo $chartDataJSON; ?>;
    console.log('体重数据已加载:', window.weightChartData.length, '条记录');
</script>