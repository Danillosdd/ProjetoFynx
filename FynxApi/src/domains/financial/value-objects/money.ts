import { ValueObject } from '../../../shared/domain/value-object.js';
import { DomainError } from '../../../shared/domain/domain-error.js';

interface MoneyProps {
  amount: number;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  public static create(amount: number): Money {
    if (amount < 0) {
      throw new DomainError('O valor não pode ser negativo');
    }

    // Garante precisão de 2 casas decimais
    const roundedAmount = Math.round(amount * 100) / 100;
    
    return new Money({ amount: roundedAmount });
  }

  get amount(): number {
    return this.props.amount;
  }

  public add(other: Money): Money {
    return Money.create(this.amount + other.amount);
  }

  public subtract(other: Money): Money {
    if (this.amount < other.amount) {
      throw new DomainError('Saldo insuficiente para realizar esta operação');
    }
    return Money.create(this.amount - other.amount);
  }
}
