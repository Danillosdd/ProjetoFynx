import { ICategoryRepository } from '../../domains/financial/repositories/category.repository.js';
import { TransactionCategory } from '../../domains/financial/transactions/transactions.types.js';
import { database } from '../database/database.js';

export class SQLiteCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<TransactionCategory[]> {
    const rows = await database.all('SELECT * FROM categories ORDER BY name');
    return rows.map(row => ({
      id: row.id.toString(),
      name: row.name,
      type: row.type as 'income' | 'expense',
      icon: row.icon || '📊',
      color: row.color || '#6B7280',
      subcategories: []
    }));
  }

  async findById(id: string): Promise<TransactionCategory | null> {
    const row = await database.get('SELECT * FROM categories WHERE id = ?', [id]);
    if (!row) return null;
    return {
      id: row.id.toString(),
      name: row.name,
      type: row.type as 'income' | 'expense',
      icon: row.icon || '📊',
      color: row.color || '#6B7280',
      subcategories: []
    };
  }
}
