import type { 
  SpendingLimit, 
  CreateSpendingLimitRequest, 
  UpdateSpendingLimitRequest,
  UpdateSpendingLimitProgressRequest
} from './spending-limits.types.js';
import { database } from '../../../infrastructure/database/database.js';

// Helper function to format spending limit from database row
function formatSpendingLimitFromDB(row: any): SpendingLimit {
  return {
    id: row.id.toString(),
    category: row.category,
    limitAmount: row.limit_amount,
    currentSpent: row.current_spent,
    period: row.period,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class SpendingLimitsService {
  // Get all spending limits
  static async getSpendingLimits(): Promise<SpendingLimit[]> {
    const db = database;
    const rows = await db.all('SELECT * FROM spending_limits ORDER BY created_at DESC', []);
    return rows.map(formatSpendingLimitFromDB);
  }

  // Get spending limit by ID
  static async getSpendingLimitById(id: number): Promise<SpendingLimit | null> {
    const db = database;
    const row = await db.get('SELECT * FROM spending_limits WHERE id = ?', [id]);
    return row ? formatSpendingLimitFromDB(row) : null;
  }

  // Get spending limit by category
  static async getSpendingLimitByCategory(category: string): Promise<SpendingLimit | null> {
    const db = database;
    const row = await db.get('SELECT * FROM spending_limits WHERE category = ?', [category]);
    return row ? formatSpendingLimitFromDB(row) : null;
  }

  // Create new spending limit
  static async createSpendingLimit(data: CreateSpendingLimitRequest): Promise<SpendingLimit> {
    const db = database;
    const now = new Date().toISOString();
    
    const result = await db.run(`
      INSERT INTO spending_limits (
        category, limit_amount, current_spent, period, 
        start_date, end_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.category,
      data.limitAmount,
      0, // currentSpent starts at 0
      data.period,
      data.startDate,
      data.endDate,
      'active', // status starts as active
      now,
      now
    ]);

    const newLimit = await this.getSpendingLimitById(result.lastID);
    if (!newLimit) {
      throw new Error('Failed to create spending limit');
    }
    
    return newLimit;
  }

  // Update spending limit
  static async updateSpendingLimit(id: number, data: UpdateSpendingLimitRequest): Promise<SpendingLimit | null> {
    const db = database;
    const now = new Date().toISOString();
    
    // Get current limit to check if it exists
    const currentLimit = await this.getSpendingLimitById(id);
    if (!currentLimit) return null;

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    if (data.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(data.category);
    }
    if (data.limitAmount !== undefined) {
      updateFields.push('limit_amount = ?');
      updateValues.push(data.limitAmount);
    }
    if (data.period !== undefined) {
      updateFields.push('period = ?');
      updateValues.push(data.period);
    }
    if (data.startDate !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(data.startDate);
    }
    if (data.endDate !== undefined) {
      updateFields.push('end_date = ?');
      updateValues.push(data.endDate);
    }
    
    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(id);

    // Update the spending limit
    await db.run(`
      UPDATE spending_limits 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `, updateValues);

    // Get updated limit and recalculate status if limit amount changed
    const updatedLimit = await this.getSpendingLimitById(id);
    if (updatedLimit && data.limitAmount !== undefined) {
      const newStatus = updatedLimit.currentSpent > data.limitAmount ? 'exceeded' : 'active';
      await db.run('UPDATE spending_limits SET status = ? WHERE id = ?', [newStatus, id]);
      updatedLimit.status = newStatus;
    }

    return updatedLimit;
  }

  // Update spending limit progress (add expense amount)
  static async updateSpendingLimitProgress(id: number, data: UpdateSpendingLimitProgressRequest): Promise<SpendingLimit | null> {
    const db = database;
    const now = new Date().toISOString();
    
    // Get current limit
    const currentLimit = await this.getSpendingLimitById(id);
    if (!currentLimit) return null;
    
    // Calculate new current spent amount
    const newCurrentSpent = Math.max(0, currentLimit.currentSpent + data.amount);
    const newStatus = newCurrentSpent > currentLimit.limitAmount ? 'exceeded' : 'active';
    
    // Update the spending limit
    await db.run(`
      UPDATE spending_limits 
      SET current_spent = ?, status = ?, updated_at = ? 
      WHERE id = ?
    `, [newCurrentSpent, newStatus, now, id]);

    return await this.getSpendingLimitById(id);
  }

  // Delete spending limit
  static async deleteSpendingLimit(id: number): Promise<boolean> {
    const db = database;
    const result = await db.run('DELETE FROM spending_limits WHERE id = ?', [id]);
    return result.changes > 0;
  }

  // Get all categories from spending limits
  static async getCategories(): Promise<string[]> {
    const db = database;
    const rows = await db.all('SELECT DISTINCT category FROM spending_limits ORDER BY category', []);
    return rows.map((row: any) => row.category);
  }
}