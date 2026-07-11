// Live FX rates from frankfurter.app (ECB data, free, no API key).
// Rates are cached in-memory per base currency for a few hours so we
// don't hit the API on every request. Falls back gracefully on failure.

const SUPPORTED = ['GBP', 'USD', 'EUR', 'AUD', 'CAD'];
const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface RateCache {
  rates: Record<string, number>;
  fetchedAt: number;
}

const cache = new Map<string, RateCache>();

export interface RatesResult {
  base: string;
  // base -> currency conversion factors (e.g. GBP->USD = 1.27). base maps to 1.
  rates: Record<string, number>;
  updatedAt: string | null;
  live: boolean;
}

// Frozen historical rate: base value of 1 unit of `from` on a given date.
// Returns null if it can't be determined (caller falls back to live rates).
const histCache = new Map<string, number>();

export async function getFrozenRate(from: string, base: string, date: Date): Promise<number | null> {
  if (from === base) return 1;
  if (!SUPPORTED.includes(from) || !SUPPORTED.includes(base)) return null;

  const day = date.toISOString().slice(0, 10);
  const key = `${from}:${base}:${day}`;
  if (histCache.has(key)) return histCache.get(key)!;

  const parse = async (url: string): Promise<number | null> => {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.[base];
    return typeof rate === 'number' ? rate : null;
  };

  try {
    // Historical rate for the transaction date (frankfurter clamps to the
    // nearest business day). Fall back to latest if the date has no data.
    let rate = await parse(`https://api.frankfurter.app/${day}?from=${from}&to=${base}`);
    if (rate === null) rate = await parse(`https://api.frankfurter.app/latest?from=${from}&to=${base}`);
    if (rate !== null) histCache.set(key, rate);
    return rate;
  } catch (error) {
    console.error('Failed to fetch frozen FX rate:', error);
    return null;
  }
}

export async function getRates(base: string): Promise<RatesResult> {
  const safeBase = SUPPORTED.includes(base) ? base : 'GBP';
  const cached = cache.get(safeBase);
  const now = Date.now();

  if (cached && now - cached.fetchedAt < TTL_MS) {
    return { base: safeBase, rates: cached.rates, updatedAt: new Date(cached.fetchedAt).toISOString(), live: true };
  }

  const symbols = SUPPORTED.filter((c) => c !== safeBase).join(',');
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${safeBase}&to=${symbols}`);
    if (!res.ok) throw new Error(`FX API ${res.status}`);
    const data = (await res.json()) as { rates?: Record<string, number> };
    const rates: Record<string, number> = { [safeBase]: 1, ...(data.rates || {}) };
    cache.set(safeBase, { rates, fetchedAt: now });
    return { base: safeBase, rates, updatedAt: new Date(now).toISOString(), live: true };
  } catch (error) {
    console.error('Failed to fetch FX rates:', error);
    if (cached) {
      return { base: safeBase, rates: cached.rates, updatedAt: new Date(cached.fetchedAt).toISOString(), live: false };
    }
    // Last resort: no conversion (1:1). Better than crashing the finance page.
    const flat = Object.fromEntries(SUPPORTED.map((c) => [c, 1]));
    return { base: safeBase, rates: flat, updatedAt: null, live: false };
  }
}
