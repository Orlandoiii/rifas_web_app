import { logger } from './logger';

type CoinItem = {
  code?: string;
  name?: string;
  display_name: string;
};

type CoinsJson = {
  coins: CoinItem[];
};

// Importante:
// - NO importes el JSON con `import coins from ...` porque eso lo embebe en el bundle.
// - Al usar fetch + new URL(..., import.meta.url), el archivo se descarga como asset.
const COINS_URL = new URL('../assets/coins.json', import.meta.url).toString();

let coinsByCodePromise: Promise<Map<string, string>> | null = null;

async function loadCoinsByCode(): Promise<Map<string, string>> {
  logger.request('GET', COINS_URL, undefined, { service: 'Coins' });

  const res = await fetch(COINS_URL, { headers: { Accept: 'application/json' } });
  const data = (await res.json()) as CoinsJson;

  logger.response('GET', COINS_URL, res.status, data, { service: 'Coins' });

  if (!res.ok) {
    logger.error(`Error ${res.status}: ${res.statusText}`, data, { service: 'Coins' });
    throw new Error(`Error al cargar coins.json. Código: ${res.status}`);
  }

  const map = new Map<string, string>();

  for (const coin of data?.coins ?? []) {
    const key = (coin.code ?? coin.name)?.trim();
    const display = coin.display_name?.trim();
    if (!key || !display) continue;
    map.set(key.toUpperCase(), display);
  }

  return map;
}

/**
 * Devuelve el display_name asociado a un code (ej: "BTC" -> "Bitcoin").
 * - Es async porque el JSON se descarga en runtime.
 * - Es case-insensitive.
 * - Soporta items con `code` o `name` como identificador.
 */
export async function getCoinDisplayName(code: string): Promise<string | null> {
  const normalized = code?.trim().toUpperCase();
  if (!normalized) return null;

  if (!coinsByCodePromise) {
    coinsByCodePromise = loadCoinsByCode().catch((err) => {
      // Si falla, permitir reintento en la próxima llamada.
      coinsByCodePromise = null;
      throw err;
    });
  }

  const coinsByCode = await coinsByCodePromise;
  return coinsByCode.get(normalized) ?? null;
}

