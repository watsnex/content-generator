import { getAgentConfig, CRM_FIELDS, type AgentConfig } from "./config";
import { listChangedEvents, type CalendarEvent } from "./google";
import { listCrmRecords, createCrmRecord, recordUrl, type CrmRecord } from "./airtable";
import { findCandidates } from "./match";
import { analyzeEvent } from "./extract";
import { notifySlack } from "./slack";
import { loadState, saveState, type Outcome } from "./state";

export interface EventResult {
  eventId: string;
  title: string;
  start: string;
  outcome: Outcome | "error";
  clientName?: string | null;
  recordId?: string;
  detail: string;
}

export interface RunSummary {
  dryRun: boolean;
  window: { updatedSince: string; until: string };
  scanned: number;
  matchedKeyword: number;
  results: EventResult[];
}

// Overlap each window slightly so events edited right at a run boundary aren't missed.
const OVERLAP_MS = 2 * 60 * 1000;

let running: Promise<RunSummary> | null = null;

/** Runs one sync pass. Concurrent calls share the same in-flight run instead of racing. */
export function runCalendarAgent(opts: { dryRun?: boolean; since?: Date } = {}): Promise<RunSummary> {
  if (!running) {
    running = syncOnce(opts).finally(() => {
      running = null;
    });
  }
  return running;
}

function eventKey(e: CalendarEvent): string {
  // Edited occurrences of a recurring series share the series' identity.
  return e.recurringEventId ?? e.id;
}

function marker(key: string): string {
  return `[gcal:${key}]`;
}

