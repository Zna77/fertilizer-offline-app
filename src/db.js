const CONFIG = {
  DB_NAME: "fertilizer_app_db",
  DB_VERSION: 2,
  STORE_PROGRAMS: "programs",
  STORE_HISTORY: "history",
  STORE_TEMPLATES: "templates",
};

let db = null;

function getStore(storeName, mode) {
  if (!db) throw new Error("Database not initialized.");
  return db.transaction(storeName, mode).objectStore(storeName);
}

export async function openDb() {
  if (!("indexedDB" in window)) {
    throw new Error("IndexedDB is not supported in this browser.");
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CONFIG.DB_NAME, CONFIG.DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CONFIG.STORE_PROGRAMS)) {
        const store = database.createObjectStore(CONFIG.STORE_PROGRAMS, {
          keyPath: "code",
        });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      if (!database.objectStoreNames.contains(CONFIG.STORE_HISTORY)) {
        const store = database.createObjectStore(CONFIG.STORE_HISTORY, {
          keyPath: "id",
        });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!database.objectStoreNames.contains(CONFIG.STORE_TEMPLATES)) {
        const store = database.createObjectStore(CONFIG.STORE_TEMPLATES, {
          keyPath: "id",
        });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };

    request.onerror = () => reject(request.error || new Error("Database error."));

    request.onblocked = () =>
      reject(
        new Error(
          "Database upgrade blocked. Close other tabs running this app."
        )
      );

    request.onsuccess = () => {
      db = request.result;
      db.onversionchange = () => {
        db.close();
        db = null;
      };
      resolve(db);
    };
  });
}

export function isDbReady() {
  return !!db;
}

export async function putProgram(program) {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_PROGRAMS, "readwrite").put(program);
    request.onsuccess = () => resolve(program);
    request.onerror = () => reject(request.error || new Error("Save failed."));
  });
}

export async function getProgram(code) {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_PROGRAMS, "readonly").get(code);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Read failed."));
  });
}

export async function deleteProgram(code) {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_PROGRAMS, "readwrite").delete(code);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Delete failed."));
  });
}

export async function getAllPrograms() {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_PROGRAMS, "readonly").getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("Read failed."));
  });
}

export async function putTemplate(template) {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_TEMPLATES, "readwrite").put(template);
    request.onsuccess = () => resolve(template);
    request.onerror = () =>
      reject(request.error || new Error("Template save failed."));
  });
}

export async function deleteTemplate(id) {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_TEMPLATES, "readwrite").delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () =>
      reject(request.error || new Error("Template delete failed."));
  });
}

export async function getAllTemplates() {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_TEMPLATES, "readonly").getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(request.error || new Error("Template read failed."));
  });
}

export async function putHistoryEntry(entry) {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_HISTORY, "readwrite").put(entry);
    request.onsuccess = () => resolve(entry);
    request.onerror = () =>
      reject(request.error || new Error("History save failed."));
  });
}

export async function deleteHistoryEntry(id) {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_HISTORY, "readwrite").delete(id);
    request.onsuccess = () => resolve(true);
    request.onerror = () =>
      reject(request.error || new Error("History delete failed."));
  });
}

export async function clearHistory() {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_HISTORY, "readwrite").clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () =>
      reject(request.error || new Error("History clear failed."));
  });
}

export async function getAllHistory() {
  return new Promise((resolve, reject) => {
    const request = getStore(CONFIG.STORE_HISTORY, "readonly").getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () =>
      reject(request.error || new Error("History read failed."));
  });
}

export { CONFIG };
