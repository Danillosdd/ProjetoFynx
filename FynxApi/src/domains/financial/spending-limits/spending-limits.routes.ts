import { Router } from 'express';
import { SpendingLimitsController } from './spending-limits.controller.js';

const router = Router();

// Get all spending limits
router.get('/', SpendingLimitsController.getSpendingLimits);

// Get spending limit by ID
router.get('/:id', SpendingLimitsController.getSpendingLimitById);

// Get spending limit by category
router.get('/category/:category', SpendingLimitsController.getSpendingLimitByCategory);

// Create new spending limit
router.post('/', SpendingLimitsController.createSpendingLimit);

// Update spending limit
router.put('/:id', SpendingLimitsController.updateSpendingLimit);

// Update spending limit progress (add expense)
router.patch('/:id/progress', SpendingLimitsController.updateSpendingLimitProgress);

// Delete spending limit
router.delete('/:id', SpendingLimitsController.deleteSpendingLimit);

// Get all categories
router.get('/categories/list', SpendingLimitsController.getCategories);

export default router;