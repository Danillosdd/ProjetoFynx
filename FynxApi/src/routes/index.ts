import { Router } from 'express';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import goalsRoutes from '../modules/goals/goals.routes.js';
import rankingRoutes from '../modules/ranking/ranking.routes.js';
import transactionsRoutes from '../modules/transactions/transactions.routes.js';
import spendingLimitsRoutes from '../modules/spending-limits/spending-limits.routes.js';
import customCategoriesRoutes from '../modules/custom-categories/customCategories.routes.js';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/goals', goalsRoutes);
router.use('/ranking', rankingRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/spending-limits', spendingLimitsRoutes);
router.use('/categories/custom', customCategoriesRoutes);

export default router;