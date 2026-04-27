import { ValueObject } from '../../../shared/domain/value-object.js';
import { DomainError } from '../../../shared/domain/domain-error.js';
import { League } from './league.js';

interface ScoreProps {
  points: number;
}

export class Score extends ValueObject<ScoreProps> {
  private constructor(props: ScoreProps) {
    super(props);
  }

  public static create(points: number): Score {
    if (points < 0) {
      throw new DomainError('O score não pode ser negativo');
    }

    return new Score({ points: Math.floor(points) });
  }

  get points(): number {
    return this.props.points;
  }

  public toLeague(): League {
    return League.fromScore(this.points);
  }

  public add(points: number): Score {
    return Score.create(this.points + points);
  }
}
