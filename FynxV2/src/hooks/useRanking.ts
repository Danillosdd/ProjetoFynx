import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';

export interface LeaderboardEntry {
  position: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  level: number;
  league: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  change: number;
  trend: 'up' | 'down' | 'same';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  earnedAt?: string;
  unlockedAt?: string;
  category: string;
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
  category?: string;
  reward?: {
    points: number;
    badge?: Badge;
  };
}

export interface UserRanking {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  position: number;
  score: number;
  level: number;
  league: string; // Added league field
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

export function useRanking() {
  return useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data?: RankingData }>(`/ranking`);
      const empty: RankingData = {
        userRanking: {
          id: '',
          userId: '',
          username: '',
          avatar: undefined,
          position: 0,
          score: 0,
          level: 0,
          league: 'Bronze', // Default
          badges: [],
          achievements: [],
          monthlyScore: 0,
          totalSavings: 0,
          savingsRate: 0,
          goalsCompleted: 0,
          streakDays: 0,
          lastActivity: '',
          joinedAt: '',
        },
        globalLeaderboard: [],
        friendsLeaderboard: [],
        categoryLeaderboards: {
          savings: [],
          goals: [],
          consistency: [],
        },
        achievements: [],
        availableBadges: [],
        contributionData: undefined,
        rankingStats: {
          totalUsers: 0,
          averageScore: 0,
          topScore: 0,
          userPercentile: 0,
        },
      };
      const raw = res.data;
      if (!raw) return empty;
      return {
        userRanking: {
          ...raw.userRanking,
          league: raw.userRanking?.league || 'Bronze', // Map league
          badges: raw.userRanking?.badges ?? [],
          achievements: raw.userRanking?.achievements ?? [],
          monthlyScore: raw.userRanking?.monthlyScore ?? 0,
          totalSavings: raw.userRanking?.totalSavings ?? 0,
          savingsRate: raw.userRanking?.savingsRate ?? 0,
          goalsCompleted: raw.userRanking?.goalsCompleted ?? 0,
          streakDays: raw.userRanking?.streakDays ?? 0,
          lastActivity: raw.userRanking?.lastActivity ?? '',
          joinedAt: raw.userRanking?.joinedAt ?? '',
        },
        globalLeaderboard: raw.globalLeaderboard ?? [],
        friendsLeaderboard: raw.friendsLeaderboard ?? [],
        categoryLeaderboards: {
          savings: raw.categoryLeaderboards?.savings ?? [],
          goals: raw.categoryLeaderboards?.goals ?? [],
          consistency: raw.categoryLeaderboards?.consistency ?? [],
        },
        achievements: raw.achievements ?? raw.userRanking?.achievements ?? [],
        availableBadges: raw.availableBadges ?? [],
        contributionData: raw.contributionData,
        rankingStats: {
          totalUsers: raw.rankingStats?.totalUsers ?? 0,
          averageScore: raw.rankingStats?.averageScore ?? 0,
          topScore: raw.rankingStats?.topScore ?? 0,
          userPercentile: raw.rankingStats?.userPercentile ?? 0,
        },
      };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}