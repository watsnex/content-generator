// All knobs for the calendar → Airtable agent live here, read from env with sensible defaults.

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. See README → "Calendar → Airtable agent".`);
  return value;
}

function list(name: string, fallback: string[]): string[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getAgentConfig() {
  return {
    googleServiceAccountJson: required("GOOGLE_SERVICE_ACCOUNT_JSON"),
    calendarId: process.env.GOOGLE_CALENDAR_ID || "pc.watsnex@gmail.com",

    airtableToken: required("AIRTABLE_API_KEY"),
    airtableBaseId: process.env.AIRTABLE_BASE_ID || "appp0YgbXPa9M2OyB", // Lead Tracking
    airtableTableId: process.env.AIRTABLE_TABLE_ID || "tblEFpcahAALHIpZw", // CRM

    // Optional — without it, review alerts are only logged.
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || null,

    // Only events whose title contains one of these (case-insensitive) are looked at.
    titleKeywords: list("CALENDAR_TITLE_KEYWORDS", ["WATSNEX"]),
    // The calendar owner — never treated as the client.
    ownerName: process.env.CALENDAR_OWNER_NAME || "Pascal Côté",
    // Attendee emails that are never the client (you, note-takers, teammates).
    ignoredEmails: list("CALENDAR_IGNORED_EMAILS", ["pc.watsnex@gmail.com", "fred@fireflies.ai"]).map(
      (e) => e.toLowerCase(),
    ),
    // How far back to look on the very first run (or if state was lost), in hours.
    initialLookbackHours: Number(process.env.CALENDAR_INITIAL_LOOKBACK_HOURS || 24),

    cronSecret: process.env.CRON_SECRET || null,
  };
}

export type AgentConfig = ReturnType<typeof getAgentConfig>;

// Field names in the Airtable CRM table. Change here if the table's columns are renamed.
export const CRM_FIELDS = {
  name: "Name",
  email: "Email",
  accountName: "Account Name",
  meetingName: "Meeting Name",
  meetingStart: "Meeting Start",
  meetingType: "Meeting Type",
  location: "Location_",
  linkedin: "Linkedin",
  website: "Company Website",
  note: "Note",
} as const;

// Current options of the CRM "Meeting Type" single-select. The agent only ever picks from these
// (or leaves it blank), so it never creates stray select options.
export const MEETING_TYPES = [
  "Introduction Meeting",
  "Discovery Meeting",
  "Follow Up Meeting",
  "Podcast Meeting",
  "Strategic Growth Plan Presentation",
  "Chat with Pascal",
  "Watsnex AI Solution One-on-One",
  "Introduction Opportunity",
] as const;
