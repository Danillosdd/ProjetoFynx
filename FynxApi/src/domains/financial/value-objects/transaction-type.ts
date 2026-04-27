import { ValueObject } from '../../../shared/domain/value-object.js';
import { DomainError } from '../../../shared/domain/domain-error.js';

export enum TransactionTypes {
  INCOME = 'income',
  EXPENSE = 'expense'
}

interface TransactionTypeProps {
  value: TransactionTypes;
}

export class TransactionType extends ValueObject<TransactionTypeProps> {
  private constructor(props: TransactionTypeProps) {
    super(props);
  }

  public static create(value: string): TransactionType {
    if (!Object.values(TransactionTypes).includes(value as TransactionTypes)) {
      throw new DomainError(`Tipo de transação inválido: ${value}`);
    }

    return new TransactionType({ value: value as TransactionTypes });
  }

  get value(): TransactionTypes {
    return this.props.value;
  }

  public isIncome(): boolean {
    return this.props.value === TransactionTypes.INCOME;
  }

  public isExpense(): boolean {
    return this.props.value === TransactionTypes.EXPENSE;
  }
}
