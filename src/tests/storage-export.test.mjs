import test from "node:test";
import assert from "node:assert/strict";
import { createCoin } from "../data/schema.js";
import { filterCoins, getCollectionStats, searchCoins, sortCoins } from "../lib/coinUtils.js";
import { csvCell, exportCoinsAsCsv, exportCoinsAsJson, parseCoinBuddyJson } from "../lib/exporters.js";
import { COINS_KEY, createMemoryStore, loadCoins, removeCoin, saveCoins, upsertCoin } from "../lib/storage.js";

test("storage can save add update and remove coins", () => {
  const store = createMemoryStore();
  const coin = createCoin({ id: "coin-a", name: "Mercury dime", year: "1942" });

  saveCoins([coin], store);
  assert.equal(loadCoins(store).length, 1);

  const updated = { ...coin, storageLocation: "Red box" };
  upsertCoin(updated, store);
  assert.equal(loadCoins(store)[0].storageLocation, "Red box");

  removeCoin(coin.id, store);
  assert.equal(loadCoins(store).length, 0);
  assert.equal(JSON.parse(store.getItem(COINS_KEY)).length, 0);
});

test("search sort and filter collection records", () => {
  const coins = [
    createCoin({ id: "coin-1", name: "Wheat cent", year: "1909", needsReview: true, estimatedValueMid: 100 }),
    createCoin({ id: "coin-2", name: "Buffalo nickel", year: "1937", favorite: true, estimatedValueMid: 25 })
  ];

  assert.equal(searchCoins(coins, "wheat").length, 1);
  assert.equal(filterCoins(coins, "favorites")[0].name, "Buffalo nickel");
  assert.equal(sortCoins(coins, "value")[0].name, "Wheat cent");
});

test("collection stats include totals and useful counts", () => {
  const coins = [
    createCoin({ name: "Coin A", country: "United States", estimatedValueLow: 10, estimatedValueMid: 20, estimatedValueHigh: 30 }),
    createCoin({ name: "Coin B", country: "Canada", estimatedValueLow: 5, estimatedValueMid: 8, estimatedValueHigh: 12, needsReview: true })
  ];
  const stats = getCollectionStats(coins);

  assert.equal(stats.totalCoins, 2);
  assert.equal(stats.totalEstimatedMid, 28);
  assert.equal(stats.needsReview, 1);
  assert.equal(stats.byCountry["United States"], 1);
});

test("exports create valid JSON and CSV", () => {
  const coins = [createCoin({ name: 'Quoted "Coin"', country: "United States", estimatedValueMid: 12 })];
  const json = exportCoinsAsJson(coins);
  const parsed = parseCoinBuddyJson(json);
  const csv = exportCoinsAsCsv(coins);

  assert.equal(parsed[0].name, 'Quoted "Coin"');
  assert.match(csv, /"Quoted ""Coin"""/);
  assert.match(csv, /"Estimate Mid"/);
});

test("CSV cells escape quotes", () => {
  assert.equal(csvCell('a "quoted" value'), '"a ""quoted"" value"');
});
