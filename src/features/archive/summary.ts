import type { Coin } from '../../lib/types';

export type ArchiveSummary = {
  totalCoins: number;
  coinsWithPhotos: number;
  coinsMissingPhotos: number;
  needsReviewCount: number;
  favoriteCount: number;
  estimatedValueLowTotal?: number;
  estimatedValueMidTotal?: number;
  estimatedValueHighTotal?: number;
};

export function computeArchiveSummary(coins: Coin[]): ArchiveSummary {
  const totalCoins = coins.length;
  const coinsWithPhotos = coins.filter((c) => Boolean(c.obverseImageUrl) && Boolean(c.reverseImageUrl)).length;
  const coinsMissingPhotos = coins.filter((c) => !c.obverseImageUrl || !c.reverseImageUrl).length;
  const needsReviewCount = coins.filter((c) => Boolean(c.needsReview)).length;
  const favoriteCount = coins.filter((c) => Boolean(c.favorite)).length;

  const estimatedValueLowTotal = sumNumbers(coins.map((c) => c.estimatedValueLow));
  const estimatedValueMidTotal = sumNumbers(coins.map((c) => c.estimatedValueMid));
  const estimatedValueHighTotal = sumNumbers(coins.map((c) => c.estimatedValueHigh));

  return {
    totalCoins,
    coinsWithPhotos,
    coinsMissingPhotos,
    needsReviewCount,
    favoriteCount,
    estimatedValueLowTotal: estimatedValueLowTotal ?? undefined,
    estimatedValueMidTotal: estimatedValueMidTotal ?? undefined,
    estimatedValueHighTotal: estimatedValueHighTotal ?? undefined,
  };
}

function sumNumbers(values: Array<number | undefined>): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0);
}
