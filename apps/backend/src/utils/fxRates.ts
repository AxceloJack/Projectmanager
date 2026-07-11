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
