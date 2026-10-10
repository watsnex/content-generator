import { NextRequest, NextResponse } from "next/server";
import { runCalendarAgent } from "@/lib/calendar-agent/run";

export const maxDuration = 300;

// Called on a schedule (e.g. every 5 minutes) by a cron service.
//   Authorization: Bearer <CRON_SECRET>   (or ?secret=<CRON_SECRET> for cron tools that can't set headers)
//   ?dryRun=1                  → report what would happen without writing to Airtable or Slack
//   ?since=2026-10-01T00:00Z   → re-scan events changed since this time (backfill)
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not set on the server." }, { status: 500 });
  }
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? req.nextUrl.searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = ["1", "true"].includes(req.nextUrl.searchParams.get("dryRun") ?? "");
  const sinceParam = req.nextUrl.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : undefined;
  if (since && Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: `Invalid "since" date: ${sinceParam}` }, { status: 400 });
  }

  try {
    const summary = await runCalendarAgent({ dryRun, since });
    return NextResponse.json(summary);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
