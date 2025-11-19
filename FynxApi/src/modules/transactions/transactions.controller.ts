import type { Request, Response } from 'express';
import { TransactionsService } from './transactions.service.js';
import type { TransactionFilters, CreateTransactionRequest, UpdateTransactionRequest, BulkTransactionOperation } from './transactions.types.js';

export class TransactionsController {
  // GET /api/v1/transactions - Get all transactions with filters and pagination
  static async getTransactions(req: Request, res: Response) {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Parâmetros de ordenação
      const sortBy = req.query.sortBy as string || 'date';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';

      const filters: TransactionFilters = {
        ...(req.query.type && { type: req.query.type as 'income' | 'expense' | 'all' }),
        ...(req.query.category && { category: req.query.category as string }),
        ...(req.query.subcategory && { subcategory: req.query.subcategory as string }),
        ...(req.query.paymentMethod && { paymentMethod: req.query.paymentMethod as string }),
        ...(req.query.dateFrom && { dateFrom: req.query.dateFrom as string }),
        ...(req.query.dateTo && { dateTo: req.query.dateTo as string }),
        ...(req.query.amountMin && { amountMin: parseFloat(req.query.amountMin as string) }),
        ...(req.query.amountMax && { amountMax: parseFloat(req.query.amountMax as string) }),
        ...(req.query.search && { search: req.query.search as string }),
        ...(req.query.tags && { tags: (req.query.tags as string).split(',') })
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof TransactionFilters] === undefined) {
          delete filters[key as keyof TransactionFilters];
        }
      });

      const transactionsData = await TransactionsService.getTransactions(userId, filters, page, limit, sortBy, sortOrder);

      // Formato compatível com Refine
      res.status(200).json({
        data: transactionsData.transactions || [],
        total: transactionsData.totalCount || 0,
        success: true
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar transações',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/transactions/:id - Get transaction by ID
  static async getTransactionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(req.query.userId as string) || 1;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação é obrigatório'
        });
      }

      const transaction = await TransactionsService.getTransactionById(id, userId);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }

      // Formato compatível com Refine
      res.status(200).json({
        data: transaction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar transação',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/v1/transactions - Create new transaction
  static async createTransaction(req: Request, res: Response) {
    try {
      // Refine sends data in req.body.values, but direct API calls send it in req.body
      const bodyData = req.body.values || req.body;
      const userId = parseInt(bodyData.userId || req.body.userId) || 1;
      const transactionData: CreateTransactionRequest = bodyData;

      const newTransaction = await TransactionsService.createTransaction(transactionData, userId);

      // Formato compatível com Refine
      res.status(201).json({
        data: newTransaction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar transação',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/v1/transactions/:id - Update transaction
  static async updateTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(req.body.userId) || 1;
      const updateData: UpdateTransactionRequest = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação é obrigatório'
        });
      }

      const updatedTransaction = await TransactionsService.updateTransaction(id, updateData, userId);

      if (!updatedTransaction) {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }

      // Formato compatível com Refine
      res.status(200).json({
        data: updatedTransaction
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar transação',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/v1/transactions/:id - Delete transaction
  static async deleteTransaction(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = parseInt(req.query.userId as string) || 1;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID da transação é obrigatório'
        });
      }

      const deleted = await TransactionsService.deleteTransaction(id, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Transação não encontrada'
        });
      }

      // Formato compatível com Refine
      res.status(200).json({
        data: { id }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao deletar transação',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/v1/transactions/bulk - Bulk operations
  static async bulkOperation(req: Request, res: Response) {
    try {
      const userId = parseInt(req.body.userId) || 1;
      const operation: BulkTransactionOperation = req.body;

      const result = await TransactionsService.bulkOperation(operation, userId);

      res.status(200).json({
        success: true,
        data: result,
        message: `Operação em lote concluída: ${result.success} sucessos, ${result.failed} falhas`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao executar operação em lote',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/transactions/categories - Get transaction categories
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await TransactionsService.getCategories();

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar categorias',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/transactions/summary - Get transactions summary
  static async getTransactionsSummary(req: Request, res: Response) {
    try {
      const userId = parseInt(req.query.userId as string) || 1;

      const summary = await TransactionsService.getTransactionsSummary(userId);

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar resumo das transações',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/v1/transactions/stats - Get transactions statistics
  static async getTransactionsStats(req: Request, res: Response) {
    try {
      const userId = parseInt(req.query.userId as string) || 1;

      const stats = await TransactionsService.getTransactionsStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas das transações',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}