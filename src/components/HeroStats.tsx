import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { HeroStat } from '../types/hero';

interface HeroStatsProps {
  stats: HeroStat[];
}

export function HeroStats({ stats }: HeroStatsProps) {
  if (stats.length === 0) {
    return (
      <Text style={styles.empty}>
        No statistics available for this hero.
      </Text>
    );
  }

  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.card}><Text style={styles.label}>{stat.label}</Text><Text style={styles.value}>{stat.value}</Text></View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, card: { width: '48%', borderRadius: 10, borderWidth: 1, borderColor: '#30363D', backgroundColor: '#161B22', padding: 14 }, label: { color: '#6E7681', fontSize: 11, textTransform: 'uppercase' }, value: { color: '#F5F6F7', fontSize: 19, fontWeight: '700', marginTop: 4 }, empty: { color: '#8B949E', backgroundColor: '#161B22', padding: 16, borderRadius: 10, fontSize: 13 } });
