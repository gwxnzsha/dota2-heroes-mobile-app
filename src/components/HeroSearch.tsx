import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Icon } from './Icon';

interface HeroSearchProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export function HeroSearch({ value, onChange, autoFocus }: HeroSearchProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <View style={styles.container}>
      <Icon name="magnify" size={16} color="#6E7681" />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        placeholder="Search heroes"
        accessibilityLabel="Search heroes by name"
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChange('')} accessibilityLabel="Clear search" style={styles.clear}>
          <Icon name="close" size={16} color="#8B949E" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 22, borderWidth: 1, borderColor: '#30363D', backgroundColor: '#161B22', paddingHorizontal: 16 }, input: { flex: 1, color: '#F5F6F7', fontSize: 15 }, clear: { padding: 6 } });
