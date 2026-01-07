<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Energy Data Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .summary-panel {
            background: white;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 16px;
        }
        .summary-card {
            padding: 16px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #007bff;
        }
        .summary-card h3 {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .summary-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .summary-card .unit {
            font-size: 14px;
            color: #666;
            margin-left: 4px;
        }
        .chart-container {
            background: white;
            border-radius: 8px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .chart-title {
            font-size: 20px;
            font-weight: 600;
            color: #333;
        }
        .chart-subtitle {
            font-size: 14px;
            color: #666;
            margin-top: 4px;
        }
        .date-selector {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .peak-hour-info {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 12px;
            margin-top: 16px;
        }
        .peak-hour-info strong {
            color: #856404;
        }
        .chart-wrapper {
            position: relative;
            height: 400px;
            margin-top: 20px;
        }
        .minute-chart-wrapper {
            position: relative;
            height: 300px;
            margin-top: 20px;
        }
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .back-button {
            background: #6c757d;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 16px;
        }
        .back-button:hover {
            background: #5a6268;
        }
        .hour-bar {
            cursor: pointer;
            transition: opacity 0.2s;
        }
        .hour-bar:hover {
            opacity: 0.7;
        }
        .hour-bar.highlighted {
            opacity: 1;
            filter: brightness(1.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 style="margin-bottom: 24px; color: #333;">Energy Consumption Dashboard</h1>
        
        <!-- Summary Panel -->
        <div class="summary-panel">
            <h2 style="margin-bottom: 16px; color: #333;">Overall Summary</h2>
            <div class="summary-grid" id="summaryGrid">
                <div class="loading">Loading summary data...</div>
            </div>
        </div>

        <!-- Date Selector -->
        <div class="chart-container">
            <div class="chart-header">
                <div>
                    <div class="chart-title">Select Date</div>
                    <div class="chart-subtitle">Choose a date to view hourly consumption</div>
                </div>
                <select id="dateSelector" class="date-selector">
                    <option value="">Loading dates...</option>
                </select>
            </div>
        </div>

        <!-- Hourly Chart Container -->
        <div id="hourlyChartContainer" class="chart-container" style="display: none;">
            <div class="chart-header">
                <div>
                    <div class="chart-title">Hourly Consumption</div>
                    <div class="chart-subtitle" id="hourlyChartSubtitle">Click on any hour to see minute-by-minute details</div>
                </div>
            </div>
            <div class="chart-wrapper">
                <canvas id="hourlyChart"></canvas>
            </div>
            <div id="peakHourInfo" class="peak-hour-info" style="display: none;"></div>
        </div>

        <!-- Minute Chart Container (drill-down) -->
        <div id="minuteChartContainer" class="chart-container" style="display: none;">
            <button class="back-button" onclick="hideMinuteChart()">← Back to Hourly View</button>
            <div class="chart-header">
                <div>
                    <div class="chart-title">Minute-by-Minute Consumption</div>
                    <div class="chart-subtitle" id="minuteChartSubtitle"></div>
                </div>
            </div>
            <div class="minute-chart-wrapper">
                <canvas id="minuteChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        let hourlyChart = null;
        let minuteChart = null;
        let currentDate = null;
        let availableDates = [];

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            // Summary will be loaded once a date is selected
            loadAvailableDates();
        });

        // Load summary statistics for a specific date
        async function loadSummary(date) {
            try {
                const response = await fetch(`/api/energy/dashboard/summary?date=${date}`);
                const data = await response.json();
                
                const summaryGrid = document.getElementById('summaryGrid');
                summaryGrid.innerHTML = `
                    <div class="summary-card">
                        <h3>Selected Day (${new Date(data.date).toLocaleDateString('en-US')}) — Per Second</h3>
                        <div class="value">${data.per_second.avg_current}<span class="unit">A</span></div>
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">Avg Energy: ${data.per_second.avg_energy.toFixed(5)} Wh/s</div>
                    </div>
                    <div class="summary-card">
                        <h3>Selected Day — Per Minute</h3>
                        <div class="value">${data.per_minute.avg_current}<span class="unit">A</span></div>
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">Avg Energy: ${data.per_minute.avg_energy.toFixed(2)} Wh/min</div>
                    </div>
                    <div class="summary-card">
                        <h3>Selected Day — Per Hour</h3>
                        <div class="value">${data.per_hour.avg_current}<span class="unit">A</span></div>
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">Avg Energy: ${data.per_hour.avg_energy.toFixed(2)} Wh/h</div>
                    </div>
                    <div class="summary-card">
                        <h3>Selected Day — Total</h3>
                        <div class="value">${data.per_day.avg_current}<span class="unit">A</span></div>
                        <div style="margin-top: 4px; font-size: 12px; color: #666;">Total Energy: ${data.per_day.total_energy.toFixed(2)} Wh</div>
                    </div>
                `;
            } catch (error) {
                console.error('Error loading summary:', error);
                document.getElementById('summaryGrid').innerHTML = '<div class="loading">Error loading summary data</div>';
            }
        }

        // Load available dates
        async function loadAvailableDates() {
            try {
                const response = await fetch('/api/energy/dashboard/dates');
                const data = await response.json();
                availableDates = data.dates;
                
                const selector = document.getElementById('dateSelector');
                selector.innerHTML = '<option value="">Select a date...</option>';
                data.dates.forEach(date => {
                    const option = document.createElement('option');
                    option.value = date;
                    option.textContent = new Date(date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    selector.appendChild(option);
                });
                
                // Auto-select first date if available
                if (data.dates.length > 0) {
                    selector.value = data.dates[0];
                    currentDate = data.dates[0];
                    // Load summary for the selected day
                    loadSummary(currentDate);
                    loadHourlyData(data.dates[0]);
                }
                
                selector.addEventListener('change', function() {
                    if (this.value) {
                        currentDate = this.value;
                        loadSummary(currentDate);
                        loadHourlyData(this.value);
                    }
                });
            } catch (error) {
                console.error('Error loading dates:', error);
            }
        }

        // Load hourly data for selected date
        async function loadHourlyData(date) {
            try {
                const response = await fetch(`/api/energy/dashboard/hourly?date=${date}`);
                const data = await response.json();
                
                document.getElementById('hourlyChartContainer').style.display = 'block';
                document.getElementById('hourlyChartSubtitle').textContent = 
                    `Data for ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                
                // Prepare chart data
                const hours = data.hourly_data.map(item => item.hour);
                const currents = data.hourly_data.map(item => parseFloat(item.avg_current));
                const energies = data.hourly_data.map(item => parseFloat(item.total_energy));
                
                // Find peak hour index
                const peakIndex = data.hourly_data.findIndex(item => item.hour === data.peak_hour.hour);
                
                // Display peak hour info
                const peakInfo = document.getElementById('peakHourInfo');
                peakInfo.innerHTML = `
                    <strong>Peak Consumption Hour:</strong> ${String(data.peak_hour.hour).padStart(2, '0')}:00<br>
                    <strong>Average Current:</strong> ${data.peak_hour.avg_current} A<br>
                    <strong>Total Energy:</strong> ${data.peak_hour.total_energy.toFixed(2)} Wh
                `;
                peakInfo.style.display = 'block';
                
                // Destroy existing chart if it exists
                if (hourlyChart) {
                    hourlyChart.destroy();
                }
                
                // Create new chart
                const ctx = document.getElementById('hourlyChart').getContext('2d');
                hourlyChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: hours.map(h => `${String(h).padStart(2, '0')}:00`),
                        datasets: [
                            {
                                label: 'Average Current (A)',
                                data: currents,
                                backgroundColor: hours.map((h, i) => i === peakIndex ? 'rgba(255, 99, 132, 0.8)' : 'rgba(54, 162, 235, 0.6)'),
                                borderColor: hours.map((h, i) => i === peakIndex ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)'),
                                borderWidth: 1,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Total Energy (Wh)',
                                data: energies,
                                type: 'line',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 2,
                                fill: false,
                                yAxisID: 'y1',
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (context.datasetIndex === 0) {
                                            return `Current: ${context.parsed.y.toFixed(2)} A`;
                                        } else {
                                            return `Energy: ${context.parsed.y.toFixed(2)} Wh`;
                                        }
                                    }
                                }
                            },
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Hour of Day'
                                }
                            },
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Current (A)'
                                }
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Energy (Wh)'
                                },
                                grid: {
                                    drawOnChartArea: false
                                }
                            }
                        },
                        onClick: function(event, elements) {
                            if (elements.length > 0) {
                                const clickedIndex = elements[0].index;
                                const clickedHour = hours[clickedIndex];
                                loadMinuteData(date, clickedHour);
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error loading hourly data:', error);
            }
        }

        // Load minute-by-minute data for selected hour
        async function loadMinuteData(date, hour) {
            try {
                const response = await fetch(`/api/energy/dashboard/minute?date=${date}&hour=${hour}`);
                const data = await response.json();
                
                document.getElementById('minuteChartContainer').style.display = 'block';
                document.getElementById('hourlyChartContainer').style.display = 'none';
                document.getElementById('minuteChartSubtitle').textContent = 
                    `Hour ${String(hour).padStart(2, '0')}:00 on ${new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                
                // Prepare chart data
                const minutes = data.minute_data.map(item => item.minute);
                const currents = data.minute_data.map(item => parseFloat(item.avg_current));
                const energies = data.minute_data.map(item => parseFloat(item.total_energy));
                
                // Destroy existing chart if it exists
                if (minuteChart) {
                    minuteChart.destroy();
                }
                
                // Create new chart
                const ctx = document.getElementById('minuteChart').getContext('2d');
                minuteChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: minutes.map(m => `${String(m).padStart(2, '0')}:00`),
                        datasets: [
                            {
                                label: 'Average Current (A)',
                                data: currents,
                                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                                yAxisID: 'y'
                            },
                            {
                                label: 'Total Energy (Wh)',
                                data: energies,
                                type: 'line',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 2,
                                fill: false,
                                yAxisID: 'y1',
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        if (context.datasetIndex === 0) {
                                            return `Current: ${context.parsed.y.toFixed(2)} A`;
                                        } else {
                                            return `Energy: ${context.parsed.y.toFixed(2)} Wh`;
                                        }
                                    }
                                }
                            },
                            legend: {
                                display: true,
                                position: 'top'
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Minute'
                                }
                            },
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Current (A)'
                                }
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Energy (Wh)'
                                },
                                grid: {
                                    drawOnChartArea: false
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error loading minute data:', error);
            }
        }

        // Hide minute chart and show hourly chart
        function hideMinuteChart() {
            document.getElementById('minuteChartContainer').style.display = 'none';
            document.getElementById('hourlyChartContainer').style.display = 'block';
        }
    </script>
</body>
</html>
