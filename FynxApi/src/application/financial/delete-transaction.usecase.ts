import type { ITransactionRepository } from '../../domains/financial/repositories/transaction.repository.js';

export class DeleteTransactionUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(id: string, userId: number): Promise<boolean> {
    const transaction = await this.transactionRepo.findById(id, userId);
    
    if (!transaction) {
      return false;
    }

    return this.transactionRepo.delete(id, userId);
  }
}
