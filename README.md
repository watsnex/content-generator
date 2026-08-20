# Content Generator

Turns a podcast episode transcript into a full, branded content package — and turns a reel clip's
transcript into captions and hashtags. Built for WATSNEX BioPharma's podcast → social/blog/newsletter
workflow.

## What it does

**Episode → Content** (`/episode`): upload a full podcast transcript. Generates:

- A long-form LinkedIn post
- A blog post (SEO-structured, markdown)
- A newsletter (subject line + body)
- 4-6 quote/postcard images — standalone branded PNGs, with the guest's name attributed when it's
  a direct quote, or unattributed when it's a general insight
- A 5-6 slide branded carousel (PNGs, one file per slide, cover + body slides)

All text is written using your configured brand voice and SEO/industry keywords (see Brand Settings
below). Postcards and carousel slides are rendered server-side as real PNG images using your logo,
colors, and company name — no Canva or manual design step needed.

**Reel Captions** (`/reels`): paste the transcript/script of a short reel clip that's already been
cut (e.g. via Opus Clip). Generates 3 caption options and a hashtag set.

**Brand Settings** (`/settings`): upload your logo, set brand colors, company name, website, social
handle, industry positioning, brand voice, and SEO keywords. Everything generated afterward uses
these automatically.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com) and sign in / create an account.
2. Add a payment method under **Settings → Billing**.
3. Go to **Settings → API Keys → Create Key**. Copy it — you only see it once.

### 3. Configure the key

```bash
cp .env.example .env.local
```

Open `.env.local` and paste your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

`.env.local` is gitignored — it never gets committed.

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setting up your brand

Go to `/settings` in the running app and fill in:

- **Logo** — upload a PNG/JPG/WEBP (square works best). Until you upload one, a placeholder circular
  monogram badge is used so the app still works out of the box.
- **Company name, product line, website, social handle**
- **Colors** — primary, primary-dark, background, text, muted. Defaults match the WATSNEX BioPharma
  blue.
- **Industry / positioning and brand voice** — used to steer the tone of every generated post.
- **SEO / industry keywords** — comma-separated list woven naturally into generated content and
  hashtags.

These are stored in `data/brand.json` and `public/brand/logo.*`, both gitignored (per-deployment
config, not source code).

## How the design output works (no Canva needed)

Postcards and carousel slides are not templates filled in by hand — they're rendered on the server
from code (`src/lib/render/`) using [Satori](https://github.com/vercel/satori) (layout engine) and
[resvg](https://github.com/RazrFalcon/resvg) (SVG → PNG). The templates read your brand config live,
so changing a color or swapping the logo in Settings changes every subsequent image with no extra
design step. If you later want pixel-identical matches to a specific Canva template, that's a
follow-up — for now the templates are built to match the WATSNEX BioPharma look (blue background,
logo mark top-right, wordmark, footer with website/handle).

## Project structure

```
src/
  app/
    page.tsx              Home
    episode/page.tsx       Episode → Content UI
    reels/page.tsx          Reel captions UI
    settings/page.tsx       Brand settings UI
    api/generate/route.ts   Full episode → content bundle
    api/captions/route.ts   Reel transcript → captions/hashtags
    api/brand/route.ts      Brand config + logo upload
  lib/
    anthropic.ts           Claude API client
    prompts.ts              System/user prompts (SEO + industry framing)
    schemas.ts               Structured-output schemas (Zod)
    generate.ts               Calls to Claude, typed via schemas
    brand.ts                    Brand config load/save
    render/                      Satori/resvg image templates (postcard, carousel)
```

## Notes

- Generation calls Claude (`claude-opus-5`) with structured outputs, so the shape of the response
  (long-form post, blog post, newsletter, quotes, carousel slides) is enforced by schema rather than
  parsed from free text.
- Quotes are only pulled from what's actually said in the transcript — the model is instructed not
  to invent claims or statistics.
- No database — brand config is a JSON file on disk. Fine for a single-team internal tool; would
  need a real datastore for a multi-tenant version.
