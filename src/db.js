// ============================================================
// db.js — обёртка над IndexedDB
// ============================================================

const DB_NAME    = 'razl_app';
const DB_VERSION = 1;
const STORE      = 'state';
const KEY        = 'main';

let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE);
    };

    req.onsuccess = e => {
      _db = e.target.result;
      resolve(_db);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function dbGet() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(KEY);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  });
}

export async function dbSet(value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put(value, KEY);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}
