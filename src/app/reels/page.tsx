"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";

interface CaptionsResult {
  clipTopic: string;
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
      className="rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function ReelsPage() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CaptionsResult | null>(null);

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
    try {
      const res = await fetch("/api/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
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
        <h1 className="text-2xl font-bold text-slate-900">Reel Captions</h1>
        <p className="mt-1 text-sm text-slate-600">
          Paste the transcript/script of a reel clip that&apos;s already been cut (e.g. via Opus
          Clip) to get caption options and hashtags.
        </p>

        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Clip transcript file (.txt)</label>
            <input
              type="file"
              accept=".txt,.md,text/plain"
              onChange={handleFile}
              className="mt-1 block text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Or paste clip transcript</label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              placeholder="Paste the reel clip's transcript/script here..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || transcript.trim().length < 20}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate captions & hashtags"}
          </button>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        {result ? (
          <div className="mt-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900">{result.clipTopic}</h2>

            {result.captionVariants.map((v, i) => (
              <section key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-blue-700">{v.style}</h3>
                  <CopyButton text={`${v.caption}\n\n${hashtagsText}`} />
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-slate-800">{v.caption}</pre>
              </section>
            ))}

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Hashtags</h3>
                <CopyButton text={hashtagsText} />
              </div>
              <p className="mt-2 text-sm text-slate-700">{hashtagsText}</p>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
