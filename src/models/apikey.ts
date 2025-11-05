export enum ApikeyStatus {
  Active = "active",
  Inactive = "inactive",
  Created = "created",
}

export interface ApiKey {
  id?: string;
  name?: string;
  title?: string;
  key?: string;
  api_key?: string;
  user_uuid?: string;
  status?: ApikeyStatus;
  created_at?: string | Date;
  [key: string]: any;
}

export async function getApiKeys(): Promise<ApiKey[]> {
  // TODO: Implement actual data fetching
  return [];
}

export async function getUserApikeys(userUuid: string): Promise<ApiKey[]> {
  // TODO: Implement actual data fetching
  return [];
}

export async function createApiKey(data: Partial<ApiKey>): Promise<ApiKey> {
  // TODO: Implement actual data creation
  return {} as ApiKey;
}

export async function insertApikey(data: Partial<ApiKey>): Promise<ApiKey> {
  // TODO: Implement actual data insertion
  return {} as ApiKey;
}

