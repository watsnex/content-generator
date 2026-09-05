"use client";

import { useRef, useState } from "react";
import { Nav } from "@/components/Nav";
import { ActivitySummary } from "@/components/ActivitySummary";
import { savePersisted, loadPersisted, clearPersisted } from "@/lib/persist";
import { logHistoryEntry } from "@/lib/history";

const STORAGE_KEY = "wcg:episodeResult";

interface Quote {
  text: string;
  speaker: string | null;
  image: string;
}

interface LinkedInShortPost {
  angle: string;
  post: string;
}

interface EpisodeResult {
  content: {
    guestName: string | null;
    guestCompany: string | null;
    episodeTopic: string;
    linkedinPost: string;
    linkedinShortPosts: LinkedInShortPost[];
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
      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-800">{label}</label>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand";

function Section({
  title,
  eyebrow,
  action,
  delay = 0,
  children,
}: {
  title: React.ReactNode;
  eyebrow?: string;
  action?: React.ReactNode;
  delay?: number;
  children: React.ReactNode;
}) {
  return (
    <section
      className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <div className="text-xs font-semibold uppercase tracking-wide text-brand">{eyebrow}</div>
          ) : null}
          <h3 className="mt-0.5 text-base font-bold text-slate-900">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function EpisodePage() {
  const [transcript, setTranscript] = useState("");
  const [guestName, setGuestName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EpisodeResult | null>(
    () => loadPersisted<EpisodeResult>(STORAGE_KEY)?.data ?? null,
  );
  const [restoredAt, setRestoredAt] = useState<number | null>(
    () => loadPersisted<EpisodeResult>(STORAGE_KEY)?.savedAt ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  function clearInputs() {
    setTranscript("");
    setGuestName("");
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
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, guestName: guestName || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      savePersisted(STORAGE_KEY, data);
      logHistoryEntry({
        kind: "episode",
        topic: data.content.episodeTopic,
        guestName: data.content.guestName,
        counts: {
          linkedinPosts: 1 + data.content.linkedinShortPosts.length,
          blogPosts: 1,
          newsletters: 1,
          postcards: data.postcards.length,
          carouselSlides: data.carousel.slides.length,
        },
      });
      clearInputs();
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
        <h1 className="animate-fade-up text-2xl font-bold text-slate-900">Episode → Content</h1>
        <p className="animate-fade-up mt-1 text-sm text-slate-600 [animation-delay:60ms]">
          Upload or paste the full podcast transcript below.
        </p>

        <div className="animate-fade-up mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm [animation-delay:120ms]">
          <Field label="Guest name" hint="Optional — helps if the transcript doesn't state it clearly">
            <input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
              className={inputClass}
            />
          </Field>

          <Field label="Transcript file (.txt)">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/plain"
              onChange={handleFile}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
          </Field>

          <Field label="Or paste transcript text">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={10}
              placeholder="Paste the full episode transcript here..."
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-slate-400">{transcript.length.toLocaleString()} characters</p>
          </Field>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={loading || transcript.trim().length < 200}
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
                  Generating… this can take a minute
                </>
              ) : (
                "Generate content package"
              )}
            </button>
            {transcript.trim().length > 0 && transcript.trim().length < 200 ? (
              <span className="text-xs text-slate-400">Add a bit more transcript to generate (min. 200 characters)</span>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : null}
        </div>

        {result ? (
          <div className="mt-10 space-y-6">
            {restoredAt ? (
              <div className="animate-fade-in flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                <span>
                  Showing your last generated package (saved{" "}
                  {new Date(restoredAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  ) — kept in your browser so switching tabs doesn&apos;t lose it or cost another generation.
                </span>
                <button
                  onClick={startNew}
                  className="shrink-0 font-medium text-brand hover:underline"
                >
                  Start new
                </button>
              </div>
            ) : null}

            <div className="animate-fade-up rounded-2xl border border-brand/20 bg-brand/5 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  {result.content.episodeTopic}
                  {result.content.guestName ? (
                    <span className="ml-2 font-normal text-slate-500">
                      with {result.content.guestName}
                      {result.content.guestCompany ? `, ${result.content.guestCompany}` : ""}
                    </span>
                  ) : null}
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-500">Keywords: {result.content.seoKeywordsUsed.join(", ")}</p>
                  {!restoredAt ? (
                    <button onClick={startNew} className="shrink-0 text-xs font-medium text-brand hover:underline">
                      Start new
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["LinkedIn posts", 1 + result.content.linkedinShortPosts.length],
                  ["Blog post", 1],
                  ["Newsletter", 1],
                  ["Quote postcards", result.postcards.length],
                  ["Carousel slides", result.carousel.slides.length],
                ].map(([label, count]) => (
                  <div
                    key={label as string}
                    className="flex items-center gap-1.5 rounded-full border border-brand/20 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    <span className="font-bold text-brand">{count}</span>
                    {label}
                  </div>
                ))}
                <div className="flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
                  {3 +
                    result.content.linkedinShortPosts.length +
                    result.postcards.length +
                    result.carousel.slides.length}{" "}
                  pieces from one transcript
                </div>
              </div>
            </div>

            <Section
              delay={60}
              eyebrow="Long-form · LinkedIn"
              title="Long-form post"
              action={<CopyButton text={result.content.linkedinPost} />}
            >
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {result.content.linkedinPost}
              </pre>
            </Section>

            <Section delay={90} eyebrow="Short-form · LinkedIn" title="3 more ways to post this">
              <div className="mt-3 space-y-4">
                {result.content.linkedinShortPosts.map((variant, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                        {variant.angle}
                      </span>
                      <CopyButton text={variant.post} />
                    </div>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                      {variant.post}
                    </pre>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              delay={120}
              eyebrow="Long-form"
              title={`Blog post — ${result.content.blogPost.title}`}
              action={<CopyButton text={`# ${result.content.blogPost.title}\n\n${result.content.blogPost.body}`} />}
            >
              <p className="mt-1 text-xs italic text-slate-500">{result.content.blogPost.metaDescription}</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {result.content.blogPost.body}
              </pre>
            </Section>

            <Section
              delay={180}
              eyebrow="Email"
              title={`Newsletter — ${result.content.newsletter.subjectLine}`}
              action={<CopyButton text={result.content.newsletter.body} />}
            >
              <p className="mt-1 text-xs italic text-slate-500">{result.content.newsletter.previewText}</p>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">
                {result.content.newsletter.body}
              </pre>
            </Section>

            <Section delay={240} eyebrow="Visual" title={`Quote postcards (${result.postcards.length})`}>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {result.postcards.map((q, i) => (
                  <div key={i} className="group space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={q.image}
                      alt={q.text}
                      className="w-full rounded-xl border border-slate-200 shadow-sm transition duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5"
                    />
                    <a
                      href={q.image}
                      download={`postcard-${i + 1}.png`}
                      className="block text-center text-xs font-medium text-brand hover:underline"
                    >
                      Download PNG
                    </a>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              delay={300}
              eyebrow="Visual"
              title={`Carousel — ${result.carousel.title} (${result.carousel.slides.length} slides)`}
            >
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {result.carousel.slides.map((src, i) => (
                  <div key={i} className="group space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Slide ${i + 1}`}
                      className="w-full rounded-xl border border-slate-200 shadow-sm transition duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5"
                    />
                    <a
                      href={src}
                      download={`carousel-slide-${i + 1}.png`}
                      className="block text-center text-xs font-medium text-brand hover:underline"
                    >
                      Download PNG
                    </a>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        ) : null}

        <ActivitySummary />
      </main>
    </div>
  );
}
