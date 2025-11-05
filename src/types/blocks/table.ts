export interface TableColumn {
  key?: string;
  name?: string;
  label?: string;
  title?: string;
  callback?: (item: any) => any;
  [key: string]: any;
}

export interface TableProps {
  columns?: TableColumn[];
  data?: any[];
  title?: string;
  description?: string;
  tip?: any;
  toolbar?: any;
  empty_message?: string;
  [key: string]: any;
}

