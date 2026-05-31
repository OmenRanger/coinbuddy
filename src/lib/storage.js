import { defaultAuctionSources } from "../data/auctionSources.js";

export const COINS_KEY = "coinbuddy.coins.v1";
export const AUCTION_SOURCES_KEY = "coinbuddy.auctionSources.v1";
export const THEME_KEY = "coinbuddy.theme.v1";

export function loadCoins(store = getStorage()) {
  return readJson(store, COINS_KEY, []);
}

export function saveCoins(coins, store = getStorage()) {
  writeJson(store, COINS_KEY, coins);
  return coins;
}

export function upsertCoin(coin, store = getStorage()) {
  const coins = loadCoins(store);
  const index = coins.findIndex((item) => item.id === coin.id);
  const nextCoins = index >= 0 ? coins.with(index, coin) : [coin, ...coins];
  saveCoins(nextCoins, store);
  return nextCoins;
}

export function removeCoin(id, store = getStorage()) {
  const nextCoins = loadCoins(store).filter((coin) => coin.id !== id);
  saveCoins(nextCoins, store);
  return nextCoins;
}

export function loadAuctionSources(store = getStorage()) {
  const userSources = readJson(store, AUCTION_SOURCES_KEY, []);
  return mergeSources(defaultAuctionSources, userSources);
}

export function saveAuctionSources(sources, store = getStorage()) {
  const userSources = sources.filter((source) => !defaultAuctionSources.some((item) => item.id === source.id));
  writeJson(store, AUCTION_SOURCES_KEY, userSources);
  return sources;
}

export function loadTheme(store = getStorage()) {
  return store?.getItem(THEME_KEY) || "classic";
}

export function saveTheme(theme, store = getStorage()) {
  store?.setItem(THEME_KEY, theme);
}

export function storageStatus(store = getStorage()) {
  const coins = loadCoins(store);
  const sources = loadAuctionSources(store);
  return {
    coins: coins.length,
    sources: sources.length,
    available: Boolean(store)
  };
}

export function createMemoryStore(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    }
  };
}

function getStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function readJson(store, key, fallback) {
  if (!store) {
    return fallback;
  }

  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(store, key, value) {
  if (!store) {
    return;
  }

  store.setItem(key, JSON.stringify(value));
}

function mergeSources(defaults, userSources) {
  const byId = new Map(defaults.map((source) => [source.id, source]));
  userSources.forEach((source) => byId.set(source.id, source));
  return [...byId.values()];
}
