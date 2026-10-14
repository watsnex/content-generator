const HISTORY_KEY = "wcg:history";
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  savedAt: number;
  kind: "episode" | "reel";
  topic: string;
  guestName?: string | null;
  counts: Record<string, number>;
  /** Full API response for this generation (EpisodeResult or CaptionsResult, by kind) — lets a log entry be reopened and reused. Validate before trusting its shape, same as any other localStorage read. */
  content: unknown;
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
 * Appends a full entry (including the generated content, so it can be reopened later)
 * and writes it back. Unlike the old metadata-only log, these entries carry real
 * weight (images for episode entries especially), so a straight write can exceed
 * localStorage's quota. On failure, evict the oldest entry and retry — repeating
 * until it fits or nothing is left — rather than losing the newest generation or
 * crashing the app over a storage limit.
 */
export function logHistoryEntry(entry: Omit<HistoryEntry, "savedAt">): void {
  if (typeof window === "undefined") return;
  let entries = readAll();
  entries.unshift({ ...entry, savedAt: Date.now() });
  entries = entries.slice(0, MAX_ENTRIES);

  while (entries.length > 0) {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
      return;
    } catch {
      entries.pop();
    }
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
