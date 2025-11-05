export interface FormSlot {
  fields?: any[];
  onSubmit?: (data: any) => void;
  [key: string]: any;
}

export interface Form {
  fields?: any[];
  title?: string;
  crumb?: any;
  onSubmit?: (data: any) => void;
  [key: string]: any;
}

