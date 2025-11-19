import { Router } from 'express';
import { RankingController } from './ranking.controller.js';

const router = Router();

// GET /api/v1/ranking - Get complete ranking data
router.get('/', RankingController.getRankingData);

// GET /api/v1/ranking/leaderboard/global - Get global leaderboard
router.get('/leaderboard/global', RankingController.getGlobalLeaderboard);

// GET /api/v1/ranking/leaderboard/friends - Get friends leaderboard
router.get('/leaderboard/friends', RankingController.getFriendsLeaderboard);

// GET /api/v1/ranking/leaderboard/categories - Get category leaderboards
router.get('/leaderboard/categories', RankingController.getCategoryLeaderboards);

// GET /api/v1/ranking/user/:userId - Get specific user ranking
router.get('/user/:userId', RankingController.getUserRanking);

// GET /api/v1/ranking/score/:userId - Calculate user score
router.get('/score/:userId', RankingController.calculateUserScore);

// PUT /api/v1/ranking/score/:userId - Update user score
router.put('/score/:userId', RankingController.updateUserScore);

// GET /api/v1/ranking/achievements/:userId - Get user achievements
router.get('/achievements/:userId', RankingController.getUserAchievements);

// GET /api/v1/ranking/badges/:userId - Get user badges
router.get('/badges/:userId', RankingController.getUserBadges);

// POST /api/v1/ranking/reset-season - Reset season scores
router.post('/reset-season', RankingController.resetSeason);

export default router;