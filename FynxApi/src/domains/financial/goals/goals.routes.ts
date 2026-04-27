import { Router } from 'express';
import { GoalsController } from './goals.controller.js';

const router = Router();

// Goals overview
router.get('/', GoalsController.getGoalsData);

// Spending Goals routes
router.get('/spending-goals', GoalsController.getSpendingGoals);
router.get('/spending-goals/:id', GoalsController.getSpendingGoalById);
router.post('/spending-goals', GoalsController.createSpendingGoal);
router.put('/spending-goals/:id', GoalsController.updateSpendingGoal);
router.delete('/spending-goals/:id', GoalsController.deleteSpendingGoal);
router.patch('/spending-goals/:id/progress', GoalsController.updateGoalProgress);
router.patch('/spending-goals/:id/progress-transaction', GoalsController.updateGoalProgressByTransaction);

// Budget routes
router.get('/budgets', GoalsController.getBudgets);
router.get('/budgets/:id', GoalsController.getBudgetById);
router.post('/budgets', GoalsController.createBudget);
router.put('/budgets/:id', GoalsController.updateBudget);
router.delete('/budgets/:id', GoalsController.deleteBudget);
router.patch('/budgets/:id/spending', GoalsController.updateBudgetSpending);

export default router;