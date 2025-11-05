export async function getCache(key: string) {
  // TODO: Implement actual caching
  return null;
}

export async function setCache(key: string, value: any, ttl?: number) {
  // TODO: Implement actual caching
}

export function cacheSet(key: string, value: any, expiresAt?: number) {
  // TODO: Implement actual caching
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify({ value, expiresAt }));
  }
}

