import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

interface RoleFilterProps {
  roles: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function RoleFilter({ roles, value, onChange }: RoleFilterProps) {
  if (roles.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container} accessibilityLabel="Filter heroes by role">
      {roles.map((role) => {
        const isActive = role === value;
        return (
          <Pressable key={role} onPress={() => onChange(isActive ? null : role)} style={[styles.role, isActive && styles.active]}><Text style={styles.label}>{role}</Text></Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ container: { gap: 8, paddingHorizontal: 20 }, role: { borderRadius: 16, backgroundColor: '#FFFFFF0A', paddingHorizontal: 12, paddingVertical: 8 }, active: { backgroundColor: '#3A211D' }, label: { color: '#8B949E', fontSize: 12 } });
