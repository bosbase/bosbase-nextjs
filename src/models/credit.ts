export interface Credit {
  id?: string;
  amount?: number;
  type?: string;
  created_at?: string;
  [key: string]: any;
}

export async function getCredits(): Promise<Credit[]> {
  // TODO: Implement actual data fetching
  return [];
}

export async function getCreditsByUserUuid(userUuid: string, page?: number, limit?: number): Promise<Credit[]> {
  // TODO: Implement actual data fetching
  return [];
}

