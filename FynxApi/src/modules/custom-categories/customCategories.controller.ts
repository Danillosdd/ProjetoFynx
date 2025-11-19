import type { Request, Response } from 'express';
import { CustomCategoriesService } from './customCategories.service.js';

export class CustomCategoriesController {
  static async list(req: Request, res: Response) {
    try {
      const userId = parseInt(req.query.userId as string) || 1;
      const cats = await CustomCategoriesService.getCustomCategories(userId);
      res.status(200).json({ success: true, data: cats });
    } catch (error) {
      console.error('Error listing custom categories:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const payload = req.body;
      const userId = parseInt(req.body.userId) || (parseInt(req.query.userId as string) || 1);
      const cat = await CustomCategoriesService.createCustomCategory({ name: payload.name, type: payload.type, userId });
      res.status(201).json(cat);
    } catch (error) {
      console.error('Error creating custom category:', error);
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Invalid input' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, error: 'ID é obrigatório' });
      const payload = req.body;
      const updated = await CustomCategoriesService.updateCustomCategory(id, payload);
      if (!updated) return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
      res.status(200).json(updated);
    } catch (error) {
      console.error('Error updating custom category:', error);
      res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Invalid input' });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, error: 'ID é obrigatório' });
      // get category to know name and user
      const all = await CustomCategoriesService.getCustomCategories();
      const catRow = all.find(c => c.id === id) || null;
      if (!catRow) return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
      const counts = await CustomCategoriesService.getUsageCountsByName(catRow.name, parseInt(catRow.userId));
      if (counts.transactions > 0 || counts.goals > 0) {
        // Inform caller that category is in use
        return res.status(409).json({ success: false, message: 'Categoria em uso', counts });
      }
      const deleted = await CustomCategoriesService.deleteCategoryIfUnused(id);
      if (!deleted) return res.status(500).json({ success: false, error: 'Não foi possível deletar a categoria' });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting custom category:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  static async archive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, error: 'ID é obrigatório' });
      const archived = await CustomCategoriesService.archiveCategory(id);
      if (!archived) return res.status(404).json({ success: false, error: 'Categoria não encontrada' });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error archiving custom category:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

export default CustomCategoriesController;
