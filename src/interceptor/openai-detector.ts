export function isOpenAIApiCall(url: string): boolean {
  return url.includes('api.openai.com');
}

export function extractUrlFromInput(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}