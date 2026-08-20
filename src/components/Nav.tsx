import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-bold text-lg tracking-tight text-slate-900">
          Content Generator
        </Link>
        <nav className="flex gap-6 text-sm font-medium text-slate-600">
          <Link href="/episode" className="hover:text-blue-700">
            Episode → Content
          </Link>
          <Link href="/reels" className="hover:text-blue-700">
            Reel Captions
          </Link>
          <Link href="/settings" className="hover:text-blue-700">
            Brand Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
