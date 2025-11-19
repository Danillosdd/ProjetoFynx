import { database } from '../../database/database.js';
import type { CustomCategory, CreateCustomCategoryRequest, UpdateCustomCategoryRequest } from './customCategories.types.js';

export class CustomCategoriesService {
  static async getCustomCategories(userId: number = 1): Promise<CustomCategory[]> {
    const rows = await database.all('SELECT * FROM custom_categories WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC', [userId]);
    return rows.map((r: any) => ({
      id: r.id.toString(),
      userId: r.user_id.toString(),
      name: r.name,
      type: r.type,
      createdAt: r.created_at,
      isActive: !!r.is_active,
    }));
  }

  static async createCustomCategory(data: CreateCustomCategoryRequest): Promise<CustomCategory> {
    const userId = data.userId ? parseInt(String(data.userId)) : 1;
    const name = String(data.name).trim();
    if (!name) throw new Error('Nome da categoria é obrigatório');
    if (name.length > 50) throw new Error('Nome da categoria é muito longo (max 50)');

    // Check duplicates
    const existing = await database.get('SELECT * FROM custom_categories WHERE user_id = ? AND LOWER(name) = LOWER(?) AND type = ? AND is_active = 1', [userId, name, data.type]);
    if (existing) throw new Error('Categoria já existe');

    const result = await database.run('INSERT INTO custom_categories (user_id, name, type, created_at, is_active) VALUES (?, ?, ?, ?, ?)', [userId, name, data.type, new Date().toISOString(), 1]);
    const row = await database.get('SELECT * FROM custom_categories WHERE id = ?', [result.lastID]);
    return {
      id: String(row.id),
      userId: String(row.user_id),
      name: row.name,
      type: row.type,
      createdAt: row.created_at,
      isActive: !!row.is_active,
    };
  }

  static async updateCustomCategory(id: string, data: UpdateCustomCategoryRequest): Promise<CustomCategory | null> {
    const row = await database.get('SELECT * FROM custom_categories WHERE id = ?', [parseInt(id)]);
    if (!row) return null;

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (data.name !== undefined) {
      const name = String(data.name).trim();
      if (!name) throw new Error('Nome da categoria é obrigatório');
      if (name.length > 50) throw new Error('Nome da categoria é muito longo (max 50)');
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (data.isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(data.isActive ? 1 : 0);
    }

    if (updateFields.length === 0) return {
      id: String(row.id), userId: String(row.user_id), name: row.name, type: row.type, createdAt: row.created_at, isActive: !!row.is_active
    };

    updateValues.push(parseInt(id));
    await database.run(`UPDATE custom_categories SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    const updated = await database.get('SELECT * FROM custom_categories WHERE id = ?', [parseInt(id)]);
    return {
      id: String(updated.id), userId: String(updated.user_id), name: updated.name, type: updated.type, createdAt: updated.created_at, isActive: !!updated.is_active
    };
  }

  // Check usage counts in transactions and spending_goals for a given category name and user
  static async getUsageCountsByName(name: string, userId: number = 1): Promise<{ transactions: number; goals: number }> {
    const tx = await database.get('SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND category = ?', [userId, name]);
    const goals = await database.get('SELECT COUNT(*) as count FROM spending_goals WHERE user_id = ? AND category = ?', [userId, name]);
    return { transactions: tx.count || 0, goals: goals.count || 0 };
  }

  // Soft-archive category
  static async archiveCategory(id: string): Promise<boolean> {
    const result = await database.run('UPDATE custom_categories SET is_active = 0 WHERE id = ?', [parseInt(id)]);
    return result.changes > 0;
  }

  // Hard delete only if not used
  static async deleteCategoryIfUnused(id: string): Promise<boolean> {
    const row = await database.get('SELECT * FROM custom_categories WHERE id = ?', [parseInt(id)]);
    if (!row) return false;
    const name = row.name;
    const userId = row.user_id;
    const counts = await this.getUsageCountsByName(name, userId);
    if (counts.transactions > 0 || counts.goals > 0) {
      return false;
    }
    const result = await database.run('DELETE FROM custom_categories WHERE id = ?', [parseInt(id)]);
    return result.changes > 0;
  }
}

export default CustomCategoriesService;
