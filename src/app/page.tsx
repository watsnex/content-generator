import Link from "next/link";
import { Nav } from "@/components/Nav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-16">
          <div className="animate-fade-up inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            AI for biopharma &amp; medtech
          </div>
          <h1 className="animate-fade-up mt-4 text-4xl font-bold tracking-tight text-slate-900 [animation-delay:60ms]">
            Turn one podcast episode into a week of content
          </h1>
          <p className="animate-fade-up mt-3 max-w-2xl text-base text-slate-600 [animation-delay:120ms]">
            Upload a full episode transcript to generate a LinkedIn post, blog post, newsletter,
            branded quote postcards, and a branded slide carousel — or upload a reel clip&apos;s
            script to generate captions and hashtags.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <Link
              href="/episode"
              className="animate-fade-up group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl [animation-delay:180ms]"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 -top-1 h-1 origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100"
              />
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">Full episode</div>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Episode → Content</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Upload the full transcript. Get a long-form LinkedIn post, blog post, newsletter,
                4-6 branded quote postcards, and a 5-6 slide branded carousel — all SEO optimized.
              </p>
              <div className="mt-5 flex items-center text-sm font-semibold text-brand">
                Generate content
                <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </Link>

            <Link
              href="/reels"
              className="animate-fade-up group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl [animation-delay:240ms]"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 -top-1 h-1 origin-left scale-x-0 bg-brand transition-transform duration-300 group-hover:scale-x-100"
              />
              <div className="text-xs font-semibold uppercase tracking-wide text-brand">Reel clip</div>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Reel Captions</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Paste the transcript/script of a short reel already cut (e.g. via Opus Clip).
                Get 3 caption options and a ready-to-use hashtag set.
              </p>
              <div className="mt-5 flex items-center text-sm font-semibold text-brand">
                Generate captions
                <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
