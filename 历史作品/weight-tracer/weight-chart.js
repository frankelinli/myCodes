/**
 * 体重趋势折线图脚本
 * 依赖: Chart.js 库
 */
(function() {
    // 等待DOM和Chart.js完全加载
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM已加载，准备初始化图表');
        
        // 确保Chart.js已加载
        if (typeof Chart === 'undefined') {
            console.error('Chart.js未加载!');
            return;
        }
        
        // 确保数据已加载
        if (typeof window.weightChartData === 'undefined' || !Array.isArray(window.weightChartData)) {
            console.error('体重数据未正确加载!', typeof window.weightChartData);
            return;
        }
        
        // 确认数据内容
        console.log('准备处理数据:', window.weightChartData);
        
        // 获取画布元素
        const ctx = document.getElementById('weightChart');
        if (!ctx) {
            console.error('找不到图表画布元素 #weightChart');
            return;
        }
        
        console.log('找到画布元素:', ctx);
        
        // 准备数据 - 反转数据以按时间顺序显示
        const chartData = [...window.weightChartData].reverse();
        const dates = chartData.map(item => item.date);
        const weights = chartData.map(item => item.weight);
        
        console.log('处理后的数据:', {dates, weights});
        
        // 检查是否有有效数据
        if (weights.length === 0 || dates.length === 0) {
            console.error('没有有效的图表数据点');
            return;
        }
        
        // 确定Y轴范围
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const range = maxWeight - minWeight;
        const padding = Math.max(1, range * 0.2); // 至少1kg的padding，或range的20%
        
        console.log('创建图表...');
        
        // 创建图表
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '体重 (kg)',
                    data: weights,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointBackgroundColor: '#007bff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: Math.max(0, minWeight - padding),
                        max: maxWeight + padding,
                        title: {
                            display: true,
                            text: '体重 (kg)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `体重: ${value} kg`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('图表创建完成');
    });
})();