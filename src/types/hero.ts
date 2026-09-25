export type HeroAttribute = 'strength' | 'agility' | 'intelligence' | 'universal';

export interface HeroStat {
  label: string;
  value: string;
}

export interface HeroAbility {
  id: string;
  name: string;
  description?: string;
  imageUrl: string | null;
}

export interface Hero {
  id: string;
  name: string;
  key: string;
  attribute: HeroAttribute;
  attackType: string;
  roles: string[];
  description?: string;
  imageUrl: string | null;
  iconUrl: string | null;
  stats: HeroStat[];
}

export interface HeroDetail extends Hero {
  abilities: HeroAbility[];
}
