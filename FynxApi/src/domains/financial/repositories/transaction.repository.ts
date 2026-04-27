import { Transaction, TransactionFilters } from '../transactions/transactions.types.js';

export interface ITransactionRepository {
  findById(id: string, userId: number): Promise<Transaction | null>;
  findAll(userId: number, filters?: TransactionFilters, page?: number, limit?: number): Promise<{ transactions: Transaction[], total: number }>;
  save(transaction: any): Promise<Transaction>;
  delete(id: string, userId: number): Promise<boolean>;
  getSummary(userId: number): Promise<any>;
}
