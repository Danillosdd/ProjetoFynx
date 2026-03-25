import type {
  UserRanking,
  Badge,
  Achievement,
  LeaderboardEntry,
  RankingData,
  RankingFilters,
  ScoreCalculation
} from './ranking.types.js';

import { database } from '../../database/database.js';

// Helper function to calculate user level based on score
function calculateLevel(score: number): number {
  return Math.floor(score / 500) + 1;
}

// Helper function to calculate league based on score
function calculateLeague(score: number): 'Bronze' | 'Prata' | 'Ouro' | 'Platina' | 'Diamante' {
  if (score >= 10000) return 'Diamante';
  if (score >= 7500) return 'Platina';
  if (score >= 5000) return 'Ouro';
  if (score >= 2500) return 'Prata';
  return 'Bronze';
}

// Helper function to get trend
function getTrend(change: number): 'up' | 'down' | 'same' {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'same';
}

// Helper function to calculate percentile
function calculatePercentile(score: number, allScores: number[]): number {
  const sortedScores = allScores.sort((a, b) => a - b);
  const rank = sortedScores.findIndex(s => s >= score) + 1;
  return Math.round((rank / sortedScores.length) * 100);
}

export class RankingService {
  // Get complete ranking data for a user
  static async getRankingData(userId: number): Promise<RankingData> {
    const db = database;

    // Calculate and update score first to ensure fresh data
    const userScore = await this.calculateScore(userId);

    // Get user data
    const user = await db.get('SELECT name FROM users WHERE id = ?', [userId]);

    // Get global leaderboard to find position
    const globalLeaderboard = await this.getGlobalLeaderboard();
    const userRankEntry = globalLeaderboard.find(u => u.userId === userId.toString());
    const userPosition = userRankEntry ? userRankEntry.position : globalLeaderboard.length + 1;

    // Calculate percentile
    const allScores = globalLeaderboard.map(u => u.score);
    const percentile = calculatePercentile(userScore.totalScore, allScores);

    // Get monthly savings for display
    const monthlyData = await db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expense
      FROM transactions t
      WHERE t.user_id = ? 
        AND strftime('%Y-%m', t.date) = strftime('%Y-%m', 'now')
    `, [userId]) as any;

    const monthlySavings = monthlyData.income - monthlyData.expense;
    const savingsRate = monthlyData.income > 0 ? (monthlySavings / monthlyData.income) * 100 : 0;

    // Get goals completed count
    const goalsCompleted = await db.get(`
      SELECT COUNT(*) as count FROM spending_goals WHERE user_id = ? AND status = 'completed'
    `, [userId]) as any;

    // Get streak info
    const streakInfo = await this.calculateStreak(userId);

    const userRanking: UserRanking = {
      id: userId.toString(),
      userId: userId.toString(),
      username: user?.name || 'User',
      position: userPosition,
      score: userScore.totalScore,
      level: calculateLevel(userScore.totalScore),
      league: userScore.league || 'Bronze', // Use the league from score calculation
      badges: await this.getBadges(userId),
      achievements: await this.getAchievements(userId),
      monthlyScore: userScore.savingsScore, // Using savings score as monthly score proxy
      totalSavings: monthlySavings,
      savingsRate,
      goalsCompleted: goalsCompleted?.count || 0,
      streakDays: streakInfo.currentStreak,
      lastActivity: new Date().toISOString(),
      joinedAt: new Date().toISOString()
    };

    const rankingStats = {
      totalUsers: globalLeaderboard.length,
      averageScore: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) || 0,
      topScore: Math.max(...allScores, 0),
      userPercentile: percentile
    };

    const earnedBadges = await this.getBadges(userId);
    const allBadges = await this.getAvailableBadges();
    const availableBadges = allBadges.filter(b => !earnedBadges.some(eb => eb.id === b.id));

    return {
      userRanking,
      globalLeaderboard: globalLeaderboard, // Return all users
      friendsLeaderboard: [], // Implement friend logic if needed
      categoryLeaderboards: await this.getCategoryLeaderboards(),
      achievements: await this.getAchievements(userId),
      availableBadges,
      contributionData: await this.getContributionData(userId),
      recommendations: await this.getPersonalizedRecommendations(userId),
      rankingStats
    };
  }

  // Handle daily check-in and streak
  static async checkIn(userId: number): Promise<{ currentStreak: number, maxStreak: number, earnedPoints: number }> {
    const db = database;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const scores = await db.get('SELECT current_streak, max_streak, last_checkin, total_score FROM user_scores WHERE user_id = ?', [userId]);
    
    if (!scores) {
      await db.run('INSERT INTO user_scores (user_id, current_streak, max_streak, last_checkin, total_score) VALUES (?, 1, 1, ?, 10)', [userId, today]);
      return { currentStreak: 1, maxStreak: 1, earnedPoints: 10 };
    }

    if (scores.last_checkin === today) {
      return { currentStreak: scores.current_streak, maxStreak: scores.max_streak, earnedPoints: 0 };
    }

    let newStreak = 1;
    let earnedPoints = 10; // Base points for check-in

    if (scores.last_checkin === yesterday) {
      newStreak = scores.current_streak + 1;
      // Bonus points for streaks
      if (newStreak % 7 === 0) earnedPoints += 50;
      if (newStreak % 30 === 0) earnedPoints += 200;
    }

    const newMaxStreak = Math.max(newStreak, scores.max_streak);
    
    await db.run(`
      UPDATE user_scores 
      SET 
        current_streak = ?, 
        max_streak = ?, 
        last_checkin = ?, 
        total_score = total_score + ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [newStreak, newMaxStreak, today, earnedPoints, userId]);

