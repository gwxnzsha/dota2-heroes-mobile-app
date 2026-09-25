import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Native equivalent of the ambient web treatment: layered gradients and a
 * few dim particles, with no HTML elements or line texture.
 */
export function BackgroundTexture() {
  return (
    <View pointerEvents="none" style={styles.background}>
      <LinearGradient
        colors={['#1A2028', '#0F141B', '#090D12']}
        locations={[0, 0.42, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(226,84,59,0.16)', 'rgba(226,84,59,0.04)', 'rgba(226,84,59,0)']}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.warmWash}
      />
      <View style={[styles.particle, styles.particleOne]} />
      <View style={[styles.particle, styles.particleTwo]} />
      <View style={[styles.particle, styles.particleThree]} />
      <LinearGradient
        colors={['rgba(4,7,11,0)', 'rgba(4,7,11,0.22)', 'rgba(4,7,11,0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { ...StyleSheet.absoluteFill, overflow: 'hidden', backgroundColor: '#090D12' },
  warmWash: { position: 'absolute', top: -80, left: -40, width: '115%', height: 360, opacity: 0.9 },
  particle: { position: 'absolute', borderRadius: 10 },
  particleOne: { left: 24, top: 160, width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  particleTwo: { right: 40, top: 96, width: 6, height: 6, backgroundColor: 'rgba(226,84,59,0.25)' },
  particleThree: { left: '50%', top: 256, width: 4, height: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
});
