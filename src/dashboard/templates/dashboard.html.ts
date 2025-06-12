import { LLMCallData } from '../../shared/types';
import { formatCost } from '../../shared/utils';
import { Stats } from '../../analytics/aggregator';

export function generateDashboardHTML(calls: LLMCallData[], stats: Stats): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miharu AI Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f7;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #1d1d1f;
            margin-bottom: 10px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #1d1d1f;
        }
        .calls-table {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .table-header {
            padding: 20px;
            border-bottom: 1px solid #e5e5e7;
        }
        .table-header h3 {
            margin: 0;
            color: #1d1d1f;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 12px 20px;
            text-align: left;
            border-bottom: 1px solid #e5e5e7;
        }
        th {
            background-color: #f5f5f7;
            font-weight: 600;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-success {
            color: #34c759;
        }
        .status-error {
            color: #ff3b30;
        }
        .refresh-btn {
            background: #007aff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-left: 10px;
        }
        .refresh-btn:hover {
            background: #0051d5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Miharu AI Dashboard</h1>
            <p>OpenAI API Usage Analytics</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>Total Calls</h3>
                <div class="value">${stats.totalCalls}</div>
            </div>
            <div class="stat-card">
                <h3>Total Cost</h3>
                <div class="value">${formatCost(stats.totalCost)}</div>
            </div>
            <div class="stat-card">
                <h3>Total Tokens</h3>
                <div class="value">${stats.totalTokens.toLocaleString()}</div>
            </div>
            <div class="stat-card">
                <h3>Avg Response Time</h3>
                <div class="value">${stats.avgResponseTime}ms</div>
            </div>
        </div>

        <div class="calls-table">
            <div class="table-header">
                <h3>Recent API Calls
                    <button class="refresh-btn" onclick="location.reload()">Refresh</button>
                </h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Model</th>
                        <th>Tokens</th>
                        <th>Cost</th>
                        <th>Duration</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${calls.slice(0, 50).map(call => `
                        <tr>
                            <td>${new Date(call.timestamp).toLocaleString()}</td>
                            <td>${call.model}</td>
                            <td>${call.prompt_tokens + call.completion_tokens}</td>
                            <td>${formatCost(call.cost_cents)}</td>
                            <td>${call.duration_ms}ms</td>
                            <td class="status-${call.status}">${call.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>
  `;
}