import test from "node:test";
import assert from "node:assert/strict";
import { applyEstimateToCoin, calculateEstimateFromSources } from "../lib/valuation.js";

test("value estimator calculates low mid high and confidence", () => {
  const estimate = calculateEstimateFromSources([
    { sourceName: "Sale A", observedPrice: 12 },
    { sourceName: "Sale B", observedPrice: 18 },
    { sourceName: "Sale C", observedPrice: 30 }
  ]);

  assert.equal(estimate.low, 12);
  assert.equal(estimate.mid, 20);
  assert.equal(estimate.high, 30);
  assert.equal(estimate.confidence, "medium");
});

test("value estimator handles empty sources safely", () => {
  const estimate = calculateEstimateFromSources([]);

  assert.equal(estimate.low, undefined);
  assert.equal(estimate.sourceCount, 0);
  assert.equal(estimate.confidence, "low");
});

test("applying estimate updates coin value fields", () => {
  const coin = { id: "coin-1", name: "Test coin", createdAt: "2026-01-01T00:00:00.000Z" };
  const updated = applyEstimateToCoin(coin, [
    { sourceName: "Sale A", observedPrice: 5 },
    { sourceName: "Sale B", observedPrice: 15 }
  ]);

  assert.equal(updated.estimatedValueLow, 5);
  assert.equal(updated.estimatedValueMid, 10);
  assert.equal(updated.estimatedValueHigh, 15);
  assert.equal(updated.valueSources.length, 2);
});
