export interface UserRanking {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  position: number;
  score: number;
  level: number;
  league: string;
  badges: Badge[];
  achievements: Achievement[];
  monthlyScore: number;
  totalSavings: number;
  savingsRate: number;
  goalsCompleted: number;
  streakDays: number;
  lastActivity: string;
  joinedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  earnedAt?: string;
  unlockedAt?: string;
  category: 'savings' | 'goals' | 'streak' | 'spending' | 'special';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: string;
  category?: 'savings' | 'goals' | 'streak' | 'spending' | 'social';
  reward?: {
    points: number;
    badge?: Badge;
  };
}

export interface LeaderboardEntry {
  position: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  level: number;
  league: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  change: number; // Position change from last period
  trend: 'up' | 'down' | 'same';
}

export interface RankingData {
  userRanking: UserRanking;
  globalLeaderboard: LeaderboardEntry[];
  friendsLeaderboard: LeaderboardEntry[];
  categoryLeaderboards: {
    savings: LeaderboardEntry[];
    goals: LeaderboardEntry[];
    consistency: LeaderboardEntry[];
  };
  achievements: Achievement[];
  availableBadges: Badge[];
  contributionData?: Record<string, number> | number[][];
  rankingStats: {
    totalUsers: number;
    averageScore: number;
    topScore: number;
    userPercentile: number;
  };
}

export interface RankingFilters {
  period: 'weekly' | 'monthly' | 'yearly' | 'all-time';
  category: 'overall' | 'savings' | 'goals' | 'consistency';
  region?: string;
  friends?: boolean;
}

export interface ScoreCalculation {
  savingsScore: number;
  goalsScore: number;
  consistencyScore: number;
  bonusScore: number;
  totalScore: number;
  breakdown: {
    category: string;
    points: number;
    description: string;
  }[];
}