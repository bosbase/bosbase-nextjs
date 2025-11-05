export function formatTime(date: Date | string | number): string {
  // TODO: Implement actual time formatting
  return new Date(date).toISOString();
}

export function getTimeAgo(date: Date | string | number): string {
  // TODO: Implement actual time ago calculation
  return "recently";
}

export function getTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

