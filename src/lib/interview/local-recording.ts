const DB_NAME = "voxara-recordings";
const STORE = "recordings";
const DB_VERSION = 1;

export const LOCAL_RECORDING_PREFIX = "local://";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
  });
}

function localPath(interviewId: string) {
  return `local/${interviewId}/recording`;
}

export function isLocalRecordingRef(value?: string | null) {
  return Boolean(value?.startsWith(LOCAL_RECORDING_PREFIX));
}

export function localRecordingUrl(interviewId: string) {
  return `${LOCAL_RECORDING_PREFIX}${interviewId}`;
}

export async function saveLocalRecording(interviewId: string, blob: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("Failed to save recording"));
    tx.objectStore(STORE).put(
      {
        blob,
        type: blob.type || "audio/webm",
        savedAt: new Date().toISOString(),
      },
      interviewId,
    );
  });
  db.close();

  return {
    url: localRecordingUrl(interviewId),
    path: localPath(interviewId),
  };
}

export async function getLocalRecordingBlob(interviewId: string) {
  const db = await openDb();
  const record = await new Promise<{ blob: Blob; type?: string } | undefined>(
    (resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get(interviewId);
      request.onsuccess = () =>
        resolve(request.result as { blob: Blob; type?: string } | undefined);
      request.onerror = () =>
        reject(request.error ?? new Error("Failed to read recording"));
    },
  );
  db.close();
  return record?.blob ?? null;
}

export async function getLocalRecordingObjectUrl(interviewId: string) {
  const blob = await getLocalRecordingBlob(interviewId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteLocalRecording(interviewId: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Failed to delete recording"));
    tx.objectStore(STORE).delete(interviewId);
  });
  db.close();
}

export function interviewIdFromLocalUrl(url: string) {
  if (!isLocalRecordingRef(url)) return null;
  return url.slice(LOCAL_RECORDING_PREFIX.length) || null;
}
