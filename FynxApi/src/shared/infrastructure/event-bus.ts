export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): string;
}

export type Handler<T extends IDomainEvent> = (event: T) => Promise<void>;

export class EventBus {
  private static handlers: Map<string, Handler<any>[]> = new Map();

  public static subscribe<T extends IDomainEvent>(eventName: string, handler: Handler<T>): void {
    const currentHandlers = this.handlers.get(eventName) || [];
    this.handlers.set(eventName, [...currentHandlers, handler]);
  }

  public static async publish<T extends IDomainEvent>(event: T): Promise<void> {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];
    
    await Promise.all(handlers.map(handler => handler(event)));
  }
}
