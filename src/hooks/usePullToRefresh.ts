import { useCallback, useRef, useState } from 'react';
import type { GestureResponderEvent, ScrollView } from 'react-native';

const MAX_PULL = 88;
const TRIGGER_AT = 62;

interface UsePullToRefreshResult {
  pullDistance: number;
  isPulling: boolean;
  handlers: {
    onTouchStart: (event: GestureResponderEvent) => void;
    onTouchMove: (event: GestureResponderEvent) => void;
    onTouchEnd: () => void;
  };
}

/**
 * Touch-driven pull-to-refresh for a scroll container. Only engages when the
 * container is already scrolled to the top, matching native behaviour.
 */
export function usePullToRefresh(
  scrollRef: React.RefObject<ScrollView | null>,
  onRefresh: () => Promise<void> | void,
  enabled = true,
): UsePullToRefreshResult {
  const startY = useRef<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const onTouchStart = useCallback(
    (event: GestureResponderEvent) => {
      if (!enabled) return;
      const node = scrollRef.current;
      if (!node) return;
      startY.current = event.nativeEvent.pageY;
    },
    [enabled, scrollRef],
  );

  const onTouchMove = useCallback(
    (event: GestureResponderEvent) => {
      if (startY.current === null) return;
      const delta = event.nativeEvent.pageY - startY.current;
      if (delta <= 0) {
        setPullDistance(0);
        return;
      }
      setIsPulling(true);
      setPullDistance(Math.min(MAX_PULL, delta * 0.5));
    },
    [],
  );

  const onTouchEnd = useCallback(() => {
    const shouldRefresh = pullDistance >= TRIGGER_AT;
    startY.current = null;
    setPullDistance(0);
    setIsPulling(false);
    if (shouldRefresh) void onRefresh();
  }, [onRefresh, pullDistance]);

  return { pullDistance, isPulling, handlers: { onTouchStart, onTouchMove, onTouchEnd } };
}
