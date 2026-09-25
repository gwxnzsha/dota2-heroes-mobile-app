import { useCallback, useEffect, useRef } from 'react';
import { Audio, AVPlaybackSource } from 'expo-av';

const CLICK_SOUND: AVPlaybackSource = require('../assets/sounds/button_click.wav');

export function useButtonSound() {
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let isMounted = true;

    Audio.Sound.createAsync(CLICK_SOUND, { shouldPlay: false }).then(({ sound }) => {
      if (isMounted) {
        soundRef.current = sound;
      } else {
        sound.unloadAsync();
      }
    });

    return () => {
      isMounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  const play = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Sound failing to play should never break a button's actual action.
    }
  }, []);

  return play;
}