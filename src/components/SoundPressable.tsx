import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import { useButtonSound } from '../hooks/useButtonSound';

export function SoundPressable({ onPress, ...props }: PressableProps) {
  const playClick = useButtonSound();

  return (
    <Pressable
      {...props}
      onPress={(event) => {
        playClick();
        onPress?.(event);
      }}
    />
  );
}