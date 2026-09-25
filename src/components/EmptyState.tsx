import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.icon}><Icon name="text-search" size={20} color="#6E7681" /></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.action}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 56 }, icon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#30363D', backgroundColor: '#161B22', alignItems: 'center', justifyContent: 'center' }, title: { color: '#F5F6F7', fontSize: 19, fontWeight: '700', textTransform: 'uppercase', marginTop: 16 }, message: { color: '#8B949E', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 6 }, action: { marginTop: 20, borderRadius: 20, borderWidth: 1, borderColor: '#484F58', backgroundColor: '#161B22', paddingHorizontal: 20, paddingVertical: 10 }, actionLabel: { color: '#F5F6F7', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' } });
