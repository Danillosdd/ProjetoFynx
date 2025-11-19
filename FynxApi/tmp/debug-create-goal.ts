import 'dotenv/config';
import { GoalsService } from '../src/modules/goals/goals.service.js';

(async () => {
  try {
    const payload = {
      title: 'Debug Meta Gasto',
      category: 'alimentacao',
      goalType: 'spending',
      targetAmount: 123,
      period: 'monthly',
      description: 'Criado pelo script de debug'
    } as any;

    console.log('Calling GoalsService.createSpendingGoal with payload:', payload);
    const result = await GoalsService.createSpendingGoal(payload);
    console.log('Result:', result);
  } catch (err: any) {
    console.error('Error while calling createSpendingGoal:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
