import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import type { HeroAbility } from '../types/hero';

interface AbilityCardProps {
  ability: HeroAbility;
}

export function AbilityCard({ ability }: AbilityCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(ability.imageUrl) && !imageFailed;

  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        {showImage ? (
          <Image
            source={{ uri: ability.imageUrl as string }}
            accessibilityLabel=""
            onError={() => setImageFailed(true)}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="lightning-bolt" size={16} color="#6E7681" />
          </View>
        )}
      </View>

      <View style={styles.content}><Text style={styles.name}>{ability.name}</Text>
        {ability.description ? (
          <Text style={styles.description} numberOfLines={3}>{ability.description}</Text>
        ) : (
          <Text style={styles.muted}>No description provided.</Text>
        )}
      </View></View>
  );
}

const styles = StyleSheet.create({ card: { flexDirection: 'row', gap: 14, borderRadius: 12, borderWidth: 1, borderColor: '#30363D', backgroundColor: '#161B22', padding: 12 }, iconBox: { width: 48, height: 48, borderRadius: 12, overflow: 'hidden', backgroundColor: '#1C232D' }, image: { width: '100%', height: '100%' }, placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' }, content: { flex: 1 }, name: { color: '#F5F6F7', fontSize: 15, fontWeight: '700', textTransform: 'uppercase' }, description: { color: '#8B949E', fontSize: 13, lineHeight: 19, marginTop: 4 }, muted: { color: '#6E7681', fontSize: 13, marginTop: 4 } });
