import { Entity } from '../../../shared/domain/entity.js';
import { Money } from '../value-objects/money.js';

interface SavingGoalProps {
  userId: string;
  name: string;
  targetAmount: Money;
  currentAmount: Money;
  deadline?: Date;
}

export class SavingGoal extends Entity<SavingGoalProps> {
  constructor(props: SavingGoalProps, id?: string) {
    super(props, id);
  }

  get targetAmount(): Money {
    return this.props.targetAmount;
  }

  get currentAmount(): Money {
    return this.props.currentAmount;
  }

  public get progressPercentage(): number {
    if (this.targetAmount.amount === 0) return 0;
    const percentage = (this.currentAmount.amount / this.targetAmount.amount) * 100;
    return Math.min(percentage, 100);
  }

  public get isCompleted(): boolean {
    return this.currentAmount.amount >= this.targetAmount.amount;
  }

  public deposit(amount: Money): void {
    (this.props as any).currentAmount = this.props.currentAmount.add(amount);
  }

  public withdraw(amount: Money): void {
    (this.props as any).currentAmount = this.props.currentAmount.subtract(amount);
  }
}
