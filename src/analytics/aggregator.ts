import { LLMCallData } from '../shared/types';

export interface Stats {
  totalCalls: number;
  totalCost: number;
  totalTokens: number;
  avgResponseTime: number;
}

export function calculateStats(calls: LLMCallData[]): Stats {
  if (calls.length === 0) {
    return {
      totalCalls: 0,
      totalCost: 0,
      totalTokens: 0,
      avgResponseTime: 0
    };
  }

  const totalCost = calls.reduce((sum, call) => sum + call.cost_cents, 0);
  const totalTokens = calls.reduce((sum, call) => sum + call.prompt_tokens + call.completion_tokens, 0);
  const avgResponseTime = Math.round(calls.reduce((sum, call) => sum + call.duration_ms, 0) / calls.length);

  return {
    totalCalls: calls.length,
    totalCost,
    totalTokens,
    avgResponseTime
  };
}