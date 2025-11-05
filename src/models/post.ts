export enum PostStatus {
  Online = "online",
  Offline = "offline",
}

export interface Post {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  content?: string;
  status?: PostStatus;
  locale?: string;
  [key: string]: any;
}

export async function getPostsByLocale(locale: string): Promise<Post[]> {
  // TODO: Implement actual data fetching
  return [];
}

export async function findPostBySlug(slug: string, locale: string): Promise<Post | null> {
  // TODO: Implement actual data fetching
  return null;
}

