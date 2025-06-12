interface MiharuOptions {
  // Future options can be added here
}

class Miharu {
  private initialized = false;
  private originalFetch: typeof globalThis.fetch | null = null;

  init(options?: MiharuOptions): void {
    if (this.initialized) {
      return;
    }

    console.log('Hello, greeting from miharu!');
    this.setupFetchInterception();
    this.initialized = true;
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
      console.log('[miharu-ai] Intercepted OpenAI API call:', url);
      const startTime = Date.now();
      
      const response = await this.originalFetch!(input, init);
      
      const duration = Date.now() - startTime;
      console.log(`[miharu-ai] OpenAI API call completed in ${duration}ms`);
      
      return response;
    }

    // For non-OpenAI calls, use original fetch
    return this.originalFetch!(input, init);
  }

  private isOpenAIApiCall(url: string): boolean {
    return url.includes('api.openai.com');
  }
}

const miharu = new Miharu();

export default miharu;