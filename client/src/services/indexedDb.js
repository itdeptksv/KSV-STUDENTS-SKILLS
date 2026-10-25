/**
 * indexedDb.js — IndexedDB storage service for uploaded files and photo binary data.
 * Used for Skills Areas performance evidence and gallery photos/media in local-only mode.
 */

const DB_NAME = 'ksv_skill_sets_storage';
const DB_VERSION = 1;
const STORE_FILES = 'files';

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      resolve(null);
    };
  });

  return dbPromise;
}

/**
 * Convert a File/Blob to a Data URL (base64 string)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    if (typeof file === 'string') return resolve(file);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Save an uploaded file or photo with its description into IndexedDB
 * @param {File|Blob|Object} file
 * @param {string} description - Photo or file description
 * @returns {Promise<{id: string, name: string, type: string, size: number, description: string, createdAt: string, dataUrl: string}>}
 */
export async function storeFile(file, description = '') {
  const id = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const name = file.name || (file.type?.startsWith('image/') ? 'photo.jpg' : 'attachment.dat');
  const type = file.type || 'application/octet-stream';
  const size = file.size || 0;

  let dataUrl = '';
  try {
    dataUrl = await fileToDataUrl(file);
  } catch (err) {
    console.warn('Failed to read file as dataUrl:', err);
  }

  const record = {
    id,
    name,
    type,
    size,
    description: description || '',
    dataUrl,
    createdAt: new Date().toISOString(),
  };

  const db = await getDB();
  if (db) {
    await new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(STORE_FILES, 'readwrite');
        const store = tx.objectStore(STORE_FILES);
        const req = store.put(record);
        req.onsuccess = () => resolve(record);
        req.onerror = () => reject(req.error);
      } catch (err) {
        console.warn('IndexedDB put transaction error:', err);
        resolve(record);
      }
    });
  }

  return record;
}

/**
 * Retrieve a file record from IndexedDB by id
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getFile(id) {
  if (!id) return null;
  const db = await getDB();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Retrieve the data URL for preview or download
 * @param {string} id
 * @returns {Promise<string|null>}
 */
export async function getFileDataUrl(id) {
  const file = await getFile(id);
  return file?.dataUrl || null;
}

/**
 * Delete a file record from IndexedDB
 * @param {string} id
 */
export async function deleteFile(id) {
  if (!id) return false;
  const db = await getDB();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readwrite');
      const store = tx.objectStore(STORE_FILES);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * List all stored file metadata (without full binary data)
 */
export async function listFiles() {
  const db = await getDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result || []).map(({ dataUrl, ...meta }) => meta);
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}
