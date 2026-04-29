import type { ITransactionRepository } from '../../domains/financial/repositories/transaction.repository.js';
import type { CreateTransactionRequest, Transaction } from '../../domains/financial/transactions/transactions.types.js';
import { Money } from '../../domains/financial/value-objects/money.js';
import { TransactionType } from '../../domains/financial/value-objects/transaction-type.js';
import { EventBus } from '../../shared/infrastructure/event-bus.js';
import { TransactionCreatedEvent } from '../../domains/financial/events/transaction-created.event.js';

export class CreateTransactionUseCase {
  constructor(
    private transactionRepo: ITransactionRepository
  ) {}

  async execute(data: CreateTransactionRequest, userId: number): Promise<Transaction> {
    const amount = Money.create(data.amount);
    const type = TransactionType.create(data.type);

    const transaction = await this.transactionRepo.save({
      ...data,
      userId,
      amount: amount.amount,
      type: type.value
    });

    // Desacoplamento via Eventos
    await EventBus.publish(new TransactionCreatedEvent(transaction));

    return transaction;
  }
}
