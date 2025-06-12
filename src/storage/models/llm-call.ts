import { LLMCallData } from '../../shared/types';

export function createLLMCallData(
  id: string,
  model: string,
  promptTokens: number,
  completionTokens: number,
  costCents: number,
  durationMs: number,
  status: 'success' | 'error' = 'success'
): LLMCallData {
  return {
    id,
    timestamp: Date.now(),
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    cost_cents: costCents,
    duration_ms: durationMs,
    status
  };
}

export function createErrorCallData(id: string, durationMs: number): LLMCallData {
  return createLLMCallData(id, 'unknown', 0, 0, 0, durationMs, 'error');
}