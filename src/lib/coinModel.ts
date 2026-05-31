import type { Coin } from './types';

export function nowIso(): string {
  return new Date().toISOString();
}

export function createId(prefix = 'coin'): string {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createCoin(input: Partial<Coin>): Coin {
  const now = nowIso();
  return {
    id: input.id ?? createId('coin'),
    name: (input.name ?? '').trim() || 'Untitled coin',
    country: (input.country ?? '').trim() || undefined,
    denomination: (input.denomination ?? '').trim() || undefined,
    year: (input.year ?? '').trim() || undefined,
    mintMark: (input.mintMark ?? '').trim() || undefined,
    composition: (input.composition ?? '').trim() || undefined,
    condition: (input.condition ?? '').trim() || undefined,
    gradeEstimate: (input.gradeEstimate ?? '').trim() || undefined,
    estimatedValueLow: input.estimatedValueLow,
    estimatedValueMid: input.estimatedValueMid,
    estimatedValueHigh: input.estimatedValueHigh,
    valueConfidence: input.valueConfidence ?? 'low',
    valueSources: Array.isArray(input.valueSources) ? input.valueSources : [],
    obverseImageUrl: (input.obverseImageUrl ?? '').trim() || undefined,
    reverseImageUrl: (input.reverseImageUrl ?? '').trim() || undefined,
    acquisitionDate: (input.acquisitionDate ?? '').trim() || undefined,
    acquisitionSource: (input.acquisitionSource ?? '').trim() || undefined,
    purchasePrice: input.purchasePrice,
    storageLocation: (input.storageLocation ?? '').trim() || undefined,
    notes: (input.notes ?? '').trim() || undefined,
    tags: Array.isArray(input.tags) ? input.tags : [],
    favorite: Boolean(input.favorite),
    needsReview: Boolean(input.needsReview),
    createdAt: input.createdAt ?? now,
    updatedAt: now,
  };
}

export function toNumberOrUndefined(value: string): number | undefined {
  if (value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
