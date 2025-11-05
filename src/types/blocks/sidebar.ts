export interface SidebarItem {
  id?: string;
  label?: string;
  title?: string;
  href?: string;
  url?: string;
  icon?: any;
  is_active?: boolean;
  [key: string]: any;
}

export interface Sidebar {
  items?: SidebarItem[];
  nav?: {
    items?: SidebarItem[];
  };
  [key: string]: any;
}

