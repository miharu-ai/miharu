// Helper function to format cost for display
export function formatCost(cents: number): string {
  const usd = cents / 100;
  if (usd >= 0.01) {
    return `$${usd.toFixed(2)}`;
  } else if (usd >= 0.001) {
    return `$${usd.toFixed(3)}`;
  } else {
    return `$${usd.toFixed(4)}`;
  }
}