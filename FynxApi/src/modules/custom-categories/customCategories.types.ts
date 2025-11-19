export interface CustomCategory {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  createdAt: string;
  isActive: boolean;
}

export interface CreateCustomCategoryRequest {
  name: string;
  type: 'income' | 'expense';
  userId?: number;
}

export interface UpdateCustomCategoryRequest {
  name?: string;
  isActive?: boolean;
}
