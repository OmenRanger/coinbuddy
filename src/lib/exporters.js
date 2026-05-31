import { createId, nowIso } from "../data/schema.js";
import { getCollectionStats } from "./coinUtils.js";

export function buildCollectionReport(coins = [], notes = "") {
  const stats = getCollectionStats(coins);

  return {
    id: createId("report"),
    title: "CoinBuddy Collection Report",
    createdAt: nowIso(),
    coinIds: coins.map((coin) => coin.id),
    totalEstimatedLow: stats.totalEstimatedLow,
    totalEstimatedMid: stats.totalEstimatedMid,
    totalEstimatedHigh: stats.totalEstimatedHigh,
    notes
  };
}

export function exportCoinsAsJson(coins = []) {
  return JSON.stringify(
    {
      app: "CoinBuddy",
      version: "0.1.0",
      exportedAt: nowIso(),
      report: buildCollectionReport(coins, "Exported from local-first CoinBuddy MVP."),
      coins
    },
    null,
    2
  );
}

export function exportCoinsAsCsv(coins = []) {
  const headers = [
    "Name",
    "Country",
    "Denomination",
    "Year",
    "Mint Mark",
    "Condition",
    "Estimate Low",
    "Estimate Mid",
    "Estimate High",
    "Confidence",
    "Storage Location",
    "Acquisition Date",
    "Acquisition Source",
    "Needs Review",
    "Favorite",
    "Notes"
  ];

  const rows = coins.map((coin) => [
    coin.name,
    coin.country,
    coin.denomination,
    coin.year,
    coin.mintMark,
    coin.condition,
    coin.estimatedValueLow,
    coin.estimatedValueMid,
    coin.estimatedValueHigh,
    coin.valueConfidence,
    coin.storageLocation,
    coin.acquisitionDate,
    coin.acquisitionSource,
    coin.needsReview ? "Yes" : "No",
    coin.favorite ? "Yes" : "No",
    coin.notes
  ]);

  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export function csvCell(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function parseCoinBuddyJson(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.coins)) {
    throw new Error("This file does not look like a CoinBuddy export.");
  }

  return parsed.coins;
}
