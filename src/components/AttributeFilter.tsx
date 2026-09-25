import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ALL_ATTRIBUTES_META, ATTRIBUTES } from '../data/attributes';
import type { HeroAttribute } from '../types/hero';
import { Icon } from './Icon';

export type AttributeFilterValue = HeroAttribute | 'all';

interface AttributeFilterProps {
  value: AttributeFilterValue;
  onChange: (value: AttributeFilterValue) => void;
  counts?: Partial<Record<AttributeFilterValue, number>>;
}

export function AttributeFilter({ value, onChange, counts }: AttributeFilterProps) {
  const options: Array<{ id: AttributeFilterValue; label: string; icon: typeof ALL_ATTRIBUTES_META.icon; color?: string }> = [
    { id: 'all', label: ALL_ATTRIBUTES_META.label, icon: ALL_ATTRIBUTES_META.icon },
    ...ATTRIBUTES.map((attribute) => ({
      id: attribute.id as AttributeFilterValue,
      label: attribute.label,
      icon: attribute.icon,
      color: attribute.color,
    })),
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {options.map((option) => {
        const isActive = option.id === value;
        const count = counts?.[option.id];

        return (
          <TouchableOpacity
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.option, isActive && styles.activeOption]}
          >
            <Icon name={option.icon} size={16} color={isActive ? option.color ?? '#E05B36' : '#8B949E'} />
            <Text style={styles.label}>{option.label}</Text>
            {count !== undefined && <Text style={styles.count}>{count}</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, paddingHorizontal: 20 },
  option: { alignItems: 'center', flexDirection: 'row', gap: 8, borderColor: '#30363D', borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  activeOption: { backgroundColor: '#3A211D', borderColor: '#9B493C' },
  label: { color: '#F5F6F7', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  count: { color: '#8B949E', fontSize: 11 },
});
