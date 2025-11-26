import { Router } from 'express';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import goalsRoutes from '../modules/goals/goals.routes.js';
import transactionsRoutes from '../modules/transactions/transactions.routes.js';
import rankingRoutes from '../modules/ranking/ranking.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import customCategoriesRoutes from '../modules/custom-categories/customCategories.routes.js';
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