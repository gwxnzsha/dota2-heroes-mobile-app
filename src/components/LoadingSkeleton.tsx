import React from 'react';
import { StyleSheet, View } from 'react-native';

function Block({ className = '' }: { className?: string }) {
  return <View style={[styles.block, className ? styles.extra : undefined]} />;
}

export function HeroGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.cardImage} />
          <View style={styles.cardFooter}>
            <Block className="h-3 w-2/3 rounded-full" />
            <Block className="h-2.5 w-6 rounded-full" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function HeroDetailSkeleton() {
  return (
    <View>
      <View style={styles.detailImage} />
      <View style={styles.detailBody}>
        <View style={styles.stack}>
          <Block className="h-7 w-1/2 rounded-md" />
          <Block className="h-3 w-3/4 rounded-full" />
          <Block className="h-3 w-2/3 rounded-full" />
        </View>
        <View style={styles.stats}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Block key={index} className="h-16 rounded-card" />
          ))}
        </View>
        <View style={styles.stack}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Block key={index} className="h-[72px] rounded-card" />
          ))}
        </View>
      </View>
    </View>
  );
}

export function LoadingSkeleton() {
  return <HeroGridSkeleton />;
}

const styles = StyleSheet.create({ block: { height: 12, width: '60%', borderRadius: 6, backgroundColor: '#FFFFFF0B' }, extra: {}, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, card: { width: '48%', overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: '#30363D', backgroundColor: '#161B22' }, cardImage: { aspectRatio: 4 / 3, backgroundColor: '#FFFFFF08' }, cardFooter: { padding: 12, flexDirection: 'row', justifyContent: 'space-between' }, detailImage: { height: 320, backgroundColor: '#FFFFFF08' }, detailBody: { padding: 20, gap: 24 }, stack: { gap: 10 }, stats: { flexDirection: 'row', gap: 8 } });
