// OpenAI pricing as of 2024 (in USD per 1K tokens)
const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 },
};

export function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = OPENAI_PRICING[model] || OPENAI_PRICING['gpt-3.5-turbo'];
  
  const inputCost = (promptTokens / 1000) * pricing.input;
  const outputCost = (completionTokens / 1000) * pricing.output;
  
  // Return cost in cents with decimal precision
  return (inputCost + outputCost) * 100;
}