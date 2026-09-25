import { useCallback, useEffect, useState } from 'react';
import { getHeroes } from '../api/heroes';
import type { Hero } from '../types/hero';

const MIN_REFRESH_MS = 500;

interface UseHeroesResult {
  heroes: Hero[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  reload: () => void;
  refresh: () => Promise<void>;
}

export function useHeroes(): UseHeroesResult {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh') => {
    const startedAt = Date.now();
    if (mode === 'initial') setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const result = await getHeroes();
      setHeroes(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      if (mode === 'refresh') {
        const remaining = MIN_REFRESH_MS - (Date.now() - startedAt);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
      }
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load('initial');
  }, [load]);

  return {
    heroes,
    isLoading,
    isRefreshing,
    error,
    reload: () => void load('initial'),
    refresh: () => load('refresh'),
  };
}
