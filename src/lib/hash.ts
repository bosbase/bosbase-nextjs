export function hash(str: string): string {
  // TODO: Implement actual hashing
  return str;
}

export function getNonceStr(length: number = 32): string {
  // TODO: Implement actual nonce generation
  return Math.random().toString(36).substring(2, length + 2);
}

