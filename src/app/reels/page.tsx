"use client";

import { useRef, useState } from "react";
import { Nav } from "@/components/Nav";
import { ActivitySummary } from "@/components/ActivitySummary";
import { savePersisted, loadPersisted, clearPersisted } from "@/lib/persist";
import { logHistoryEntry } from "@/lib/history";

const STORAGE_KEY = "wcg:reelsResult";

interface CaptionsResult {
  clipTopic: string;
  guestName: string | null;
  guestCompany: string | null;
  captionVariants: { style: string; caption: string }[];
  hashtags: string[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-800">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand";

export default function ReelsPage() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaptionsResult | null>(
    () => loadPersisted<CaptionsResult>(STORAGE_KEY)?.data ?? null,
  );
  const [restoredAt, setRestoredAt] = useState<number | null>(
    () => loadPersisted<CaptionsResult>(STORAGE_KEY)?.savedAt ?? null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearInputs() {
    setTranscript("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function startNew() {
    setResult(null);
    setRestoredAt(null);
    clearInputs();
    clearPersisted(STORAGE_KEY);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setTranscript(text);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);
    setRestoredAt(null);
    try {
      const res = await fetch("/api/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      savePersisted(STORAGE_KEY, data);
      logHistoryEntry({
        kind: "reel",
        topic: data.clipTopic,
        counts: {
          captionSets: 1,
          captionOptions: data.captionVariants.length,
          hashtagSets: 1,
        },
      });
      clearInputs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const hashtagsText = result ? result.hashtags.map((h) => `#${h}`).join(" ") : "";

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="animate-fade-up text-2xl font-bold text-slate-900">Reel Captions</h1>
        <p className="animate-fade-up mt-1 text-sm text-slate-600 [animation-delay:60ms]">
          Paste the transcript/script of a reel clip that&apos;s already been cut (e.g. via Opus
          Clip) to get caption options and hashtags.
        </p>

        <div className="animate-fade-up mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm [animation-delay:120ms]">
          <Field label="Clip transcript file (.txt)">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain"
              onChange={handleFile}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
          </Field>

          <Field label="Or paste clip transcript">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              placeholder="Paste the reel clip's transcript/script here..."
              className={inputClass}
            />
          </Field>

          <button
            onClick={handleSubmit}
            disabled={loading || transcript.trim().length < 20}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
              loading ? "animate-shimmer" : "bg-brand hover:bg-brand-dark"
            }`}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Generating…
              </>
            ) : (
              "Generate captions & hashtags"
            )}
          </button>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
        </div>

        {result ? (
          <div className="mt-8 space-y-5">
            {restoredAt ? (
              <div className="animate-fade-in flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                <span>
                  Showing your last generated captions (saved{" "}
                  {new Date(restoredAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  ) — kept in your browser so switching tabs doesn&apos;t lose it or cost another generation.
                </span>
                <button onClick={startNew} className="shrink-0 font-medium text-brand hover:underline">
                  Start new
                </button>
              </div>
            ) : null}

            <div className="animate-fade-up rounded-2xl border border-brand/20 bg-brand/5 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {result.clipTopic}
                  {result.guestName ? (
                    <span className="ml-2 font-normal text-slate-500">
                      with {result.guestName}
                      {result.guestCompany ? `, ${result.guestCompany}` : ""}
                    </span>
                  ) : null}
                </h2>
                {!restoredAt ? (
                  <button onClick={startNew} className="shrink-0 text-xs font-medium text-brand hover:underline">
                    Start new
                  </button>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  <span className="font-bold text-brand">{result.captionVariants.length}</span>
                  caption options
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  <span className="font-bold text-brand">{result.hashtags.length}</span>
                  hashtags
                </div>
              </div>
            </div>

            {result.captionVariants.map((v, i) => (
              <section
                key={i}
                className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                style={{ animationDelay: `${(i + 1) * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-brand">{v.style}</h3>
                  <CopyButton text={`${v.caption}\n\n${hashtagsText}`} />
                </div>
                <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                  {v.caption}
                </pre>
              </section>
            ))}

            <section
              className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              style={{ animationDelay: `${(result.captionVariants.length + 1) * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-brand">Hashtags</h3>
                <CopyButton text={hashtagsText} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{hashtagsText}</p>
            </section>
          </div>
        ) : null}

        <ActivitySummary />
      </main>
    </div>
  );
}
