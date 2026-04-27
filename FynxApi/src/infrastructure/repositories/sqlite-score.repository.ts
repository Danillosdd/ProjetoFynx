import { IScoreRepository } from '../../domains/gamification/repositories/score.repository.js';
import { database } from '../database/database.js';

export class SQLiteScoreRepository implements IScoreRepository {
  async getCurrentScore(userId: number): Promise<number> {
    const row = await database.get('SELECT total_score FROM user_scores WHERE user_id = ?', [userId]);
    return row ? row.total_score : 0;
  }

  async updateScore(userId: number, points: number): Promise<void> {
    await database.run(
      'UPDATE user_scores SET total_score = total_score + ? WHERE user_id = ?',
      [points, userId]
    );
  }

  async awardBadge(userId: number, badgeId: string): Promise<void> {
    // Verificar se já tem a badge
    const existing = await database.get(
      'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badgeId]
    );
    
    if (!existing) {
      await database.run(
        'INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)',
        [userId, badgeId]
      );
    }
  }
}
