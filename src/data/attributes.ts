import type { HeroAttribute } from '../types/hero';
import type { IconName } from '../components/Icon';

export interface AttributeMeta {
  id: HeroAttribute;
  label: string;
  short: string;
  icon: IconName;
  color: string;
}

export const ATTRIBUTES: AttributeMeta[] = [
  { id: 'strength', label: 'Strength', short: 'STR', icon: 'sword' as IconName, color: '#E05B4A' },
  { id: 'agility', label: 'Agility', short: 'AGI', icon: 'run-fast' as IconName, color: '#63C271' },
  { id: 'intelligence', label: 'Intelligence', short: 'INT', icon: 'brain' as IconName, color: '#5AA8D6' },
  { id: 'universal', label: 'Universal', short: 'UNI', icon: 'star-four-points' as IconName, color: '#C08AD8' },
];

export const ALL_ATTRIBUTES_META = {
  label: 'All',
  icon: 'layers' as IconName,
};

export function getAttributeMeta(attribute: HeroAttribute): AttributeMeta {
  return ATTRIBUTES.find((entry) => entry.id === attribute) ?? ATTRIBUTES[3];
}
