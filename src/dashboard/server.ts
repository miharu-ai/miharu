import * as http from 'http';
import * as url from 'url';
import { Database } from '../storage/database';
import { calculateStats } from '../analytics/aggregator';
import { generateDashboardHTML } from './templates/dashboard.html';
import { handleApiRoutes } from './routes/api';

export async function startDashboard(port: number = 3001): Promise<void> {
  const database = new Database();
  await database.init();

  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    const pathname = parsedUrl.pathname;

    try {
      // Handle API routes
      if (pathname?.startsWith('/api/')) {
        const handled = await handleApiRoutes(req, res, pathname, database);
        if (handled) return;
      }

      // Handle main dashboard
      if (pathname === '/') {
        const calls = await database.getAllCalls();
        const stats = calculateStats(calls);
        const html = generateDashboardHTML(calls, stats);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });

  server.listen(port, () => {
    console.log(`🚀 Miharu dashboard running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down dashboard...');
    server.close();
    await database.close();
    process.exit(0);
  });
}