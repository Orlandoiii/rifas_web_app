import React from 'react';
import { logger } from '../../../services/logger';

type CoinItem = {
  code?: string;
  name?: string;
  display_name: string;
};

type CoinsJson = {
  coins: CoinItem[];
};

type CoinsContextValue = {
  /**
   * Devuelve el display_name asociado a un code (ej: "BTC" -> "Bitcoin").
   * - Es sincrónico para poder usarse directamente en JSX.
   * - Es case-insensitive.
   * - Si aún no cargó o no existe, retorna el code original.
   */
  getCoinDisplayName: (code: string) => string;
  isLoading: boolean;
  error: string | null;
};

const CoinsContext = React.createContext<CoinsContextValue | null>(null);

const COINS_URL = new URL('../../../assets/coins.json', import.meta.url).toString();

export function CoinsProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [coinsByCode, setCoinsByCode] = React.useState<Map<string, string>>(new Map());

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        logger.request('GET', COINS_URL, undefined, { service: 'Coins' });

        const res = await fetch(COINS_URL, { headers: { Accept: 'application/json' } });
        const data = (await res.json()) as CoinsJson;

        logger.response('GET', COINS_URL, res.status, data, { service: 'Coins' });

        if (!res.ok) {
          throw new Error(`Error al cargar coins.json. Código: ${res.status}`);
        }

        const map = new Map<string, string>();
        for (const coin of data?.coins ?? []) {
          const key = (coin.code ?? coin.name)?.trim();
          const display = coin.display_name?.trim();
          if (!key || !display) continue;
          map.set(key.toUpperCase(), display);
        }

        if (!cancelled) {
          setCoinsByCode(map);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error al cargar coins.json';
        logger.error(message, e, { service: 'Coins' });
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const getCoinDisplayName = React.useCallback(
    (code: string) => {
      const normalized = code?.trim().toUpperCase();
      if (!normalized) return '';
      return coinsByCode.get(normalized) ?? code;
    },
    [coinsByCode],
  );

  const value = React.useMemo<CoinsContextValue>(
    () => ({ getCoinDisplayName, isLoading, error }),
    [getCoinDisplayName, isLoading, error],
  );

  return <CoinsContext.Provider value={value}>{children}</CoinsContext.Provider>;
}

export function useCoins(): CoinsContextValue {
  const ctx = React.useContext(CoinsContext);
  if (!ctx) {
    throw new Error('useCoins debe usarse dentro de <CoinsProvider>');
  }
  return ctx;
}

