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

## Calendar → Airtable agent

Watches the WATSNEX Google Calendar and makes sure every client you have a meeting with is in the
Airtable **Lead Tracking → Follow -Up Status** table (one row per person). No n8n/Zapier workflow
needed. It only *adds* people. It never edits or deletes rows you've filled in by hand.

### What it does on each run

1. Pulls calendar events created or changed since the last run.
2. Keeps only **business** events: the title must contain "WATSNEX" or a meeting keyword
   (podcast, introduction, intro call, discovery, growth plan, follow up, "Pascal Cote and …").
   Anything with "buffer" in the title is always skipped, and so are personal events, holidays and
   appointments that don't match. (Change with `CALENDAR_TITLE_KEYWORDS` / `CALENDAR_TITLE_EXCLUDE`.
   Set `CALENDAR_TITLE_KEYWORDS=WATSNEX` to only accept titles containing WATSNEX.)
3. Asks Claude who the outside person is. Handles any title format: "Pre-Podcast Chat - Jennifer
   Wells", "Arra G. Yerganian and WATSNEX BioPharma", "podcast Jeff Whitmore (United Bio Channels) -
   Pascal (WATSNEX podcast)". It also uses the attendee list and description. Internal meetings like
   "WATSNEX Sync" are skipped, and you (Pascal) are never treated as the client.
4. **Duplicate check** against Follow -Up Status. That table has no email column, so the agent also
   reads **Dashboard CRM** (read only) to learn each person's emails and past meeting titles:
   - attendee email belongs to exactly one known person → already exists, nothing created;
   - otherwise similar names are short-listed (tolerates typos like "Joshn Mann"/"Micheal",
     nicknames, middle initials like "Arra G", accents, credentials) and Claude decides whether one
     is the same person, using their past meetings and emails as evidence.
5. **New person → creates a Follow -Up Status row** with the Name, and a Note saying which meeting
   it came from (plus company and email when known).
6. **Not sure?** (only a first name, no name at all, or *might* be someone already in the table) →
   the row is **still created**, marked "⚠️ Needs review" in its Note, and a **Slack message** is
   sent with a direct link to the row so you can fix the name in Airtable.

Each event is handled once. The row's Note is tagged with the Google event ID (`[gcal:…]`), so even
after a redeploy the same event never creates a second row.

### One-time setup

**1. Google Calendar access (service account)**

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a project (e.g. "WATSNEX agent").
2. **APIs & Services → Library** → enable **Google Calendar API**.
3. **IAM & Admin → Service Accounts → Create service account** (no roles needed).
4. Open it → **Keys → Add key → Create new key → JSON**. A `.json` file downloads.
5. Copy the service account's email (`…@….iam.gserviceaccount.com`).
6. In [Google Calendar](https://calendar.google.com) → ⚙️ **Settings** → your calendar →
   **Share with specific people** → add that email with **See all event details**.
7. Put the whole contents of the JSON file into `GOOGLE_SERVICE_ACCOUNT_JSON` (one line).

A service account doesn't expire, unlike a personal Google login token, so the agent keeps working
without you re-authorizing it.

**2. Airtable token**

[airtable.com/create/tokens](https://airtable.com/create/tokens) → **Create token** → scopes
`data.records:read` and `data.records:write` → access: **Lead Tracking** base (the agent reads Dashboard CRM and adds rows to Follow -Up Status) → copy into
`AIRTABLE_API_KEY`.

**3. Slack webhook**

[api.slack.com/apps](https://api.slack.com/apps) → **Create New App → From scratch** → **Incoming
Webhooks** → turn on → **Add New Webhook to Workspace** → pick the channel → copy the URL into
`SLACK_WEBHOOK_URL`.

**4. Secret for the scheduler**

Set `CRON_SECRET` to any long random string. The endpoint refuses calls without it.

All variables are listed in `.env.example`. Add them to `.env.local` locally, or to your host's
environment variables (e.g. Railway → service → Variables) in production.

### Running it

The agent is the endpoint `GET/POST /api/agents/calendar-sync`.

**Try it first without writing anything** (shows what it *would* create):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" "https://YOUR-APP/api/agents/calendar-sync?dryRun=1&since=2026-10-01T00:00:00Z"
```

**Schedule it every 5 minutes** with any cron service:

- **Railway**: add a Cron service with schedule `*/5 * * * *` that runs
  `curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://YOUR-APP/api/agents/calendar-sync`
- **cron-job.org** (free): new job → URL `https://YOUR-APP/api/agents/calendar-sync?secret=YOUR_CRON_SECRET` → every 5 minutes.

The response is a JSON summary of each WATSNEX event and what happened to it (`created`,
`created_needs_review`, `already_exists`, `not_a_client_meeting`, or `error`). Events that errored
are retried on the next run.

Code: `src/lib/calendar-agent/` (`run.ts` is the main flow) and `src/app/api/agents/calendar-sync/route.ts`.

## Notes

- Generation calls Claude (`claude-opus-5`) with structured outputs, so the shape of the response
  (long-form post, blog post, newsletter, quotes, carousel slides) is enforced by schema rather than
  parsed from free text.
- Quotes are only pulled from what's actually said in the transcript — the model is instructed not
  to invent claims or statistics.
- No database — brand config is a JSON file on disk. Fine for a single-team internal tool; would
  need a real datastore for a multi-tenant version.