    // Check for streak-based badges
    if (newStreak >= 7) {
      await this.awardBadge(userId, 'badge_fire');
    }

    return { currentStreak: newStreak, maxStreak: newMaxStreak, earnedPoints };
  }

  static async getContributionData(userId: number): Promise<Record<string, number>> {
    const db = database;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dateStr = oneYearAgo.toISOString().split('T')[0];

    const transactions = await db.all(`
      SELECT date(date) as day, COUNT(*) as count 
      FROM transactions 
      WHERE user_id = ? AND date >= ?
      GROUP BY day
    `, [userId, dateStr]) as any[];

    const data: Record<string, number> = {};
    transactions.forEach(t => {
      data[t.day] = t.count;
    });

    return data;
  }

  // Calculate user score based on FYNX formulas
  static async calculateScore(userId: number): Promise<ScoreCalculation & { league: string }> {
    const db = database;

    // 1. Economy Score (Monthly)
    // Formula: ((Net Revenue - Total Expense) / Net Revenue) * 1000
    // Note: "Net Revenue" usually means Income. The formula in prompt: (Receita Líquida - Despesa Total) / Receita Líquida * 1000
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const financials = await db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
      FROM transactions 
      WHERE user_id = ? AND strftime('%Y-%m', date) = ?
    `, [userId, currentMonth]) as any;

    let savingsScore = 0;
    const income = financials.income;
    const expense = financials.expense;

    if (income > 0) {
      // If expense > income, this becomes negative, which is handled in Penalty
      if (income > expense) {
        savingsScore = Math.round(((income - expense) / income) * 1000);
      }
    }

    // 2. Engagement Score (Consistency)
    // +5 pts/day, +20 (3 days), +50 (7 days), +250 (30 days)
    const streakInfo = await this.calculateStreak(userId);
    let consistencyScore = streakInfo.daysWithTransaction * 5; // Base points

    // Bonus points based on current streak (simplified: if you have a streak of X, you likely got the bonuses along the way)
    // However, to be precise with "Monthly Score", we should calculate bonuses earned THIS MONTH.
    // For simplicity in this version, we'll calculate score based on CURRENT streak status.
    if (streakInfo.currentStreak >= 3) consistencyScore += 20;
    if (streakInfo.currentStreak >= 7) consistencyScore += 50;
    if (streakInfo.currentStreak >= 30) consistencyScore += 250;

    // 3. Get Carry Over Score
    const userScoreData = await db.get('SELECT carry_over_score, league FROM user_scores WHERE user_id = ?', [userId]) as any;
    const carryOverScore = userScoreData?.carry_over_score || 0;
    const currentLeague = userScoreData?.league || 'Bronze';

    // 4. Penalty
    // (Expense - Income) * League Multiplier
    let penalty = 0;
    if (expense > income) {
      const deficit = expense - income;
      const multiplier = this.getLeaguePenaltyMultiplier(currentLeague);
      penalty = Math.round(deficit * multiplier);
    }

    // Total Score
    // Ensure score doesn't go below zero (optional, but good for UX)
    let totalScore = (savingsScore + consistencyScore + carryOverScore) - penalty;
    // if (totalScore < 0) totalScore = 0; // Allow negative scores? Prompt doesn't specify, but usually rankings are positive. Let's keep it raw for now.

    // 5. Determine New League
    // We need to compare with all users to determine percentiles.
    // This is expensive to do on every read. Ideally, leagues are updated periodically (daily/weekly).
    // For this implementation, we will calculate the league based on the NEW score relative to others.
    const newLeague = await this.calculateUserLeague(userId, totalScore);

    // Update DB
    const existing = await db.get('SELECT id FROM user_scores WHERE user_id = ?', [userId]);
    if (existing) {
      await db.run(
        'UPDATE user_scores SET total_score = ?, league = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        [totalScore, newLeague, userId]
      );
    } else {
      await db.run(
        'INSERT INTO user_scores (user_id, total_score, league, carry_over_score) VALUES (?, ?, ?, ?)',
        [userId, totalScore, newLeague, 0]
      );
    }

    return {
      savingsScore,
      goalsScore: 0, // Not in the main formula provided in prompt, but part of original code
      consistencyScore,
      bonusScore: carryOverScore,
      totalScore,
      league: newLeague,
      breakdown: [
        { category: 'Economia', points: savingsScore, description: 'Baseado na % de poupança' },
        { category: 'Engajamento', points: consistencyScore, description: `${streakInfo.currentStreak} dias de sequência` },
        { category: 'Histórico', points: carryOverScore, description: 'Pontos de temporadas anteriores' },
        { category: 'Penalidade', points: -penalty, description: expense > income ? 'Gastos excederam receitas' : 'Nenhuma penalidade' }
      ]
    };
  }

  private static getLeaguePenaltyMultiplier(league: string): number {
    switch (league) {
      case 'Bronze': return 1;
      case 'Prata': return 1.5;
      case 'Ouro': return 2;
      case 'Platina': return 3;
      case 'Diamante': return 5;
      default: return 1;
    }
  }

  private static async calculateStreak(userId: number): Promise<{ currentStreak: number, daysWithTransaction: number }> {
    const db = database;
    const scoreData = await db.get('SELECT current_streak, last_checkin FROM user_scores WHERE user_id = ?', [userId]);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const txCount = await db.get(`
      SELECT COUNT(DISTINCT date(date)) as count 
      FROM transactions 
      WHERE user_id = ? AND date LIKE ?
    `, [userId, `${currentMonth}%`]);

    return { 
      currentStreak: scoreData?.current_streak || 0, 
      daysWithTransaction: txCount?.count || 0 
    };
  }

  private static async calculateUserLeague(userId: number, score: number): Promise<string> {
    const db = database;

    // Use a count query to find the rank more efficiently
    const rankResult = await db.get('SELECT COUNT(*) + 1 as rank FROM user_scores WHERE total_score > ?', [score]);
    const totalResult = await db.get('SELECT COUNT(*) as total FROM user_scores');
    
    const myRank = rankResult.rank;
    const totalUsers = Math.max(1, totalResult.total);
    const percentile = (myRank / totalUsers) * 100;

    if (percentile <= 1) return 'Diamante';
    if (percentile <= 5) return 'Platina';
    if (percentile <= 20) return 'Ouro';
    if (percentile <= 50) return 'Prata';
    return 'Bronze';
  }

  static async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    const db = database;

    // Join users with user_scores
    const leaderboard = await db.all(`
      SELECT 
        u.id,
        u.name as username,
        COALESCE(us.total_score, 0) as total_score,
        COALESCE(us.league, 'Bronze') as league
      FROM users u
      LEFT JOIN user_scores us ON u.id = us.user_id
      ORDER BY total_score DESC
    `, []) as any[];

    return leaderboard.map((user, index) => ({
      position: index + 1,
      userId: user.id.toString(),
      username: user.username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      score: user.total_score,
      level: calculateLevel(user.total_score),
      league: (user.league as 'Bronze' | 'Prata' | 'Ouro' | 'Platina' | 'Diamante') || 'Bronze',
      change: 0, // Needs history table for this
      trend: 'same'
    }));
  }

  // Helper stubs for compatibility
  static async getFriendsLeaderboard(userId: number) { return []; }
  static async getCategoryLeaderboards() {
    return { savings: [], goals: [], consistency: [] };
  }
  static async getAchievements(userId: number): Promise<Achievement[]> {
    const db = database;
    const achievements: Achievement[] = [];

    // 1. Primeira Transação
    const txCount = await db.get('SELECT COUNT(*) as count FROM transactions WHERE user_id = ?', [userId]) as any;
    achievements.push({
      id: 'first_tx',
      title: 'Primeiros Passos',
      description: 'Realize sua primeira transação',
      progress: txCount.count,
      target: 1,
      completed: txCount.count >= 1,
      icon: 'footprints',
      category: 'spending'
    });

    // 2. Economizador (Total Savings > 1000)
    const financials = await db.get(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as savings
      FROM transactions WHERE user_id = ?
    `, [userId]) as any;
    const savings = financials.savings;
    achievements.push({
      id: 'saver_1k',
      title: 'Poupador Iniciante',
      description: 'Acumule R$ 1.000 em economia',
      progress: Math.max(0, savings),
      target: 1000,
      completed: savings >= 1000,
      icon: 'piggy-bank',
      category: 'savings'
    });

    // 3. Disciplinado (Streak > 7)
    const streakInfo = await this.calculateStreak(userId);
    achievements.push({
      id: 'streak_7',
      title: 'Consistência',
      description: 'Mantenha uma sequência de 7 dias',
      progress: streakInfo.currentStreak,
      target: 7,
      completed: streakInfo.currentStreak >= 7,
      icon: 'flame',
      category: 'streak'
    });

    return achievements;
  }

  static async getBadges(userId: number): Promise<Badge[]> {
    const db = database;
    const userBadges = await db.all(`
      SELECT b.*, ub.earned_at 
      FROM badges b
      JOIN user_badges ub ON b.id = ub.badge_id
      WHERE ub.user_id = ?
    `, [userId]);

    return userBadges.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      category: b.category as any,
      unlockedAt: b.earned_at
    }));
  }

  static async awardBadge(userId: number, badgeId: string): Promise<boolean> {
    const db = database;
    try {
      await db.run(
        'INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badgeId]
      );
      return true;
    } catch (err) {
      console.error('Error awarding badge:', err);
      return false;
    }
  }

  static async getAvailableBadges(): Promise<Badge[]> {
    const db = database;
    const badges = await db.all('SELECT * FROM badges ORDER BY category');
    return badges.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      category: b.category as any,
      unlockedAt: ''
    }));
  }

  static async getPersonalizedRecommendations(userId: number): Promise<string[]> {
    const db = database;
    const recs: string[] = [];

    // Check for high expense categories
    const highExpenses = await db.all(`
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE user_id = ? AND type = 'expense'
      GROUP BY category 
      ORDER BY total DESC 
      LIMIT 1
    `, [userId]);

    if (highExpenses.length > 0) {
      recs.push(`Seu maior gasto este mês é em "${highExpenses[0].category}". Tente reduzir 10% nesta categoria para ganhar a insignia de "Mestre da Economia"!`);
    }

    // Check for streak reset risk
    const scoreData = await db.get('SELECT current_streak, last_checkin FROM user_scores WHERE user_id = ?', [userId]);
    if (scoreData && scoreData.current_streak > 0) {
      const today = new Date().toISOString().slice(0, 10);
      if (scoreData.last_checkin !== today) {
        recs.push(`Sua sequência de ${scoreData.current_streak} dias está em risco! Faça seu check-in agora para mantê-la.`);
      }
    } else {
      recs.push('Comece uma sequência de check-ins para subir de nível e ganhar pontos extras!');
    }

    // Check for goals
    const activeGoals = await db.get('SELECT COUNT(*) as count FROM spending_goals WHERE user_id = ? AND status = "active"', [userId]);
    if (activeGoals.count === 0) {
      recs.push('Você não tem metas ativas. Criar uma meta de economia ajuda você a progredir mais rápido no ranking.');
    }

    return recs;
  }

  // Get user ranking by ID
  static async getUserRanking(userId: number): Promise<UserRanking | null> {
    const data = await this.getRankingData(userId);
    return data.userRanking;
  }

  // Update user score (stub)
  static async updateUserScore(userId: number, scoreData: Partial<ScoreCalculation>): Promise<UserRanking | null> {
    // In a real implementation, this would update the score in the DB
    // For now, we just recalculate and return
    return await this.getUserRanking(userId);
  }
  // Reset Season Logic
  static async resetSeason(): Promise<{ message: string, usersUpdated: number }> {
    const db = database;

    try {
      // 1. Update all users: carry_over = 20% of total, total = carry_over
      // We use a transaction to ensure atomicity if possible, but SQLite run is auto-commit usually.
      // We'll do a single bulk update query for efficiency.

      const result = await db.run(`
        UPDATE user_scores 
        SET 
          carry_over_score = CAST(total_score * 0.2 AS INTEGER),
          total_score = CAST(total_score * 0.2 AS INTEGER),
          updated_at = CURRENT_TIMESTAMP
      `);

      // 2. Note: We do NOT reset leagues here because leagues are based on percentiles.
      // Since everyone's score is reduced by the same factor (0.2), the relative order (ranking) remains identical.
      // Therefore, users stay in the same league until they start earning new points.

      return {
        message: 'Season reset successfully. All scores reduced to 20% (carry-over).',
        usersUpdated: result.changes
      };
    } catch (error) {
      throw error;
    }
  }
}
