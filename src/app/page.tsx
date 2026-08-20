import Link from "next/link";
import { Nav } from "@/components/Nav";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Turn one podcast episode into a week of content
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Upload a full episode transcript to generate a LinkedIn post, blog post, newsletter,
          branded quote postcards, and a branded slide carousel — or upload a reel clip&apos;s
          script to generate captions and hashtags.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Link
            href="/episode"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="text-sm font-semibold text-blue-700">Full episode</div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Episode → Content</h2>
            <p className="mt-2 text-sm text-slate-600">
              Upload the full transcript. Get a long-form LinkedIn post, blog post, newsletter,
              4-6 branded quote postcards, and a 5-6 slide branded carousel — all SEO optimized.
            </p>
            <div className="mt-4 text-sm font-medium text-blue-700 group-hover:underline">
              Generate content →
            </div>
          </Link>

          <Link
            href="/reels"
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="text-sm font-semibold text-blue-700">Reel clip</div>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Reel Captions</h2>
            <p className="mt-2 text-sm text-slate-600">
              Paste the transcript/script of a short reel already cut (e.g. via Opus Clip).
              Get 3 caption options and a ready-to-use hashtag set.
            </p>
            <div className="mt-4 text-sm font-medium text-blue-700 group-hover:underline">
              Generate captions →
            </div>
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
          <h3 className="font-semibold text-slate-900">Brand settings</h3>
          <p className="mt-1 text-sm text-slate-600">
            Set your logo, colors, and keywords once in{" "}
            <Link href="/settings" className="text-blue-700 underline">
              Brand Settings
            </Link>
            . Every postcard and carousel slide is rendered with your branding automatically.
          </p>
        </div>
      </main>
    </div>
  );
}
