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
function calculateLeague(score: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
  if (score >= 10000) return 'diamond';
  if (score >= 7500) return 'platinum';
  if (score >= 5000) return 'gold';
  if (score >= 2500) return 'silver';
  return 'bronze';
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
      globalLeaderboard: globalLeaderboard.slice(0, 50), // Limit to top 50
      friendsLeaderboard: [], // Implement friend logic if needed
      categoryLeaderboards: await this.getCategoryLeaderboards(),
      achievements: await this.getAchievements(userId),
      availableBadges,
      contributionData: await this.getContributionData(userId),
      rankingStats
    };
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
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get all unique transaction dates for this user
    const dates = await db.all(`
      SELECT DISTINCT date(date) as tx_date 
      FROM transactions 
      WHERE user_id = ? 
      ORDER BY date DESC
    `, [userId]) as any[];

    if (!dates || dates.length === 0) {
      return { currentStreak: 0, daysWithTransaction: 0 };
    }

    // Calculate current streak
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Check if last transaction was today or yesterday to keep streak alive
    const lastTxDate = dates[0].tx_date;
    if (lastTxDate !== today && lastTxDate !== yesterday) {
      streak = 0;
    } else {
      // Count consecutive days
      // This is a simple check. For robust streak, we need to iterate.
      let currentDate = new Date(lastTxDate);

      for (let i = 0; i < dates.length; i++) {
        const txDate = new Date(dates[i].tx_date);
        const diffTime = Math.abs(currentDate.getTime() - txDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (i === 0) {
          streak = 1;
        } else if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
        currentDate = txDate;
      }
    }

    // Count days with transaction in current month
    const daysInMonth = dates.filter(d => d.tx_date.startsWith(currentMonth)).length;

    return { currentStreak: streak, daysWithTransaction: daysInMonth };
  }

  private static async calculateUserLeague(userId: number, score: number): Promise<string> {
    const db = database;

    // Get all scores to determine percentiles
    // We include the current user's NEW score in this calculation virtually
    const otherScores = await db.all('SELECT total_score FROM user_scores WHERE user_id != ?', [userId]) as any[];
    const allScores = [...otherScores.map(s => s.total_score), score].sort((a, b) => b - a); // Descending

    const totalUsers = allScores.length;
    const myRank = allScores.indexOf(score) + 1;
    const percentile = (myRank / totalUsers) * 100; // Top X% (e.g. Rank 1 of 100 is 1%)

    // Logic:
    // Diamante: Top 1%
    // Platina: Próximos 4% (Top 5%)
    // Ouro: Próximos 15% (Top 20%)
    // Prata: Próximos 30% (Top 50%)
    // Bronze: Restante (Bottom 50%)

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
        us.total_score,
        us.league
      FROM users u
      JOIN user_scores us ON u.id = us.user_id
      ORDER BY us.total_score DESC
      LIMIT 50
    `, []) as any[];

    return leaderboard.map((user, index) => ({
      position: index + 1,
      userId: user.id.toString(),
      username: user.username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
      score: user.total_score,
      level: calculateLevel(user.total_score),
      league: user.league || 'Bronze',
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
    const achievements = await this.getAchievements(userId);
    const badges: Badge[] = [];

    if (achievements.find(a => a.id === 'first_tx' && a.completed)) {
      badges.push({
        id: 'badge_novice',
        name: 'Novato',
        description: 'Começou sua jornada financeira',
        icon: 'star',
        category: 'special',
        unlockedAt: new Date().toISOString() // In real app, store this date
      });
    }

    if (achievements.find(a => a.id === 'saver_1k' && a.completed)) {
      badges.push({
        id: 'badge_saver',
        name: 'Cofrinho Cheio',
        description: 'Economizou seus primeiros R$ 1.000',
        icon: 'piggy-bank',
        category: 'savings',
        unlockedAt: new Date().toISOString()
      });
    }

    if (achievements.find(a => a.id === 'streak_7' && a.completed)) {
      badges.push({
        id: 'badge_fire',
        name: 'On Fire',
        description: 'Sequência de 7 dias de atividade',
        icon: 'flame',
        category: 'streak',
        unlockedAt: new Date().toISOString()
      });
    }

    return badges;
  }

  static async getAvailableBadges(): Promise<Badge[]> {
    return [
      {
        id: 'badge_novice',
        name: 'Novato',
        description: 'Começou sua jornada financeira',
        icon: 'star',
        category: 'special',
        unlockedAt: ''
      },
      {
        id: 'badge_saver',
        name: 'Cofrinho Cheio',
        description: 'Economizou seus primeiros R$ 1.000',
        icon: 'piggy-bank',
        category: 'savings',
        unlockedAt: ''
      },
      {
        id: 'badge_fire',
        name: 'On Fire',
        description: 'Sequência de 7 dias de atividade',
        icon: 'flame',
        category: 'streak',
        unlockedAt: ''
      },
      {
        id: 'badge_investor',
        name: 'Investidor',
        description: 'Crie sua primeira meta de investimento',
        icon: 'trending-up',
        category: 'goals',
        unlockedAt: ''
      }
    ];
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
