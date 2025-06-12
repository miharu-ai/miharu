import { LLMCallData, OpenAIResponse } from '../shared/types';
import { calculateCost } from '../analytics/cost-calculator';
import { createErrorCallData } from '../storage/models/llm-call';
import { isOpenAIApiCall, extractUrlFromInput } from './openai-detector';

export class FetchWrapper {
  private originalFetch: typeof globalThis.fetch | null = null;
  private onApiCall?: (callData: LLMCallData) => void;

  constructor(onApiCall?: (callData: LLMCallData) => void) {
    this.onApiCall = onApiCall;
  }

  setup(): void {
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
    const url = extractUrlFromInput(input);
    
    // Check if this is an OpenAI API call
    if (isOpenAIApiCall(url)) {
      return await this.handleOpenAICall(input, init);
    }

    // For non-OpenAI calls, use original fetch
    return this.originalFetch!(input, init);
  }

  private async handleOpenAICall(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = extractUrlFromInput(input);
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
        
        if (this.onApiCall) {
          this.onApiCall(callData);
        }
      } else {
        const errorData = await responseClone.text();
        console.log(`[miharu-ai] API call failed with status ${response.status}:`, errorData);
        
        const callData = createErrorCallData(this.generateId(), duration);
        console.log('[miharu-ai] Error call data:', callData);
        
        if (this.onApiCall) {
          this.onApiCall(callData);
        }
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
}