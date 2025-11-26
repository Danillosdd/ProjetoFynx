import type { Request, Response } from 'express';
import { RankingService } from './ranking.service.js';
import type { AuthRequest } from '../../middleware/auth.middleware.js';

export class RankingController {
  static async getUserRanking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id; // Pega o ID do token
      const ranking = await RankingService.getUserRanking(userId);
      res.json(ranking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getGlobalLeaderboard(req: Request, res: Response) {
    try {
      const leaderboard = await RankingService.getGlobalLeaderboard();
      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  static async getRankingData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = await RankingService.getRankingData(userId);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getFriendsLeaderboard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const leaderboard = await RankingService.getFriendsLeaderboard(userId);
      res.json(leaderboard);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getCategoryLeaderboards(req: Request, res: Response) {
    try {
      const leaderboards = await RankingService.getCategoryLeaderboards();
      res.json(leaderboards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async calculateUserScore(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'User ID is required' });

      const score = await RankingService.calculateScore(Number(userId));
      res.json(score);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateUserScore(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'User ID is required' });

      const scoreData = req.body;
      const ranking = await RankingService.updateUserScore(Number(userId), scoreData);
      res.json(ranking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserAchievements(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'User ID is required' });

      const achievements = await RankingService.getAchievements(Number(userId));
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserBadges(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      if (!userId) return res.status(400).json({ error: 'User ID is required' });

      const badges = await RankingService.getBadges(Number(userId));
      res.json(badges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async resetSeason(req: AuthRequest, res: Response) {
    try {
      const result = await RankingService.resetSeason();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}