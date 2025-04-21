/**
 * BMI Module Script - WordPress Integration
 * Depends on: jQuery, Chart.js
 */
(function($) {
    // Wait for DOM to load
    $(document).ready(function() {
        const HEIGHT_IN_METERS = 1.70; // 170cm = 1.70m
        
        // DOM elements
        const toggleHistoryButton = $('#toggle-bmi-history');
        const bmiHistoryChart = $('#bmi-history-chart');
        
        // Initialize chart functionality only when these elements exist
        if (toggleHistoryButton.length && bmiHistoryChart.length) {
            // Add BMI history chart functionality
            toggleHistoryButton.click(function() {
                if (bmiHistoryChart.css('display') === 'none') {
                    bmiHistoryChart.show();
                    toggleHistoryButton.text('隐藏BMI历史变化');
                    loadBMIHistory();
                } else {
                    bmiHistoryChart.hide();
                    toggleHistoryButton.text('查看BMI历史变化');
                }
            });
            
            // Load BMI history data and create chart
            function loadBMIHistory() {
                // Get all weight records from table
                const weightRows = $('table tr:not(:first-child)');
                const bmiData = [];
                const dates = [];
                
                // Process each row, calculate BMI
                weightRows.each(function(i, row) {
                    // Skip notes rows
                    if ($(row).find('td').length < 3) return;
                    
                    const dateCell = $(row).find('td:nth-child(1)');
                    const weightCell = $(row).find('td:nth-child(2)');
                    
                    if (dateCell.length && weightCell.length) {
                        const date = dateCell.text().trim();
                        // Extract just the numeric part, ignore change indicators
                        const weightText = weightCell.text().trim().split(' ')[0]; 
                        const weight = parseFloat(weightText);
                        
                        if (!isNaN(weight)) {
                            const bmi = weight / (HEIGHT_IN_METERS * HEIGHT_IN_METERS);
                            const roundedBMI = Math.round(bmi * 10) / 10;
                            
                            bmiData.push(roundedBMI);
                            dates.push(date);
                        }
                    }
                });
                
                // If Chart.js not loaded, show a notice
                if (typeof Chart === 'undefined') {
                    bmiHistoryChart.html('<p>需要引入Chart.js库来显示BMI历史图表</p>');
                    return;
                }
                
                // Reverse arrays to maintain correct time order
                createBMIChart(dates.reverse(), bmiData.reverse());
            }
            
            // Create BMI history chart
            function createBMIChart(dates, bmiData) {
                if (bmiData.length === 0) {
                    bmiHistoryChart.html('<p>没有足够的数据来创建BMI历史图表</p>');
                    return;
                }
                
                const canvas = $('<canvas id="bmiChart" width="400" height="200"></canvas>');
                bmiHistoryChart.empty().append(canvas);
                
                // Use Chart.js to create chart
                new Chart(canvas[0], {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: 'BMI指数',
                            data: bmiData,
                            borderColor: '#5bc0de',
                            backgroundColor: 'rgba(91, 192, 222, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: Math.max(Math.min(...bmiData) - 2, 16),
                                max: Math.min(Math.max(...bmiData) + 2, 35),
                                grid: {
                                    color: 'rgba(0, 0, 0, 0.05)'
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const bmi = context.raw;
                                        let status = '';
                                        
                                        if (bmi < 18.5) status = '偏瘦';
                                        else if (bmi < 24) status = '正常';
                                        else if (bmi < 28) status = '超重';
                                        else status = '肥胖';
                                        
                                        return `BMI: ${bmi} (${status})`;
                                    }
                                }
                            }
                        }
                    }
                });
                
                // Add BMI range markers explanation
                const legendDiv = $('<div class="bmi-chart-legend"></div>');
                legendDiv.html(`
                    <div class="legend-item"><span class="color-box" style="background: #5bc0de;"></span>偏瘦 (BMI < 18.5)</div>
                    <div class="legend-item"><span class="color-box" style="background: #5cb85c;"></span>正常 (BMI 18.5-24)</div>
                    <div class="legend-item"><span class="color-box" style="background: #f0ad4e;"></span>超重 (BMI 24-28)</div>
                    <div class="legend-item"><span class="color-box" style="background: #d9534f;"></span>肥胖 (BMI > 28)</div>
                `);
                bmiHistoryChart.append(legendDiv);
            }
        }
    });
})(jQuery);