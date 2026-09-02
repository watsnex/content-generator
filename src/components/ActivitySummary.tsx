"use client";

import { useEffect, useState } from "react";
import { getHistoryEntries, getHistoryTotals, clearHistory, type HistoryEntry } from "@/lib/history";

const FORMAT_LABELS: Record<string, string> = {
  linkedinPosts: "LinkedIn posts",
  blogPosts: "Blog posts",
  newsletters: "Newsletters",
  postcards: "Postcards",
  carouselSlides: "Carousel slides",
  captionSets: "Caption sets",
  hashtagSets: "Hashtag sets",
};
const FORMAT_ORDER = Object.keys(FORMAT_LABELS);

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function ActivitySummary() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => getHistoryEntries());
  const [totals, setTotals] = useState<Record<string, number>>(() => getHistoryTotals());

  useEffect(() => {
    // A generation in another tab (e.g. /episode) writes to localStorage but doesn't
    // touch this tab's React state — re-read whenever that happens, or whenever this
    // tab regains focus (covers cached/backgrounded tabs missing the storage event).
    function refresh() {
      setEntries(getHistoryEntries());
      setTotals(getHistoryTotals());
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  if (entries.length === 0) return null;

  function handleClear() {
    clearHistory();
    setEntries([]);
    setTotals({});
  }

  return (
    <div className="animate-fade-up mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm [animation-delay:300ms]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Activity</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {entries.length} generation{entries.length === 1 ? "" : "s"} on this device — kept locally,
            never sent anywhere.
          </p>
        </div>
        <button onClick={handleClear} className="shrink-0 text-xs font-medium text-slate-400 hover:text-brand hover:underline">
          Clear log
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FORMAT_ORDER.filter((key) => totals[key]).map((key) => (
          <div
            key={key}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
          >
            <span className="font-bold text-brand">{totals[key]}</span>
            {FORMAT_LABELS[key]}
          </div>
        ))}
      </div>

      <div className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
        {entries.slice(0, 5).map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <div className="min-w-0">
              <span className="font-medium text-slate-800">{entry.topic}</span>
              {entry.guestName ? <span className="text-slate-400"> · {entry.guestName}</span> : null}
            </div>
            <span className="shrink-0 text-xs text-slate-400">{timeAgo(entry.savedAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
