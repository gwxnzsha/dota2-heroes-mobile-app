import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  title = 'Unable to load heroes.',
  message = 'Check your connection or the API configuration, then try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert"><View style={styles.icon}><Icon name="alert" size={20} color="#E2543B" /></View><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text><Pressable onPress={onRetry} style={styles.action}>
        <Icon name="reload" size={16} color="#FFFFFF" />
        <Text style={styles.actionLabel}>Retry</Text>
      </Pressable></View>
  );
}

const styles = StyleSheet.create({ container: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 56 }, icon: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#9B493C', backgroundColor: '#3A211D', alignItems: 'center', justifyContent: 'center' }, title: { color: '#F5F6F7', fontSize: 19, fontWeight: '700', textTransform: 'uppercase', marginTop: 16 }, message: { color: '#8B949E', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 6 }, action: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, borderRadius: 22, backgroundColor: '#E2543B', paddingHorizontal: 24, paddingVertical: 12 }, actionLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' } });
