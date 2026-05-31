import { createId, nowIso, toNumberOrUndefined } from "../data/schema.js";

export function normalizeValueSource(input = {}) {
  return {
    id: input.id || createId("source"),
    sourceName: String(input.sourceName || "Comparable sale").trim(),
    sourceUrl: String(input.sourceUrl || "").trim(),
    saleDate: String(input.saleDate || "").trim(),
    observedPrice: toNumberOrUndefined(input.observedPrice),
    notes: String(input.notes || "").trim()
  };
}

export function calculateEstimateFromSources(sources = []) {
  const normalized = sources.map(normalizeValueSource);
  const prices = normalized
    .map((source) => source.observedPrice)
    .filter((price) => typeof price === "number" && Number.isFinite(price) && price >= 0)
    .sort((a, b) => a - b);

  if (!prices.length) {
    return {
      low: undefined,
      mid: undefined,
      high: undefined,
      confidence: "low",
      sourceCount: 0,
      reason: "Add sale examples to calculate an estimated market range."
    };
  }

  const low = prices[0];
  const high = prices[prices.length - 1];
  const mid = roundCurrency(prices.reduce((sum, price) => sum + price, 0) / prices.length);
  const confidence = prices.length >= 5 ? "high" : prices.length >= 3 ? "medium" : "low";

  return {
    low: roundCurrency(low),
    mid,
    high: roundCurrency(high),
    confidence,
    sourceCount: prices.length,
    reason: `${prices.length} comparable sale${prices.length === 1 ? "" : "s"} entered by the user.`
  };
}

export function applyEstimateToCoin(coin, sources = []) {
  const normalizedSources = sources.map(normalizeValueSource);
  const estimate = calculateEstimateFromSources(normalizedSources);

  return {
    ...coin,
    estimatedValueLow: estimate.low,
    estimatedValueMid: estimate.mid,
    estimatedValueHigh: estimate.high,
    valueConfidence: estimate.confidence,
    valueSources: normalizedSources,
    updatedAt: nowIso()
  };
}

export function roundCurrency(value) {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return undefined;
  }

  return Math.round(Number(value) * 100) / 100;
}
