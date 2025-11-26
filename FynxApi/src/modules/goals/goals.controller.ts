import type { Request, Response } from 'express';
import { GoalsService } from './goals.service.js';
import { z } from 'zod';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import type { UpdateSpendingGoalRequest } from './goals.types.js';

const createSpendingGoalSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  target_amount: z.number().positive(),
  period: z.enum(['monthly', 'weekly', 'yearly']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  goal_type: z.enum(['spending', 'saving']).default('spending'),
});

const updateSpendingGoalSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  target_amount: z.number().positive().optional(),
  period: z.enum(['monthly', 'weekly', 'yearly']).optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export class GoalsController {
  static async getGoalsData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = await GoalsService.getGoalsData(userId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSpendingGoals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const goals = await GoalsService.getSpendingGoals(userId);
      res.json(goals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getSpendingGoalById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const goal = await GoalsService.getSpendingGoalById(id);
      if (!goal) return res.status(404).json({ error: 'Goal not found' });

      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createSpendingGoal(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = createSpendingGoalSchema.parse(req.body);

      const serviceData = {
        title: data.title,
        category: data.category,
        targetAmount: data.target_amount,
        period: data.period,
        startDate: data.start_date || '',
        endDate: data.end_date || '',
        goalType: data.goal_type,
        userId
      };

      const goal = await GoalsService.createSpendingGoal(serviceData);

      res.status(201).json(goal);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async updateSpendingGoal(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const data = updateSpendingGoalSchema.parse(req.body);

      // Manually construct the object to avoid undefined properties
      const serviceData: UpdateSpendingGoalRequest = {};
      if (data.title !== undefined) serviceData.title = data.title;
      if (data.category !== undefined) serviceData.category = data.category;
      if (data.target_amount !== undefined) serviceData.targetAmount = data.target_amount;
      if (data.period !== undefined) serviceData.period = data.period;
      if (data.start_date !== undefined) serviceData.startDate = data.start_date;
      if (data.end_date !== undefined) serviceData.endDate = data.end_date;
      if (data.status !== undefined) serviceData.status = data.status;

      const goal = await GoalsService.updateSpendingGoal(id, serviceData);
      res.json(goal);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteSpendingGoal(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      await GoalsService.deleteSpendingGoal(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateGoalProgress(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const { amount } = req.body;

      if (amount === undefined) {
        return res.status(400).json({ error: 'Amount is required' });
      }

      const goal = await GoalsService.updateGoalProgress(id, Number(amount));
      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateGoalProgressByTransaction(req: AuthRequest, res: Response) {
    try {
      const { goalId, amount, type } = req.body;

      if (!goalId || amount === undefined || !type) {
        return res.status(400).json({ error: 'GoalId, amount and type are required' });
      }

      const goal = await GoalsService.updateGoalProgressByTransaction(goalId, amount, type);
      res.json(goal);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Budgets endpoints
  static async getBudgets(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const budgets = await GoalsService.getBudgets(userId);
      res.json(budgets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getBudgetById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const budget = await GoalsService.getBudgetById(id);
      if (!budget) return res.status(404).json({ error: 'Budget not found' });

      res.json(budget);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createBudget(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, category, allocated_amount, period, start_date, end_date } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const budget = await GoalsService.createBudget({
        userId,
        name,
        category,
        allocatedAmount: allocated_amount,
        period,
        startDate: start_date,
        endDate: end_date
      });
      res.status(201).json(budget);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateBudget(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const data = req.body;
      const budget = await GoalsService.updateBudget(id, data);
      res.json(budget);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteBudget(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      await GoalsService.deleteBudget(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateBudgetSpending(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const { spentAmount } = req.body;
      if (spentAmount === undefined) return res.status(400).json({ error: 'Spent amount is required' });

      const budget = await GoalsService.updateBudgetSpending(id, Number(spentAmount));
      if (!budget) return res.status(404).json({ error: 'Budget not found' });

      res.json(budget);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
