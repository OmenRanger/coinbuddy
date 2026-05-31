import { describe, expect, it } from 'vitest';
import { computeEstimate } from './estimate';

describe('computeEstimate', () => {
  it('calculates low/mid/high using median and confidence from count', () => {
    const r = computeEstimate([
      { id: '1', sourceName: 'A', observedPrice: 10 },
      { id: '2', sourceName: 'B', observedPrice: 20 },
      { id: '3', sourceName: 'C', observedPrice: 30 },
    ]);

    expect(r.low).toBe(10);
    expect(r.high).toBe(30);
    expect(r.mid).toBe(20);
    expect(r.confidence).toBe('medium');
  });

  it('ignores invalid prices and returns empty when none valid', () => {
    const r = computeEstimate([
      { id: '1', sourceName: 'A', observedPrice: -1 },
      { id: '2', sourceName: 'B', observedPrice: NaN },
      { id: '3', sourceName: 'C' },
    ]);

    expect(r.validPrices.length).toBe(0);
    expect(r.low).toBeUndefined();
    expect(r.confidence).toBeUndefined();
  });
});
