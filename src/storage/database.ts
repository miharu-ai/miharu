import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { LLMCallData } from '../shared/types';

export class Database {
  private db: sqlite3.Database | null = null;
  private writeQueue: LLMCallData[] = [];
  private isProcessing = false;

  constructor(private dbPath: string = path.join(process.cwd(), 'miharu.db')) {
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        this.createTables()
          .then(() => resolve())
          .catch(reject);
      });
    });
  }

  private createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS llm_calls (
          id TEXT PRIMARY KEY,
          timestamp INTEGER,
          model TEXT,
          prompt_tokens INTEGER,
          completion_tokens INTEGER,
          cost_cents REAL,
          duration_ms INTEGER,
          status TEXT
        )
      `;
      
      this.db!.run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async saveCall(callData: LLMCallData): Promise<void> {
    // Add to queue for async processing
    this.writeQueue.push(callData);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.writeQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.writeQueue.length > 0) {
        const callData = this.writeQueue.shift()!;
        await this.insertCall(callData);
      }
    } catch (error) {
      console.error('[miharu-ai] Database error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private insertCall(callData: LLMCallData): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO llm_calls (
          id, timestamp, model, prompt_tokens, completion_tokens, 
          cost_cents, duration_ms, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db!.run(sql, [
        callData.id,
        callData.timestamp,
        callData.model,
        callData.prompt_tokens,
        callData.completion_tokens,
        callData.cost_cents,
        callData.duration_ms,
        callData.status
      ], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async getAllCalls(): Promise<LLMCallData[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM llm_calls ORDER BY timestamp DESC';
      
      this.db!.all(sql, (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            id: row.id,
            timestamp: row.timestamp,
            model: row.model,
            prompt_tokens: row.prompt_tokens,
            completion_tokens: row.completion_tokens,
            cost_cents: row.cost_cents,
            duration_ms: row.duration_ms,
            status: row.status
          })));
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}