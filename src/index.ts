import { LLMCallData, OpenAIResponse } from './types';
import { calculateCost } from './cost-calculator';
import { Database } from './database';

interface MiharuOptions {
  // Future options can be added here
}

class Miharu {
  private initialized = false;
  private originalFetch: typeof globalThis.fetch | null = null;
  private database: Database;

  constructor() {
    this.database = new Database();
  }

  async init(options?: MiharuOptions): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('Hello, greeting from miharu!');
    
    try {
      await this.database.init();
      this.setupFetchInterception();
      this.initialized = true;
    } catch (error) {
      console.error('[miharu-ai] Failed to initialize database:', error);
      throw error;
    }
  }

  private setupFetchInterception(): void {
    if (!globalThis.fetch) {
      console.warn('[miharu-ai] fetch is not available in this environment');
      return;
    }

    this.originalFetch = globalThis.fetch.bind(globalThis);

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      try {
        return await this.interceptedFetch(input, init);
      } catch (error) {
        console.error('[miharu-ai] Logging error:', error);
        // Fallback to original fetch if our interception fails
        return this.originalFetch!(input, init);
      }
    };
  }

  private async interceptedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    
    // Check if this is an OpenAI API call
    if (this.isOpenAIApiCall(url)) {
      return await this.handleOpenAICall(input, init);
    }

    // For non-OpenAI calls, use original fetch
    return this.originalFetch!(input, init);
  }

  private async handleOpenAICall(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    console.log('[miharu-ai] Intercepted OpenAI API call:', url);
    
    const startTime = Date.now();
    const response = await this.originalFetch!(input, init);
    const duration = Date.now() - startTime;
    
    try {
      // Clone the response to read the body without consuming it
      const responseClone = response.clone();
      
      if (response.ok) {
        const data: OpenAIResponse = await responseClone.json();
        const callData = this.parseOpenAIResponse(data, duration);
        console.log('[miharu-ai] API call data:', callData);
        
        // Save to database asynchronously
        this.database.saveCall(callData).catch(err => {
          console.error('[miharu-ai] Failed to save call data:', err);
        });
      } else {
        const errorData = await responseClone.text();
        console.log(`[miharu-ai] API call failed with status ${response.status}:`, errorData);
        
        const callData: LLMCallData = {
          id: this.generateId(),
          timestamp: Date.now(),
          model: 'unknown',
          prompt_tokens: 0,
          completion_tokens: 0,
          cost_cents: 0,
          duration_ms: duration,
          status: 'error'
        };
        console.log('[miharu-ai] Error call data:', callData);
        
        // Save error to database asynchronously
        this.database.saveCall(callData).catch(err => {
          console.error('[miharu-ai] Failed to save error call data:', err);
        });
      }
    } catch (parseError) {
      console.error('[miharu-ai] Error parsing response:', parseError);
    }
    
    return response;
  }

  private parseOpenAIResponse(data: OpenAIResponse, duration: number): LLMCallData {
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    const cost = calculateCost(data.model, usage.prompt_tokens, usage.completion_tokens);
    
    return {
      id: data.id,
      timestamp: Date.now(),
      model: data.model,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      cost_cents: cost,
      duration_ms: duration,
      status: 'success'
    };
  }

  private generateId(): string {
    return `miharu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isOpenAIApiCall(url: string): boolean {
    return url.includes('api.openai.com');
  }
}

const miharu = new Miharu();

export default miharu;