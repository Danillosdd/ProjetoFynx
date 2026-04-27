import { Entity } from '../../../shared/domain/entity.js';
import { Money } from '../value-objects/money.js';

interface SpendingLimitProps {
  userId: string;
  name: string;
  limitAmount: Money;
  spentAmount: Money;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
}

export class SpendingLimit extends Entity<SpendingLimitProps> {
  constructor(props: SpendingLimitProps, id?: string) {
    super(props, id);
  }

  get limitAmount(): Money {
    return this.props.limitAmount;
  }

  get spentAmount(): Money {
    return this.props.spentAmount;
  }

  public get progressPercentage(): number {
    if (this.limitAmount.amount === 0) return 0;
    return (this.spentAmount.amount / this.limitAmount.amount) * 100;
  }

  public get isExceeded(): boolean {
    return this.spentAmount.amount > this.limitAmount.amount;
  }

  public registerExpense(amount: Money): void {
    // Aqui não usamos o setter direto, mantemos a imutabilidade das props através de novas instâncias se necessário
    // mas em Entidades DDD podemos mutar as props se houver lógica de negócio.
    (this.props as any).spentAmount = this.props.spentAmount.add(amount);
  }
}
