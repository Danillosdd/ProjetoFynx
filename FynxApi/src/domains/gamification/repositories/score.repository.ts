export interface IScoreRepository {
  getCurrentScore(userId: number): Promise<number>;
  updateScore(userId: number, points: number): Promise<void>;
  awardBadge(userId: number, badgeId: string): Promise<void>;
}
