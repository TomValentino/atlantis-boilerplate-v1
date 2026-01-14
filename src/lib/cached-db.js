import { db } from "../../database"

let cachedStore = null

export async function getCachedDB() {
  if (!cachedStore) cachedStore = db;
  return cachedStore;
}