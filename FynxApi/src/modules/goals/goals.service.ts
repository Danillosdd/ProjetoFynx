import type { 
  SpendingGoal, 
  Budget, 
  GoalProgress, 
  GoalsData, 
  CreateSpendingGoalRequest, 
  UpdateSpendingGoalRequest,
  CreateBudgetRequest,
  UpdateBudgetRequest
} from './goals.types.js';
import { database } from '../../database/database.js';
import type { Database } from 'sqlite3';

// Database row interfaces
interface SpendingGoalRow {
  id: number;
  title: string;
  goal_type?: string;
  category: string;
  target_amount: number;
  current_amount: number;
  period: string;
  start_date: string;
  end_date: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface BudgetRow {
  id: number;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  period: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Helper function to calculate goal progress
const calculateGoalProgress = (goal: SpendingGoal): GoalProgress => {
  const progressPercentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
  
  const startDate = new Date(goal.startDate);
  const endDate = new Date(goal.endDate);
  const today = new Date();
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), 0);
  
  const dailyTargetAmount = goal.targetAmount / totalDays;
  const expectedAmount = dailyTargetAmount * (totalDays - daysRemaining);
  const isOnTrack = goal.currentAmount >= expectedAmount;
  
  const projectedCompletion: string = isOnTrack ? goal.endDate : 
    new Date(today.getTime() + (remainingAmount / dailyTargetAmount) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || goal.endDate;

  return {
    goalId: goal.id,
    progressPercentage: Math.round(progressPercentage),
    remainingAmount,
    daysRemaining,
    isOnTrack,
    projectedCompletion
  };
};

// Helper function to format spending goal from database
const formatSpendingGoalFromDB = (row: SpendingGoalRow): SpendingGoal => {
  const goal: SpendingGoal = {
    id: row.id.toString(),
    title: row.title,
    goalType: (row.goal_type as 'spending' | 'saving') || 'spending',
    category: row.category,
    targetAmount: row.target_amount,
    currentAmount: row.current_amount,
    period: row.period as 'monthly' | 'weekly' | 'yearly',
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status as 'active' | 'completed' | 'paused',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
  
  if (row.description) {
    goal.description = row.description;
  }
  
  return goal;
};

// Helper function to format budget from database
const formatBudgetFromDB = (row: BudgetRow): Budget => ({
  id: row.id.toString(),
  category: row.category,
  allocatedAmount: row.allocated_amount,
  spentAmount: row.spent_amount,
  remainingAmount: row.remaining_amount,
  period: row.period as 'monthly' | 'weekly' | 'yearly',
  startDate: row.start_date,
  endDate: row.end_date,
  status: row.status as 'active' | 'exceeded' | 'completed',
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export class GoalsService {
  // Get all goals data
  static async getGoalsData(): Promise<GoalsData> {
    const db = database;
    
    try {
      // Get spending goals
      const goalRows = await db.all('SELECT * FROM spending_goals ORDER BY created_at DESC', []);
      const spendingGoals = goalRows.map((row: any) => formatSpendingGoalFromDB(row as SpendingGoalRow));
      const goalProgress = spendingGoals.map(calculateGoalProgress);
      const activeGoals = spendingGoals.filter(goal => goal.status === 'active').length;
      const completedGoals = spendingGoals.filter(goal => goal.status === 'completed').length;

      // Get budgets
      const budgetRows = await db.all('SELECT * FROM budgets ORDER BY created_at DESC', []);
      const budgets = budgetRows.map((row: any) => formatBudgetFromDB(row as BudgetRow));
      const totalBudgetAllocated = budgets.reduce((sum, budget) => sum + budget.allocatedAmount, 0);
      const totalBudgetSpent = budgets.reduce((sum, budget) => sum + budget.spentAmount, 0);

      return {
        spendingGoals,
        budgets,
        goalProgress,
        totalGoals: spendingGoals.length,
        activeGoals,
        completedGoals,
        totalBudgetAllocated,
        totalBudgetSpent
      };
    } catch (error) {
      throw error;
    }
  }

  // Spending Goals CRUD
  static async getSpendingGoals(): Promise<SpendingGoal[]> {
    const db = database;
    
    try {
      const rows = await db.all('SELECT * FROM spending_goals ORDER BY created_at DESC', []);
      return rows.map(formatSpendingGoalFromDB);
    } catch (error) {
      throw error;
    }
  }

  static async getSpendingGoalById(id: string): Promise<SpendingGoal | null> {
    const db = database;
    
    try {
      const row = await db.get('SELECT * FROM spending_goals WHERE id = ?', [parseInt(id)]);
      return row ? formatSpendingGoalFromDB(row as SpendingGoalRow) : null;
    } catch (error) {
      throw error;
    }
  }

  static async createSpendingGoal(data: CreateSpendingGoalRequest): Promise<SpendingGoal> {
    const db = database;
    const now = new Date().toISOString();
    
    try {
      const userId = (data as any).userId ? parseInt((data as any).userId) : 1;
      const goalType = (data as any).goalType || 'spending';

      if (goalType === 'spending') {
        // Se for uma meta de gastos (limite), não exigir start_date/end_date
        const result = await db.run(
          `INSERT INTO spending_goals (
            user_id, title, goal_type, category, target_amount, current_amount, period, 
            status, description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            data.title,
            'spending',
            data.category,
            data.targetAmount,
            0,
            data.period,
            'active',
            data.description || null,
            now,
            now,
          ],
        );

        const row = await db.get('SELECT * FROM spending_goals WHERE id = ?', [result.lastID]);
        return formatSpendingGoalFromDB(row as SpendingGoalRow);
      } else {
        // Se for uma meta de poupança, validar e incluir start_date e end_date
        if (!data.startDate || !data.endDate) {
          throw new Error('Metas de poupança precisam de startDate e endDate');
        }
        
        const result = await db.run(`
          INSERT INTO spending_goals (
            user_id, title, goal_type, category, target_amount, current_amount, period, 
            start_date, end_date, status, description, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          userId,
          data.title,
          'saving',
          data.category,
          data.targetAmount,
          0, // currentAmount começa em 0
          data.period,
          data.startDate,
          data.endDate,
          'active',
          data.description || null,
          now,
          now
        ]);
        
        const row = await db.get('SELECT * FROM spending_goals WHERE id = ?', [result.lastID]);
        return formatSpendingGoalFromDB(row as SpendingGoalRow);
      }
    } catch (error) {
      throw error;
    }
  }

  static async updateSpendingGoal(id: string, data: UpdateSpendingGoalRequest): Promise<SpendingGoal | null> {
    const db = database;
    const now = new Date().toISOString();
    
    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (data.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(data.title);
      }
      if ((data as any).goalType !== undefined) {
        updateFields.push('goal_type = ?');
        updateValues.push((data as any).goalType);
      }
      if (data.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(data.category);
      }
      if (data.targetAmount !== undefined) {
        updateFields.push('target_amount = ?');
        updateValues.push(data.targetAmount);
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
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }
      if (data.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(data.description);
      }
      
      if (updateFields.length === 0) {
        // No fields to update, return current goal
        return await this.getSpendingGoalById(id);
      }
      
      updateFields.push('updated_at = ?');
      updateValues.push(now);
      updateValues.push(parseInt(id));
      
      const query = `UPDATE spending_goals SET ${updateFields.join(', ')} WHERE id = ?`;
      
      const result = await db.run(query, updateValues);
      
      if (result.changes === 0) {
        return null;
      }
      
      // Get the updated goal
      const row = await db.get('SELECT * FROM spending_goals WHERE id = ?', [parseInt(id)]);
      return formatSpendingGoalFromDB(row as SpendingGoalRow);
    } catch (error) {
      throw error;
    }
  }

  static async deleteSpendingGoal(id: string): Promise<boolean> {
    const db = database;
    
    try {
      const result = await db.run('DELETE FROM spending_goals WHERE id = ?', [parseInt(id)]);
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateGoalProgress(id: string, amount: number): Promise<SpendingGoal | null> {
    const db = database;
    const now = new Date().toISOString();
    
    try {
      // First get the current goal to check target amount
      const row = await db.get('SELECT * FROM spending_goals WHERE id = ?', [parseInt(id)]);
      
      if (!row) {
        return null;
      }
      
      const goal = formatSpendingGoalFromDB(row as SpendingGoalRow);
      const newStatus = amount >= goal.targetAmount ? 'completed' : goal.status;
      
      // Update the goal
      await db.run(
        'UPDATE spending_goals SET current_amount = ?, status = ?, updated_at = ? WHERE id = ?',
        [amount, newStatus, now, parseInt(id)]
      );
      
      // Get the updated goal
      const updatedRow = await db.get('SELECT * FROM spending_goals WHERE id = ?', [parseInt(id)]);
      return updatedRow ? formatSpendingGoalFromDB(updatedRow as SpendingGoalRow) : null;
    } catch (error) {
      throw error;
    }
  }

  static async updateGoalProgressByTransaction(id: string, amount: number, transactionType: 'income' | 'expense'): Promise<SpendingGoal | null> {
    const db = database;
    const now = new Date().toISOString();
    
    try {
      // First get the current goal
      const row = await db.get('SELECT * FROM spending_goals WHERE id = ?', [parseInt(id)]);
      
      if (!row) {
        return null;
      }
      
      const goal = formatSpendingGoalFromDB(row as SpendingGoalRow);
      let newCurrentAmount = goal.currentAmount;

      // Para metas de gasto: despesas aumentam o currentAmount, receitas (se houver) podem reduzir
      if (transactionType === 'expense') {
        newCurrentAmount = newCurrentAmount + amount;
      } else if (transactionType === 'income') {
        newCurrentAmount = Math.max(0, newCurrentAmount - amount);
      }
      
      const newStatus = newCurrentAmount >= goal.targetAmount ? 'completed' : goal.status;
      
      // Update the goal
      await db.run(
        'UPDATE spending_goals SET current_amount = ?, status = ?, updated_at = ? WHERE id = ?',
        [newCurrentAmount, newStatus, now, parseInt(id)]
      );
      
      // Get the updated goal
      const updatedRow = await db.get('SELECT * FROM spending_goals WHERE id = ?', [parseInt(id)]);
      return updatedRow ? formatSpendingGoalFromDB(updatedRow as SpendingGoalRow) : null;
    } catch (error) {
      throw error;
    }
  }

  // Budgets CRUD
  static async getBudgets(): Promise<Budget[]> {
    const db = database;
    
    try {
      const rows = await db.all('SELECT * FROM budgets ORDER BY created_at DESC', []);
      return rows.map((row: any) => formatBudgetFromDB(row as BudgetRow));
    } catch (error) {
      throw error;
    }
  }

  static async getBudgetById(id: string): Promise<Budget | null> {
    const db = database;
    
    try {
      const row = await db.get('SELECT * FROM budgets WHERE id = ?', [parseInt(id)]);
      return row ? formatBudgetFromDB(row as BudgetRow) : null;
    } catch (error) {
      throw error;
    }
  }

  static async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    const db = database;
    const now = new Date().toISOString();
    
    try {
      const userId = (data as any).userId ? parseInt((data as any).userId) : 1;

      const result = await db.run(`
        INSERT INTO budgets (
          user_id, category, allocated_amount, spent_amount, remaining_amount, 
          period, start_date, end_date, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId,
        data.category,
        data.allocatedAmount,
        0, // spentAmount starts at 0
        data.allocatedAmount, // remainingAmount equals allocatedAmount initially
        data.period,
        data.startDate,
        data.endDate,
        'active',
        now,
        now
      ]);
      
      // Get the created budget
      const row = await db.get('SELECT * FROM budgets WHERE id = ?', [result.lastID]);
      return formatBudgetFromDB(row as BudgetRow);
    } catch (error) {
      throw error;
    }
  }

  static async updateBudget(id: string, data: UpdateBudgetRequest): Promise<Budget | null> {
    const db = database;
    const now = new Date().toISOString();
    
    try {
      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (data.category !== undefined) {
        updateFields.push('category = ?');
        updateValues.push(data.category);
      }
      if (data.allocatedAmount !== undefined) {
        updateFields.push('allocated_amount = ?');
        updateValues.push(data.allocatedAmount);
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
      if (data.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(data.status);
      }
      
      if (updateFields.length === 0) {
        // No fields to update, return current budget
        return await this.getBudgetById(id);
      }
      
      updateFields.push('updated_at = ?');
      updateValues.push(now);
      updateValues.push(parseInt(id));
      
      const query = `UPDATE budgets SET ${updateFields.join(', ')} WHERE id = ?`;
      
      const result = await db.run(query, updateValues);
      
      if (result.changes === 0) {
        return null;
      }
      
      // If allocated amount changed, recalculate remaining amount and status
      if (data.allocatedAmount !== undefined) {
        const row = await db.get('SELECT * FROM budgets WHERE id = ?', [parseInt(id)]);
        
        if (!row) {
          return null;
        }
        
        const budget = formatBudgetFromDB(row as BudgetRow);
        const newRemainingAmount = budget.allocatedAmount - budget.spentAmount;
        const newStatus = newRemainingAmount < 0 ? 'exceeded' : 'active';
        
        await db.run(
          'UPDATE budgets SET remaining_amount = ?, status = ? WHERE id = ?',
          [newRemainingAmount, newStatus, parseInt(id)]
        );
        
        // Get the final updated budget
        const finalRow = await db.get('SELECT * FROM budgets WHERE id = ?', [parseInt(id)]);
        return finalRow ? formatBudgetFromDB(finalRow as BudgetRow) : null;
      } else {
        // Get the updated budget
        const row = await db.get('SELECT * FROM budgets WHERE id = ?', [parseInt(id)]);
        return row ? formatBudgetFromDB(row as BudgetRow) : null;
      }
    } catch (error) {
      throw error;
    }
  }

  static async deleteBudget(id: string): Promise<boolean> {
    const db = database;
    
    try {
      const result = await db.run('DELETE FROM budgets WHERE id = ?', [parseInt(id)]);
      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateBudgetSpending(id: string, spentAmount: number): Promise<Budget | null> {
    const db = database;
    const now = new Date().toISOString();
    
    try {
      // First get the current budget to calculate remaining amount
      const row = await db.get('SELECT * FROM budgets WHERE id = ?', [parseInt(id)]);
      
      if (!row) {
        return null;
      }
      
      const budget = formatBudgetFromDB(row as BudgetRow);
      const remainingAmount = budget.allocatedAmount - spentAmount;
      const status = remainingAmount < 0 ? 'exceeded' : 'active';
      
      // Update the budget
      await db.run(
        'UPDATE budgets SET spent_amount = ?, remaining_amount = ?, status = ?, updated_at = ? WHERE id = ?',
        [spentAmount, remainingAmount, status, now, parseInt(id)]
      );
      
      // Get the updated budget
      const updatedRow = await db.get('SELECT * FROM budgets WHERE id = ?', [parseInt(id)]);
      return updatedRow ? formatBudgetFromDB(updatedRow as BudgetRow) : null;
    } catch (error) {
      throw error;
    }
  }
}