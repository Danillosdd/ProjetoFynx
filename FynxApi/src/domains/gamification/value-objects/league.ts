import { ValueObject } from '../../../shared/domain/value-object.js';
import { SILVER_THRESHOLD, GOLD_THRESHOLD, DIAMOND_THRESHOLD } from '../../../shared/constants/ranking.constants.js';

export enum LeagueNames {
  BRONZE = 'Bronze',
  SILVER = 'Prata',
  GOLD = 'Ouro',
  DIAMOND = 'Diamante'
}

interface LeagueProps {
  name: LeagueNames;
}

export class League extends ValueObject<LeagueProps> {
  private constructor(props: LeagueProps) {
    super(props);
  }

  public static create(name: string): League {
    return new League({ name: name as LeagueNames });
  }

  public static fromScore(points: number): League {
    if (points >= DIAMOND_THRESHOLD) return new League({ name: LeagueNames.DIAMOND });
    if (points >= GOLD_THRESHOLD) return new League({ name: LeagueNames.GOLD });
    if (points >= SILVER_THRESHOLD) return new League({ name: LeagueNames.SILVER });
    return new League({ name: LeagueNames.BRONZE });
  }

  get name(): LeagueNames {
    return this.props.name;
  }
}
