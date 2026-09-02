interface Envelope<T> {
  savedAt: number;
  data: T;
}

/** Saves to localStorage, silently no-op'ing if storage is full or unavailable. */
export function savePersisted<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: Envelope<T> = { savedAt: Date.now(), data };
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // Storage full or unavailable (private browsing, etc.) — just skip persisting.
  }
}

/**
 * Loads from localStorage; returns null (and clears the entry) if missing or corrupt.
 * Pass maxAgeMs to also expire entries older than that — omit it to keep indefinitely
 * (the caller writes to a single fixed key, so it never grows; it just sits there until
 * overwritten by the next generation, or evicted by the browser if storage runs out).
 */
export function loadPersisted<T>(key: string, maxAgeMs?: number): { data: T; savedAt: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const envelope = JSON.parse(raw) as Envelope<T>;
    if (maxAgeMs !== undefined && Date.now() - envelope.savedAt > maxAgeMs) {
      window.localStorage.removeItem(key);
      return null;
    }
    return envelope;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

export function clearPersisted(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
