const HISTORY_KEY = "wcg:history";
const MAX_ENTRIES = 50;

/**
 * Hard ceiling on the raw JSON string's length before we'll even attempt to parse
 * it. JSON.parse is synchronous and blocks the main thread — on a multi-megabyte
 * string (e.g. history logged before full-content caps existed, during the window
 * where every entry kept unbounded content) this can freeze the tab for long enough
 * to trigger the browser's "Page Unresponsive" dialog. If we ever see something
 * this large, treat it as unrecoverable bloat and clear it rather than risk a hang.
 */
const MAX_RAW_CHARS = 2_000_000;

/**
 * How many of the most recent entries of each kind keep their full reopenable
 * content. Reel entries are plain text (cheap), episode entries carry postcard/
 * carousel images (expensive), so episodes get a much tighter cap. Entries beyond
 * their kind's cap still appear in the log with their stats — they just can't be
 * reopened, same as entries logged before this feature existed. This keeps storage
 * bounded and predictable instead of reactively evicting whatever doesn't fit.
 */
const MAX_FULL_CONTENT_BY_KIND: Record<HistoryEntry["kind"], number> = {
  episode: 8,
  reel: 30,
};

export interface HistoryEntry {
  savedAt: number;
  kind: "episode" | "reel";
  topic: string;
  guestName?: string | null;
  counts: Record<string, number>;
  /** Full API response for this generation (EpisodeResult or CaptionsResult, by kind) — lets a log entry be reopened and reused. Validate before trusting its shape, same as any other localStorage read. Absent/undefined once an entry ages past its kind's full-content cap. */
  content?: unknown;
}

function capFullContent(entries: HistoryEntry[]): HistoryEntry[] {
  const seenByKind: Record<string, number> = {};
  return entries.map((e) => {
    seenByKind[e.kind] = (seenByKind[e.kind] ?? 0) + 1;
    const cap = MAX_FULL_CONTENT_BY_KIND[e.kind] ?? 0;
    if (seenByKind[e.kind] > cap && e.content !== undefined) {
      return { ...e, content: undefined };
    }
    return e;
  });
}

function readAll(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    if (raw.length > MAX_RAW_CHARS) {
      // Parsing this synchronously risks hanging the tab. This can only happen from
      // data written before full-content caps existed — clear it and start fresh.
      window.localStorage.removeItem(HISTORY_KEY);
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Self-heal: re-apply the cap even to data that was already on disk, in case it
    // predates the cap or the cap itself changes. Only re-write if it actually
    // trimmed something, so a normal read stays a pure read.
    const capped = capFullContent(parsed);
    const changed = capped.some((e, i) => e.content !== parsed[i]?.content);
    if (changed) {
      try {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(capped));
      } catch {
        // Best-effort — still return the capped-in-memory version either way.
      }
    }
    return capped;
  } catch {
    return [];
  }
}

function stripOldestContentOfKind(entries: HistoryEntry[], kind: HistoryEntry["kind"]): boolean {
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].kind === kind && entries[i].content !== undefined) {
      entries[i] = { ...entries[i], content: undefined };
      return true;
    }
  }
  return false;
}

/**
 * Appends a full entry (including the generated content, so it can be reopened
 * later) and writes it back. Caps full-content retention per kind up front (see
 * MAX_FULL_CONTENT_BY_KIND) so storage use stays predictable. If a write still
 * doesn't fit — unusually large content, a tight quota — content is stripped from
 * the oldest entries first (never whole entries) and only as an absolute last
 * resort are entries themselves dropped, oldest first. This never wipes the log
 * out from under a generation that isn't even involved.
 */
export function logHistoryEntry(entry: Omit<HistoryEntry, "savedAt">): void {
  if (typeof window === "undefined") return;
  let entries = readAll();
  entries.unshift({ ...entry, savedAt: Date.now() });
  entries = capFullContent(entries.slice(0, MAX_ENTRIES));

  while (entries.length > 0) {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
      return;
    } catch {
      if (stripOldestContentOfKind(entries, "episode") || stripOldestContentOfKind(entries, "reel")) {
        continue;
      }
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
