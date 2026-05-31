import { openDB, type IDBPDatabase } from 'idb';
import type { Coin } from './types';

const DB_NAME = 'coinbuddy';
const DB_VERSION = 1;

type CoinBuddyDb = {
  coins: {
    key: string;
    value: Coin;
    indexes: { 'by-createdAt': string };
  };
};

let dbPromise: Promise<IDBPDatabase<CoinBuddyDb>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<CoinBuddyDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const coinStore = db.createObjectStore('coins', { keyPath: 'id' });
        coinStore.createIndex('by-createdAt', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function listCoins(): Promise<Coin[]> {
  const db = await getDb();
  const coins = await db.getAll('coins');
  // newest first
  return coins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCoin(id: string): Promise<Coin | undefined> {
  const db = await getDb();
  return (await db.get('coins', id)) ?? undefined;
}

export async function upsertCoin(coin: Coin): Promise<void> {
  const db = await getDb();
  await db.put('coins', coin);
}

export async function deleteCoin(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('coins', id);
}
