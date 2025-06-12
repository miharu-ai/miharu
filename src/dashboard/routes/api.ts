import * as http from 'http';
import { Database } from '../../storage/database';

export async function handleApiRoutes(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  pathname: string,
  database: Database
): Promise<boolean> {
  if (pathname === '/api/calls') {
    try {
      const calls = await database.getAllCalls();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(calls));
      return true;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch calls' }));
      return true;
    }
  }
  
  return false;
}