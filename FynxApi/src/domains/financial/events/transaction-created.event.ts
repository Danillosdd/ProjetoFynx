import { IDomainEvent } from '../../../shared/infrastructure/event-bus.js';
import { Transaction } from '../transactions/transactions.types.js';

export class TransactionCreatedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  
  constructor(public readonly transaction: Transaction) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): string {
    return this.transaction.id;
  }
}
