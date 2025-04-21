/**
 * Weight Chart Script - WordPress Integration
 * Depends on: Chart.js
 */
(function($) {
    // Wait for DOM and Chart.js to fully load
    $(document).ready(function() {
        console.log('DOM loaded, preparing to initialize chart');
        
        // Make sure Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded!');
            return;
        }
        
        // Make sure data is loaded
        if (typeof window.weightChartData === 'undefined' || !Array.isArray(window.weightChartData)) {
            console.error('Weight data not correctly loaded!', typeof window.weightChartData);
            return;
        }
        
        // Get canvas element
        const ctx = document.getElementById('weightChart');
        if (!ctx) {
            console.error('Cannot find chart canvas element #weightChart');
            return;
        }
        
        console.log('Found canvas element:', ctx);
        
        // Prepare data - reverse to show in chronological order
        const chartData = [...window.weightChartData].reverse();
        const dates = chartData.map(item => item.date);
        const weights = chartData.map(item => item.weight);
        
        console.log('Processed data:', {dates, weights});
        
        // Check for valid data
        if (weights.length === 0 || dates.length === 0) {
            console.error('No valid chart data points');
            return;
        }
        
        // Determine Y axis range
        const minWeight = Math.min(...weights.filter(w => w > 0));
        const maxWeight = Math.max(...weights);
        const range = maxWeight - minWeight;
        const padding = Math.max(1, range * 0.2); // At least 1kg padding or 20% of range
        
        console.log('Creating chart...');
        
        // Create chart
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
        
        console.log('Chart creation complete');
    });
})(jQuery);