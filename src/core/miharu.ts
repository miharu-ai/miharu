import { MiharuOptions, LLMCallData } from '../shared/types';
import { Database } from '../storage/database';
import { FetchWrapper } from '../interceptor/fetch-wrapper';

export class Miharu {
  private initialized = false;
  private database: Database;
  private fetchWrapper: FetchWrapper;

  constructor() {
    this.database = new Database();
    this.fetchWrapper = new FetchWrapper((callData: LLMCallData) => {
      this.database.saveCall(callData).catch(err => {
        console.error('[miharu-ai] Failed to save call data:', err);
      });
    });
  }

  async init(options?: MiharuOptions): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('Hello, greeting from miharu!');
    
    try {
      await this.database.init();
      this.fetchWrapper.setup();
      this.initialized = true;
    } catch (error) {
      console.error('[miharu-ai] Failed to initialize database:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.database.close();
  }
}