function stripHtml(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function syncOnce(opts: { dryRun?: boolean; since?: Date }): Promise<RunSummary> {
  const cfg = getAgentConfig();
  const dryRun = Boolean(opts.dryRun);
  const state = loadState();
  const now = new Date();

  const updatedSince =
    opts.since ??
    (state.lastRunAt
      ? new Date(Date.parse(state.lastRunAt) - OVERLAP_MS)
      : new Date(now.getTime() - cfg.initialLookbackHours * 60 * 60 * 1000));

  const events = await listChangedEvents({
    serviceAccountJson: cfg.googleServiceAccountJson,
    calendarId: cfg.calendarId,
    updatedMin: updatedSince,
    // Only care about meetings that haven't already happened (plus a day of grace).
    timeMin: new Date(Math.min(updatedSince.getTime(), now.getTime() - 24 * 60 * 60 * 1000)),
  });

  const keywords = cfg.titleKeywords.map((k) => k.toLowerCase());
  const relevant = events.filter((e) => {
    const title = (e.summary ?? "").toLowerCase();
    return keywords.some((k) => title.includes(k));
  });

  const summary: RunSummary = {
    dryRun,
    window: { updatedSince: updatedSince.toISOString(), until: now.toISOString() },
    scanned: events.length,
    matchedKeyword: relevant.length,
    results: [],
  };
  if (relevant.length === 0) {
    if (!dryRun) saveState({ ...state, lastRunAt: now.toISOString() });
    return summary;
  }

  // Loaded once per run; records created during this run are appended so two events for the
  // same new person in one batch don't create two records.
  const crm = await listCrmRecords(cfg);

  for (const event of relevant) {
    const key = eventKey(event);
    const title = event.summary ?? "";
    const start = event.start?.dateTime ?? event.start?.date ?? "";
    const previous = state.handled[key];

    // Already handled and the title hasn't changed since → nothing new to learn.
    if (previous && previous.title === title) continue;
    // Once a record exists for this event, never create another one, even if the title changes.
    if (previous && previous.outcome !== "not_a_client_meeting") continue;

    try {
      const result = await handleEvent(cfg, event, key, crm, dryRun);
      summary.results.push(result);
      if (!dryRun && result.outcome !== "error") {
        state.handled[key] = {
          title,
          outcome: result.outcome as Outcome,
          at: now.toISOString(),
          recordId: result.recordId,
        };
      }
    } catch (err) {
      console.error(`[calendar-agent] Failed on event ${key} (${title}):`, err);
      summary.results.push({
        eventId: key,
        title,
        start,
        outcome: "error",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  if (!dryRun) {
    // If anything errored, keep the old window start so the next run retries those events.
    const hadErrors = summary.results.some((r) => r.outcome === "error");
    saveState({ ...state, lastRunAt: hadErrors ? state.lastRunAt : now.toISOString() });
  }
  return summary;
}

async function handleEvent(
  cfg: AgentConfig,
  event: CalendarEvent,
  key: string,
  crm: CrmRecord[],
  dryRun: boolean,
): Promise<EventResult> {
  const title = event.summary ?? "";
  const start = event.start?.dateTime ?? event.start?.date ?? "";
  const base = { eventId: key, title, start };

  // 1. This exact calendar event already produced a CRM record (e.g. state file was lost).
  const tagged = crm.find((r) => r.note.includes(marker(key)));
  if (tagged) {
    return { ...base, outcome: "already_exists", clientName: tagged.name, recordId: tagged.id, detail: "Record already created from this event" };
  }

  const attendees = (event.attendees ?? []).filter(
    (a) => !a.self && !a.resource && !(a.email && cfg.ignoredEmails.includes(a.email.toLowerCase())),
  );
  const attendeeEmails = attendees.map((a) => a.email?.toLowerCase()).filter((e): e is string => Boolean(e));
  const description = stripHtml(event.description ?? "").slice(0, 4000);

  const candidates = findCandidates(
    crm,
    { texts: [title, ...attendees.map((a) => a.displayName ?? "")], emails: attendeeEmails },
    cfg.ownerName,
  );

  // 2. Ask Claude who the client is and whether any candidate is the same person.
  const analysis = await analyzeEvent({
    ownerName: cfg.ownerName,
    title,
    start,
    attendees,
    description,
    candidates,
  });

  if (!analysis.isClientMeeting) {
    return { ...base, outcome: "not_a_client_meeting", detail: analysis.reason };
  }

  // 3. Duplicate check. An exact email match always wins, regardless of how the name is spelled.
  const clientEmail =
    analysis.clientEmail?.toLowerCase() ?? (attendeeEmails.length === 1 ? attendeeEmails[0] : null);
  const emailMatch = clientEmail ? crm.find((r) => r.email.toLowerCase() === clientEmail) : undefined;
  if (emailMatch) {
    return { ...base, outcome: "already_exists", clientName: emailMatch.name, recordId: emailMatch.id, detail: `Same email as existing record "${emailMatch.name}"` };
  }

  const nameMatch = candidates.find((c) => c.id === analysis.matchedRecordId);
  if (nameMatch && analysis.matchConfidence === "certain") {
    return { ...base, outcome: "already_exists", clientName: nameMatch.name, recordId: nameMatch.id, detail: `Matches existing record "${nameMatch.name}"` };
  }

  // 4. New client → create the record. Flag it for review when the agent isn't sure.
  const reviewReasons: string[] = [];
  if (!analysis.clientName) reviewReasons.push("Couldn't work out the client's name from the event");
  else if (analysis.nameConfidence === "low") reviewReasons.push(analysis.nameConcern || "Name may be incomplete");
  if (nameMatch && analysis.matchConfidence === "possible") {
    reviewReasons.push(`Might be the same person as existing record "${nameMatch.name}" (${recordUrl(cfg, nameMatch.id)})`);
  }
  const needsReview = reviewReasons.length > 0;
  const name = analysis.clientName || clientEmail || `Unknown – ${title}`;

  const noteLines = [
    `${marker(key)} Added automatically by the calendar agent.`,
    ...(needsReview ? [`⚠️ Needs review: ${reviewReasons.join("; ")}`] : []),
    "",
    description,
  ];

  const fields = {
    [CRM_FIELDS.name]: name,
    [CRM_FIELDS.email]: clientEmail && EMAIL_RE.test(clientEmail) ? clientEmail : null,
    [CRM_FIELDS.accountName]: analysis.company,
    [CRM_FIELDS.meetingName]: title,
    [CRM_FIELDS.meetingStart]: event.start?.dateTime ?? null,
    [CRM_FIELDS.meetingType]: analysis.meetingType,
    [CRM_FIELDS.location]: event.location && /^https?:\/\//.test(event.location) ? event.location : null,
    [CRM_FIELDS.linkedin]: analysis.linkedinUrl,
    [CRM_FIELDS.website]: analysis.companyWebsite,
    [CRM_FIELDS.note]: noteLines.join("\n").trim(),
  };

  const outcome: Outcome = needsReview ? "created_needs_review" : "created";
  if (dryRun) {
    return { ...base, outcome, clientName: name, detail: `[dry run] Would create record${needsReview ? ` (review: ${reviewReasons.join("; ")})` : ""}` };
  }

  const recordId = await createCrmRecord(cfg, fields);
  crm.push({ id: recordId, name, email: clientEmail ?? "", accountName: analysis.company ?? "", note: fields[CRM_FIELDS.note] as string });

  if (needsReview) {
    await notifySlack(
      cfg.slackWebhookUrl,
      [
        `:warning: *New CRM record needs a name check*`,
        `*Saved as:* ${name}`,
        `*Meeting:* ${title}`,
        `*When:* ${start}`,
        `*Why:* ${reviewReasons.join("; ")}`,
        `Please confirm or fix the name here: ${recordUrl(cfg, recordId)}`,
      ].join("\n"),
    );
  }

  return { ...base, outcome, clientName: name, recordId, detail: needsReview ? `Created; sent to Slack for review (${reviewReasons.join("; ")})` : "Created" };
}
