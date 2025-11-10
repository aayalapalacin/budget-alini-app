export interface Expense {
  id?: string;
  name: string;
  amount: number;
  category: string;
  timestamp?: Date;
  isEditing?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

