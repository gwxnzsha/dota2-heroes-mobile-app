import { useCallback, useEffect, useState } from 'react';
import { getHeroById } from '../api/heroes';
import type { HeroDetail } from '../types/hero';

interface UseHeroDetailResult {
  hero: HeroDetail | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function useHeroDetail(id: string | undefined): UseHeroDetailResult {
  const [hero, setHero] = useState<HeroDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Hero not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setHero(await getHeroById(id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { hero, isLoading, error, reload: () => void load() };
}
