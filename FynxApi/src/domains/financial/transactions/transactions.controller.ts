import type { Request, Response } from 'express';
import { TransactionsService } from './transactions.service.js';
import { z } from 'zod';
import type { AuthRequest } from '../../../infrastructure/http/middleware/auth.middleware.js';
import type { BulkTransactionOperation, TransactionFilters, UpdateTransactionRequest, CreateTransactionRequest } from './transactions.types.js';
import { createTransactionUseCase, deleteTransactionUseCase, transactionRepository, categoryRepository } from '../../../infrastructure/container.js';

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'other']).default('credit_card'),
  spendingGoalId: z.union([z.string(), z.number()]).optional(),
  savingGoalId: z.union([z.string(), z.number()]).optional(),
});

// ... (schema updateTransactionSchema remains the same)

export class TransactionsController {
  static async getTransactionById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const transaction = await TransactionsService.getTransactionById(id, req.user!.id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transacao nao encontrada' });
      }

      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const filters: TransactionFilters = {};
      if (req.query.type) filters.type = req.query.type as 'income' | 'expense' | 'all';
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.startDate) filters.dateFrom = req.query.startDate as string;
      if (req.query.endDate) filters.dateTo = req.query.endDate as string;

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      // Usando o Repositório diretamente para leitura (CQRS Lite)
      const result = await transactionRepository.findAll(userId, filters, page, limit);
      
      // Para manter compatibilidade com o retorno esperado pelo frontend
      // (que espera TransactionSummary e stats que o Repositório ainda não retorna completo)
      // usamos o serviço apenas para os metadados por enquanto.
      const legacyData = await TransactionsService.getTransactions(userId, filters, page, limit);
      
      res.json({
        transactions: result.transactions,
        totalCount: result.total,
        summary: legacyData.summary,
        stats: legacyData.stats,
        categories: legacyData.categories,
        currentPage: page,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createTransaction(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = createTransactionSchema.parse(req.body);

      const serviceData: CreateTransactionRequest = {
        amount: data.amount,
        description: data.description,
        category: data.category,
        type: data.type,
        date: data.date,
        paymentMethod: data.paymentMethod,
      };

      if (data.spendingGoalId !== undefined) {
        serviceData.spendingGoalId = data.spendingGoalId.toString();
      }
      if (data.savingGoalId !== undefined) {
        serviceData.savingGoalId = data.savingGoalId.toString();
      }

      // USANDO O NOVO USE CASE (DDD + Eventos)
      const transaction = await createTransactionUseCase.execute(serviceData, userId);

      res.status(201).json(transaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async updateTransaction(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const transaction = await TransactionsService.updateTransaction(id, req.body, req.user!.id);
      if (!transaction) {
        return res.status(404).json({ error: 'Transacao nao encontrada' });
      }

      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async bulkOperation(req: AuthRequest, res: Response) {
    try {
      const operation = req.body as BulkTransactionOperation;
      const result = await TransactionsService.bulkOperation(operation, req.user!.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteTransaction(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      // USANDO O NOVO USE CASE
      const success = await deleteTransactionUseCase.execute(id, req.user!.id);
      
      if (!success) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await categoryRepository.findAll();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactionsSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const summary = await TransactionsService.getTransactionsSummary(userId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactionsStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await TransactionsService.getTransactionsStats(userId);
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
