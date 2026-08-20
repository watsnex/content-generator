"use client";

import { useState } from "react";
import Link from "next/link";

export function Nav() {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-brand p-1 transition group-hover:scale-105">
            {!logoFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/brand/logo.png"
                alt=""
                className="h-full w-full object-contain"
                onError={() => setLogoFailed(true)}
              />
            ) : null}
          </div>
          <span className="text-[15px] font-bold tracking-tight text-slate-900">
            WATSNEX <span className="font-medium text-slate-400">Content Generator</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
          <Link
            href="/episode"
            className="rounded-md px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Episode → Content
          </Link>
          <Link
            href="/reels"
            className="rounded-md px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Reel Captions
          </Link>
          <Link
            href="/settings"
            className="ml-1 flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Brand
          </Link>
        </nav>
      </div>
    </header>
  );
}
