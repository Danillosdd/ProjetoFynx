import type { Request, Response } from 'express';
import { SpendingLimitsService } from './spending-limits.service.js';

export class SpendingLimitsController {
  // Get all spending limits
  static async getSpendingLimits(req: Request, res: Response) {
    try {
      const spendingLimits = await SpendingLimitsService.getSpendingLimits();
      res.status(200).json(spendingLimits);
    } catch (error) {
      console.error('Error fetching spending limits:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get spending limit by ID
  static async getSpendingLimitById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
      }
      const spendingLimit = await SpendingLimitsService.getSpendingLimitById(parseInt(id));
      
      if (!spendingLimit) {
        return res.status(404).json({ error: 'Spending limit not found' });
      }

      res.status(200).json(spendingLimit);
    } catch (error) {
      console.error('Error fetching spending limit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get spending limit by category
  static async getSpendingLimitByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      if (!category) {
        return res.status(400).json({ error: 'Category parameter is required' });
      }
      const spendingLimit = await SpendingLimitsService.getSpendingLimitByCategory(category);
      
      if (!spendingLimit) {
        return res.status(404).json({ error: 'Spending limit not found for this category' });
      }

      res.status(200).json(spendingLimit);
    } catch (error) {
      console.error('Error fetching spending limit by category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create new spending limit
  static async createSpendingLimit(req: Request, res: Response) {
    try {
      const spendingLimit = await SpendingLimitsService.createSpendingLimit(req.body);
      res.status(201).json(spendingLimit);
    } catch (error) {
      console.error('Error creating spending limit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update spending limit
  static async updateSpendingLimit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
      }
      const spendingLimit = await SpendingLimitsService.updateSpendingLimit(parseInt(id), req.body);
      
      if (!spendingLimit) {
        return res.status(404).json({ error: 'Spending limit not found' });
      }

      res.status(200).json(spendingLimit);
    } catch (error) {
      console.error('Error updating spending limit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update spending limit progress
  static async updateSpendingLimitProgress(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
      }
      const spendingLimit = await SpendingLimitsService.updateSpendingLimitProgress(parseInt(id), req.body);
      
      if (!spendingLimit) {
        return res.status(404).json({ error: 'Spending limit not found' });
      }

      res.status(200).json(spendingLimit);
    } catch (error) {
      console.error('Error updating spending limit progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete spending limit
  static async deleteSpendingLimit(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
      }
      const success = await SpendingLimitsService.deleteSpendingLimit(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: 'Spending limit not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting spending limit:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all categories
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await SpendingLimitsService.getCategories();
      res.status(200).json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}