import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HeroCard } from './HeroCard';
import type { Hero } from '../types/hero';

interface HeroGridProps {
  heroes: Hero[];
  onSelect: (hero: Hero) => void;
}

export function HeroGrid({ heroes, onSelect }: HeroGridProps) {
  return (
    <View style={styles.grid}>
      {heroes.map((hero, index) => (
        <View key={hero.id} style={styles.cell}>
          <HeroCard hero={hero} index={index} onPress={onSelect} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { width: '48%' },
});
