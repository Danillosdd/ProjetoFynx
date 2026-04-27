// dashboard.routes.ts

/**
 * @file Define as rotas para o módulo de dashboard.
 * @author Douglas Bernardes
 */

import { Router } from 'express';
import * as DashboardController from './dashboard.controller.js';

const router = Router();

// Rota para buscar os dados do dashboard.
router.get('/', DashboardController.getDashboardData);

// Rota específica para overview (compatível com Refine)
router.get('/overview', DashboardController.getOverviewData);

// Rota para adicionar uma nova transação.
router.post('/transactions', DashboardController.addTransaction);

// Rota para buscar o histórico de transações.
router.get('/transactions', DashboardController.getTransactionHistory);

export default router;