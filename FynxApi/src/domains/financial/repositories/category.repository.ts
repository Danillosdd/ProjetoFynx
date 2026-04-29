import type { TransactionCategory } from '../transactions/transactions.types.js';

export interface ICategoryRepository {
  findAll(): Promise<TransactionCategory[]>;
  findById(id: string): Promise<TransactionCategory | null>;
}
