export interface BlogItem {
  id?: string;
  title?: string;
  description?: string;
  slug?: string;
  [key: string]: any;
}

export interface Blog {
  title?: string;
  description?: string;
  items?: BlogItem[];
  read_more_text?: string;
  [key: string]: any;
}

