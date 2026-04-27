import { IDomainEvent } from '../../../shared/infrastructure/event-bus.js';

export class GoalCompletedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  
  constructor(
    public readonly goalId: string,
    public readonly userId: string,
    public readonly type: 'spending' | 'saving'
  ) {
    this.dateTimeOccurred = new Date();
  }

  getAggregateId(): string {
    return this.goalId;
  }
}
