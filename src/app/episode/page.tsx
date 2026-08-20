"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";

interface Quote {
  text: string;
  speaker: string | null;
  image: string;
}

interface EpisodeResult {
  content: {
    guestName: string | null;
    episodeTopic: string;
    linkedinPost: string;
    blogPost: { title: string; metaDescription: string; body: string };
    newsletter: { subjectLine: string; previewText: string; body: string };
    seoKeywordsUsed: string[];
  };
  postcards: Quote[];
  carousel: { title: string; slides: string[] };
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

export default function EpisodePage() {
  const [transcript, setTranscript] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EpisodeResult | null>(null);

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
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, guestName: guestName || undefined }),
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

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Episode → Content</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload or paste the full podcast transcript below.
        </p>

        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Guest name (optional — helps if the transcript doesn&apos;t state it clearly)
            </label>
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Transcript file (.txt)</label>
            <input
              type="file"
              accept=".txt,.md,text/plain"
              onChange={handleFile}
              className="mt-1 block text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Or paste transcript text
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
              placeholder="Paste the full episode transcript here..."
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">{transcript.length.toLocaleString()} characters</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || transcript.trim().length < 200}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating content… this can take a minute" : "Generate content package"}
          </button>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>

        {result ? (
          <div className="mt-10 space-y-10">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-slate-900">
                {result.content.episodeTopic}
                {result.content.guestName ? (
                  <span className="ml-2 font-normal text-slate-500">with {result.content.guestName}</span>
                ) : null}
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                Keywords used: {result.content.seoKeywordsUsed.join(", ")}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">LinkedIn post</h3>
                <CopyButton text={result.content.linkedinPost} />
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-800">
                {result.content.linkedinPost}
              </pre>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Blog post — {result.content.blogPost.title}</h3>
                <CopyButton text={`# ${result.content.blogPost.title}\n\n${result.content.blogPost.body}`} />
              </div>
              <p className="mt-1 text-xs italic text-slate-500">{result.content.blogPost.metaDescription}</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-800">
                {result.content.blogPost.body}
              </pre>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">
                  Newsletter — {result.content.newsletter.subjectLine}
                </h3>
                <CopyButton text={result.content.newsletter.body} />
              </div>
              <p className="mt-1 text-xs italic text-slate-500">{result.content.newsletter.previewText}</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-slate-800">
                {result.content.newsletter.body}
              </pre>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold text-slate-900">Quote postcards ({result.postcards.length})</h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {result.postcards.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <img src={q.image} alt={q.text} className="w-full rounded-lg border border-slate-200" />
                    <a
                      href={q.image}
                      download={`postcard-${i + 1}.png`}
                      className="block text-center text-xs font-medium text-blue-700 underline"
                    >
                      Download PNG
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-bold text-slate-900">
                Carousel — {result.carousel.title} ({result.carousel.slides.length} slides)
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {result.carousel.slides.map((src, i) => (
                  <div key={i} className="space-y-2">
                    <img src={src} alt={`Slide ${i + 1}`} className="w-full rounded-lg border border-slate-200" />
                    <a
                      href={src}
                      download={`carousel-slide-${i + 1}.png`}
                      className="block text-center text-xs font-medium text-blue-700 underline"
                    >
                      Download PNG
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
