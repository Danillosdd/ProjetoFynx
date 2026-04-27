import { SQLiteTransactionRepository } from './repositories/sqlite-transaction.repository.js';
import { SQLiteScoreRepository } from './repositories/sqlite-score.repository.js';
import { SQLiteCategoryRepository } from './repositories/sqlite-category.repository.js';
import { CreateTransactionUseCase } from '../application/financial/create-transaction.usecase.js';
import { DeleteTransactionUseCase } from '../application/financial/delete-transaction.usecase.js';

// Repositories
export const transactionRepository = new SQLiteTransactionRepository();
export const scoreRepository = new SQLiteScoreRepository();
export const categoryRepository = new SQLiteCategoryRepository();

// Use Cases
export const createTransactionUseCase = new CreateTransactionUseCase(
  transactionRepository,
  scoreRepository
);

export const deleteTransactionUseCase = new DeleteTransactionUseCase(
  transactionRepository
);
