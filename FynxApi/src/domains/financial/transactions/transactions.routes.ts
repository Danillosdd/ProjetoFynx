import { Router } from 'express';
import { TransactionsController } from './transactions.controller.js';

const router = Router();

// GET /api/v1/transactions - Get all transactions with filters and pagination
router.get('/', TransactionsController.getTransactions);

// GET /api/v1/transactions/categories - Get transaction categories
router.get('/categories', TransactionsController.getCategories);

// GET /api/v1/transactions/summary - Get transactions summary
router.get('/summary', TransactionsController.getTransactionsSummary);

// GET /api/v1/transactions/stats - Get transactions statistics
router.get('/stats', TransactionsController.getTransactionsStats);

// GET /api/v1/transactions/:id - Get transaction by ID
router.get('/:id', TransactionsController.getTransactionById);

// POST /api/v1/transactions - Create new transaction
router.post('/', TransactionsController.createTransaction);

// POST /api/v1/transactions/bulk - Bulk operations
router.post('/bulk', TransactionsController.bulkOperation);

// PUT /api/v1/transactions/:id - Update transaction
router.put('/:id', TransactionsController.updateTransaction);

// DELETE /api/v1/transactions/:id - Delete transaction
router.delete('/:id', TransactionsController.deleteTransaction);

export default router;