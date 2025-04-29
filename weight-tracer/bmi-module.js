/**
 * BMI模块 JavaScript - 简化版
 * 主要处理BMI历史图表功能
 */
(function() {
    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
      const HEIGHT_IN_METERS = 1.70; // 170cm = 1.70m
      
      // DOM元素
      const toggleHistoryButton = document.getElementById('toggle-bmi-history');
      const bmiHistoryChart = document.getElementById('bmi-history-chart');
      
      // 只有当这两个元素存在时才初始化图表功能
      if (!toggleHistoryButton || !bmiHistoryChart) return;
      
      // 添加BMI历史图表功能
      toggleHistoryButton.addEventListener('click', function() {
        if (bmiHistoryChart.style.display === 'none') {
          bmiHistoryChart.style.display = 'block';
          toggleHistoryButton.textContent = '隐藏BMI历史变化';
          loadBMIHistory();
        } else {
          bmiHistoryChart.style.display = 'none';
          toggleHistoryButton.textContent = '查看BMI历史变化';
        }
      });
      
      // 加载BMI历史数据并创建图表
      function loadBMIHistory() {
        // 从表格获取所有体重记录
        const weightRows = document.querySelectorAll('table tr:not(:first-child)');
        const bmiData = [];
        const dates = [];
        
        // 处理每一行，计算BMI
        for (let i = 0; i < weightRows.length; i++) {
          const row = weightRows[i];
          // 跳过备注行
          if (row.cells.length < 3) continue;
          
          const dateCell = row.querySelector('td:nth-child(1)');
          const weightCell = row.querySelector('td:nth-child(2)');
          
          if (dateCell && weightCell) {
            const date = dateCell.textContent.trim();
            // 提取纯数字部分，忽略变化指示器
            const weightText = weightCell.textContent.trim().split(' ')[0]; 
            const weight = parseFloat(weightText);
            
            if (!isNaN(weight)) {
              const bmi = weight / (HEIGHT_IN_METERS * HEIGHT_IN_METERS);
              const roundedBMI = Math.round(bmi * 10) / 10;
              
              bmiData.push(roundedBMI);
              dates.push(date);
            }
          }
        }
        
        // 如果没有Chart.js，显示提示
        if (typeof Chart === 'undefined') {
          bmiHistoryChart.innerHTML = '<p>需要引入Chart.js库来显示BMI历史图表</p>';
          return;
        }
        
        // 反转数组以保持时间的正确顺序
        createBMIChart(dates.reverse(), bmiData.reverse());
      }
      
      // 创建BMI历史图表
      function createBMIChart(dates, bmiData) {
        if (bmiData.length === 0) {
          bmiHistoryChart.innerHTML = '<p>没有足够的数据来创建BMI历史图表</p>';
          return;
        }
        
        const ctx = document.createElement('canvas');
        ctx.id = 'bmiChart';
        ctx.width = 400;
        ctx.height = 200;
        bmiHistoryChart.innerHTML = '';
        bmiHistoryChart.appendChild(ctx);
        
        // 使用Chart.js创建图表
        new Chart(ctx, {
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
        
        // 添加BMI区间标记说明
        const legendDiv = document.createElement('div');
        legendDiv.className = 'bmi-chart-legend';
        legendDiv.innerHTML = `
          <div class="legend-item"><span class="color-box" style="background: #5bc0de;"></span>偏瘦 (BMI < 18.5)</div>
          <div class="legend-item"><span class="color-box" style="background: #5cb85c;"></span>正常 (BMI 18.5-24)</div>
          <div class="legend-item"><span class="color-box" style="background: #f0ad4e;"></span>超重 (BMI 24-28)</div>
          <div class="legend-item"><span class="color-box" style="background: #d9534f;"></span>肥胖 (BMI > 28)</div>
        `;
        bmiHistoryChart.appendChild(legendDiv);
      }
    });
  })();