// dashboard.controller.ts

/**
 * @file Define os controladores para o módulo de dashboard.
 * @author Douglas Bernardes
 */

import type { Request, Response } from 'express';
import * as DashboardService from './dashboard.service.js';
import { TransactionsService } from '../../financial/transactions/transactions.service.js';
import type { AuthRequest } from '../../../infrastructure/http/middleware/auth.middleware.js';

/**
 * Controlador para buscar os dados do dashboard.
 * @param {Request} req - O objeto de requisição.
 * @param {Response} res - O objeto de resposta.
 */
export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = await DashboardService.getDashboardData(userId);
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro no getDashboardData:', error);
    res.status(500).json({
      message: "Erro ao buscar dados do dashboard",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Controlador para buscar apenas os dados de overview (compatível com Refine).
 * @param {Request} req - O objeto de requisição.
 * @param {Response} res - O objeto de resposta.
 */
export const getOverviewData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const data = await DashboardService.getDashboardData(userId);

    // Retorna apenas os dados de overview no formato compatível com Refine
    res.status(200).json({
      data: data.overview || [],
      total: data.overview?.length || 0
    });
  } catch (error) {
    console.error('Erro no getOverviewData:', error);
    res.status(500).json({
      message: "Erro ao buscar dados de overview",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Controlador para adicionar uma nova transação.
 * @param {Request} req - O objeto de requisição.
 * @param {Response} res - O objeto de resposta.
 */
export const addTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const newTransaction = await TransactionsService.createTransaction(req.body, userId);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Erro no addTransaction:', error);
    res.status(500).json({
      message: 'Erro ao adicionar transação',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Controlador para buscar o histórico de transações.
 * @param {Request} req - O objeto de requisição.
 * @param {Response} res - O objeto de resposta.
 */
export const getTransactionHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const history = await TransactionsService.getTransactions(userId);
    res.status(200).json(history.transactions);
  } catch (error) {
    console.error('Erro no getTransactionHistory:', error);
    res.status(500).json({
      message: 'Erro ao buscar histórico de transações',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};