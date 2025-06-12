export interface LLMCallData {
  id: string;
  timestamp: number;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_cents: number; // Cost in cents (can have decimal places)
  duration_ms: number;
  status: 'success' | 'error';
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  usage?: OpenAIUsage;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}