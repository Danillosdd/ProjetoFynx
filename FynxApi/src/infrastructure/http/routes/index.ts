import { Router } from 'express';
import dashboardRoutes from '../../../domains/analytics/dashboard/dashboard.routes.js';
import goalsRoutes from '../../../domains/financial/goals/goals.routes.js';
import transactionsRoutes from '../../../domains/financial/transactions/transactions.routes.js';
import rankingRoutes from '../../../domains/gamification/ranking/ranking.routes.js';
import authRoutes from '../../../domains/identity/auth/auth.routes.js';
import customCategoriesRoutes from '../../../domains/financial/custom-categories/customCategories.routes.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Rotas Públicas
router.use('/auth', authRoutes);

// Rotas Protegidas
router.use('/dashboard', authenticateToken, dashboardRoutes);
router.use('/goals', authenticateToken, goalsRoutes);
router.use('/transactions', authenticateToken, transactionsRoutes);
router.use('/ranking', authenticateToken, rankingRoutes);
router.use('/categories/custom', authenticateToken, customCategoriesRoutes);

export default router;