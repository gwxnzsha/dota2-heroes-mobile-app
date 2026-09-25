import React, { memo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { getAttributeMeta } from '../data/attributes';
import type { Hero } from '../types/hero';

interface HeroCardProps {
  hero: Hero;
  index: number;
  onPress: (hero: Hero) => void;
}

function HeroCardComponent({ hero, index, onPress }: HeroCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const attribute = getAttributeMeta(hero.attribute);
  const showImage = Boolean(hero.imageUrl) && !imageFailed;

  return (
    <Pressable onPress={() => onPress(hero)} accessibilityLabel={`${hero.name}, ${attribute.label} ${hero.attackType}`} style={styles.card}>
      <View style={styles.imageContainer}>
        {showImage ? (
          <Image
            source={{ uri: hero.imageUrl as string }}
            accessibilityLabel=""
            onError={() => setImageFailed(true)}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="head-question" size={24} color="#6E7681" />
            <Text style={styles.muted}>No art</Text>
          </View>
        )}
        <View style={[styles.dot, { backgroundColor: attribute.color }]} />
      </View>

      <View style={styles.footer}><Text style={styles.name} numberOfLines={1}>{hero.name}</Text><Text style={[styles.short, { color: attribute.color }]}>{attribute.short}</Text></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: '#30363D', backgroundColor: '#161B22' },
  imageContainer: { aspectRatio: 4 / 3, backgroundColor: '#1C232D' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  muted: { color: '#6E7681', fontSize: 11, textTransform: 'uppercase' },
  dot: { position: 'absolute', left: 10, top: 10, width: 6, height: 6, borderRadius: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  name: { flex: 1, color: '#F5F6F7', fontSize: 15, fontWeight: '700', textTransform: 'uppercase' },
  short: { fontSize: 10, fontWeight: '700' },
});

/** Memoized so filtering/searching only re-renders cards that actually change. */
export const HeroCard = memo(HeroCardComponent);
