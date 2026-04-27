import { EventBus } from '../shared/infrastructure/event-bus.js';
import { TransactionCreatedEvent } from '../domains/financial/events/transaction-created.event.js';
import { AwardBadgeOnTransactionHandler } from '../domains/gamification/handlers/award-badge-on-transaction.handler.js';
import { scoreRepository } from './container.js';

export function initializeApp() {
  console.log('🏗️ Initializing DDD Layers...');

  // Register Event Handlers
  const awardBadgeHandler = new AwardBadgeOnTransactionHandler(scoreRepository);
  
  EventBus.subscribe(TransactionCreatedEvent.name, (event: TransactionCreatedEvent) => 
    awardBadgeHandler.handle(event)
  );

  console.log('✅ Event Handlers Registered');
}
