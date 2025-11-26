
import { RankingService } from './src/modules/ranking/ranking.service.js';
import { database } from './src/database/database.js';

async function debug() {
    try {
        console.log('--- Debugging Ranking Service ---');

        console.log('1. Testing getGlobalLeaderboard...');
        const leaderboard = await RankingService.getGlobalLeaderboard();
        console.log(`Leaderboard length: ${leaderboard.length}`);
        if (leaderboard.length > 0) {
            console.log('First entry:', JSON.stringify(leaderboard[0], null, 2));
        } else {
            console.log('Leaderboard is empty!');
        }

        console.log('\n2. Testing getRankingData for User 1...');
        try {
            const rankingData = await RankingService.getRankingData(1);
            console.log('User Ranking Position:', rankingData.userRanking.position);
            console.log('User Score:', rankingData.userRanking.score);
            console.log('Available Badges:', rankingData.availableBadges.length);
        } catch (e) {
            console.error('Error fetching ranking data for user 1:', e);
        }

    } catch (error) {
        console.error('Debug script error:', error);
    }
}

debug();
