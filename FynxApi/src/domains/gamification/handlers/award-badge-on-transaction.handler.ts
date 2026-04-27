import { TransactionCreatedEvent } from '../../financial/events/transaction-created.event.js';
import { IScoreRepository } from '../repositories/score.repository.js';

export class AwardBadgeOnTransactionHandler {
  constructor(private scoreRepo: IScoreRepository) {}

  async handle(event: TransactionCreatedEvent): Promise<void> {
    const userId = parseInt(event.transaction.userId);
    
    // Lógica que antes estava no Service/UseCase agora vive aqui
    await this.scoreRepo.updateScore(userId, 10);
    
    // Exemplo: se for a primeira transação, ganha badge
    // (Poderia chamar outros serviços/repositórios aqui)
    console.log(`[Gamification] Processando score para usuário ${userId} após transação.`);
  }
}
