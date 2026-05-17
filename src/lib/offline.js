// Offline-First Capabilities
import { openDB } from "idb";

const DB_NAME = "InnoVisionOffline";
const DB_VERSION = 1;

/**
 * Check if IndexedDB is available (blocked in private/incognito mode)
 */
export async function isIndexedDBAvailable() {
  try {
    const testDB = await openDB("__idb_test__", 1);
    testDB.close();
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Initialize IndexedDB for offline storage
 */
export async function initOfflineDB() {
  const available = await isIndexedDBAvailable();
  if (!available) {
    throw new Error(
      "Offline storage is not available in private/incognito mode. Please switch to a regular browser window to use offline features."
    );
  }
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Courses store
      if (!db.objectStoreNames.contains("courses")) {
        db.createObjectStore("courses", { keyPath: "id" });
      }

      // Progress store
      if (!db.objectStoreNames.contains("progress")) {
        const progressStore = db.createObjectStore("progress", { keyPath: "id", autoIncrement: true });
        progressStore.createIndex("synced", "synced");
        progressStore.createIndex("timestamp", "timestamp");
      }

      // Cache store
      if (!db.objectStoreNames.contains("cache")) {
        db.createObjectStore("cache", { keyPath: "url" });
      }
    },
  });
}

/**
 * Save course for offline access
 */
export async function saveCourseOffline(course) {
  const db = await initOfflineDB();
  await db.put("courses", {
    ...course,
    downloadedAt: Date.now(),
  });
}

/**
 * Get offline courses
 */
export async function getOfflineCourses() {
  const db = await initOfflineDB();
  return db.getAll("courses");
}

/**
 * Save progress offline (to sync later)
 */
export async function saveProgressOffline(progress) {
  const db = await initOfflineDB();
  await db.add("progress", {
    ...progress,
    synced: 0,
    timestamp: Date.now(),
  });
}

/**
 * Get unsynced progress
 */
export async function getUnsyncedProgress() {
  const db = await initOfflineDB();
  const tx = db.transaction("progress", "readonly");
  const index = tx.store.index("synced");
  return index.getAll(0);
}

/**
 * Mark progress as synced
 */
export async function markProgressSynced(progressId) {
  const db = await initOfflineDB();
  const progress = await db.get("progress", progressId);
  if (progress) {
    progress.synced = 1;
    await db.put("progress", progress);
  }
}

/**
 * Sync offline data when online
 */
export async function syncOfflineData() {
  if (!navigator.onLine) {
    return { success: false, message: "Device is offline" };
  }

  const unsyncedProgress = await getUnsyncedProgress();
  const results = [];

  for (const progress of unsyncedProgress) {
    try {
      const response = await fetch("/api/progress/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
      });

      if (response.ok) {
        await markProgressSynced(progress.id);
        results.push({ id: progress.id, success: true });
      } else {
        results.push({ id: progress.id, success: false, error: "Sync failed" });
      }
    } catch (error) {
      results.push({ id: progress.id, success: false, error: error.message });
    }
  }

  return { success: true, results };
}

/**
 * Check if device is online and setup listeners
 */
export function setupOfflineListeners(onOnline, onOffline) {
  window.addEventListener("online", () => {
    console.log("Device is online");
    syncOfflineData();
    if (onOnline) onOnline();
  });

  window.addEventListener("offline", () => {
    console.log("Device is offline");
    if (onOffline) onOffline();
  });
}