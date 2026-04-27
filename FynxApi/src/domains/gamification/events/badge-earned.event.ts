import { IDomainEvent } from '../../../shared/infrastructure/event-bus.js';

export class BadgeEarnedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  
  constructor(
    public readonly userId: string,
    public readonly badgeId: string
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): string {
    return this.userId;
  }
}
