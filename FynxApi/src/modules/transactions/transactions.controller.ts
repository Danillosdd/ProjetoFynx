import type { Request, Response } from 'express';
import { TransactionsService } from './transactions.service.js';
import { z } from 'zod';
import type { AuthRequest } from '../../middleware/auth.middleware.js';
import type { BulkTransactionOperation, TransactionFilters, UpdateTransactionRequest, CreateTransactionRequest } from './transactions.types.js';

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
  type: z.enum(['income', 'expense']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'other']).default('credit_card'),
  spendingGoalId: z.number().optional(),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  type: z.enum(['income', 'expense']).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  paymentMethod: z.enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'pix', 'other']).optional(),
  spendingGoalId: z.number().optional(),
});

export class TransactionsController {
  static async getTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const filters: TransactionFilters = {};
      if (req.query.type) filters.type = req.query.type as 'income' | 'expense' | 'all';
      if (req.query.category) filters.category = req.query.category as string;
      if (req.query.startDate) filters.dateFrom = req.query.startDate as string;
      if (req.query.endDate) filters.dateTo = req.query.endDate as string;

      // Pagination params are separate arguments to getTransactions
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const transactions = await TransactionsService.getTransactions(userId, filters, page, limit);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTransactionById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const transaction = await TransactionsService.getTransactionById(id, req.user!.id);

      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      if (transaction.userId !== req.user!.id.toString()) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      res.json(transaction);
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

      const transaction = await TransactionsService.createTransaction(serviceData, userId);

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

      const data = updateTransactionSchema.parse(req.body);

      const existing = await TransactionsService.getTransactionById(id, req.user!.id);
      if (!existing) return res.status(404).json({ error: 'Transação não encontrada' });

      const serviceData: UpdateTransactionRequest = {};
      if (data.amount !== undefined) serviceData.amount = data.amount;
      if (data.description !== undefined) serviceData.description = data.description;
      if (data.category !== undefined) serviceData.category = data.category;
      if (data.type !== undefined) serviceData.type = data.type;
      if (data.date !== undefined) serviceData.date = data.date;
      if (data.paymentMethod !== undefined) serviceData.paymentMethod = data.paymentMethod;

      const transaction = await TransactionsService.updateTransaction(id, serviceData, req.user!.id);
      res.json(transaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteTransaction(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const existing = await TransactionsService.getTransactionById(id, req.user!.id);
      if (!existing) return res.status(404).json({ error: 'Transação não encontrada' });

      await TransactionsService.deleteTransaction(id, req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async bulkOperation(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { operations } = req.body;

      if (Array.isArray(operations)) {
        const results = [];
        for (const op of operations) {
          const safeOp: BulkTransactionOperation = {
            operation: op.operation,
            transactionIds: op.transactionIds,
            updateData: op.updateData
          };
          const result = await TransactionsService.bulkOperation(safeOp, userId);
          results.push(result);
        }
        res.json(results);
      } else {
        const result = await TransactionsService.bulkOperation(operations as BulkTransactionOperation, userId);
        res.json(result);
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await TransactionsService.getCategories();
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