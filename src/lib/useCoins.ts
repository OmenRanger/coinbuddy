import { useEffect, useMemo, useState } from 'react';
import type { Coin } from './types';
import { listCoins } from './db';

export function useCoins() {
  const [coins, setCoins] = useState<Coin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setError(null);
      const next = await listCoins();
      setCoins(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coins');
      setCoins([]);
    }
  }

  useEffect(() => {
    refresh();
    // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(() => ({ coins, error, refresh }), [coins, error]);
}
