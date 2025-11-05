export interface Affiliate {
  id?: string;
  code?: string;
  created_at?: string;
  status?: string;
  reward_amount?: number;
  user?: any;
  [key: string]: any;
}

export async function getAffiliates(): Promise<Affiliate[]> {
  // TODO: Implement actual data fetching
  return [];
}

export async function getAffiliatesByUserUuid(userUuid: string): Promise<Affiliate[]> {
  // TODO: Implement actual data fetching
  return [];
}

export async function getAffiliateSummary(userUuid: string): Promise<any> {
  // TODO: Implement actual data fetching
  return null;
}

