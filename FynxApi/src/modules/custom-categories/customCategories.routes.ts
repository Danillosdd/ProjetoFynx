import { Router } from 'express';
import { CustomCategoriesController } from './customCategories.controller.js';

const router = Router();

// GET /categories/custom
router.get('/', CustomCategoriesController.list);

// POST /categories/custom
router.post('/', CustomCategoriesController.create);

// PUT /categories/custom/:id
router.put('/:id', CustomCategoriesController.update);

// DELETE /categories/custom/:id  -> attempts delete, returns 409 with counts if in use
router.delete('/:id', CustomCategoriesController.remove);

// POST /categories/custom/:id/archive -> archive (soft delete)
router.post('/:id/archive', CustomCategoriesController.archive);

export default router;
