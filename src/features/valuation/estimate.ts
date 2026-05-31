import type { ValueConfidence, ValueSource } from '../../lib/types';

export type EstimateResult = {
  low?: number;
  mid?: number;
  high?: number;
  confidence?: ValueConfidence;
  validPrices: number[];
};

export function computeEstimate(valueSources: ValueSource[] | undefined | null): EstimateResult {
  const sources = Array.isArray(valueSources) ? valueSources : [];
  const validPrices = sources
    .map((s) => s.observedPrice)
    .filter((p): p is number => typeof p === 'number' && Number.isFinite(p) && p > 0);

  if (validPrices.length === 0) {
    return { validPrices };
  }

  const sorted = [...validPrices].sort((a, b) => a - b);
  const low = sorted[0];
  const high = sorted[sorted.length - 1];
  const mid = median(sorted);

  const confidence: ValueConfidence = sorted.length >= 4 ? 'high' : sorted.length >= 2 ? 'medium' : 'low';

  return { low, mid, high, confidence, validPrices: sorted };
}

function median(sorted: number[]): number {
  const n = sorted.length;
  const i = Math.floor(n / 2);
  if (n % 2 === 1) return sorted[i];
  return (sorted[i - 1] + sorted[i]) / 2;
}

export function confidenceLabel(conf?: ValueConfidence): string {
  if (conf === 'high') return 'High';
  if (conf === 'medium') return 'Medium';
  if (conf === 'low') return 'Low';
  return 'Not estimated';
}
