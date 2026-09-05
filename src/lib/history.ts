const HISTORY_KEY = "wcg:history";
const MAX_ENTRIES = 500;

export interface HistoryEntry {
  savedAt: number;
  kind: "episode" | "reel";
  topic: string;
  guestName?: string | null;
  counts: Record<string, number>;
}

function readAll(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Appends a lightweight record (timestamp, topic, and format counts only — never the
 * generated text/images) so the log stays a few hundred bytes per entry and can hold
 * hundreds of generations without approaching storage limits. Newest first, capped.
 */
export function logHistoryEntry(entry: Omit<HistoryEntry, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const entries = readAll();
    entries.unshift({ ...entry, savedAt: Date.now() });
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage full/unavailable — skip logging this entry rather than breaking generation.
  }
}

export function getHistoryEntries(): HistoryEntry[] {
  return readAll();
}

/** Clears the whole log, or only entries of one kind (leaving the other kind's log intact). */
export function clearHistory(kind?: HistoryEntry["kind"]): void {
  if (typeof window === "undefined") return;
  try {
    if (!kind) {
      window.localStorage.removeItem(HISTORY_KEY);
      return;
    }
    const remaining = readAll().filter((e) => e.kind !== kind);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(remaining));
  } catch {
    // ignore
  }
}
