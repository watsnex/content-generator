import { CRM_FIELDS, type AgentConfig } from "./config";

export interface CrmRecord {
  id: string;
  name: string;
  email: string;
  accountName: string;
  note: string;
}

const API = "https://api.airtable.com/v0";

async function airtableFetch(cfg: AgentConfig, path: string, init?: RequestInit) {
  const res = await fetch(`${API}/${cfg.airtableBaseId}/${encodeURIComponent(cfg.airtableTableId)}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.airtableToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`Airtable request failed (${res.status}): ${await res.text()}`);
  return res.json();
}

/** Every client in the CRM table (name/email/company/note only) — used for duplicate checks. */
export async function listCrmRecords(cfg: AgentConfig): Promise<CrmRecord[]> {
  const records: CrmRecord[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    for (const f of [CRM_FIELDS.name, CRM_FIELDS.email, CRM_FIELDS.accountName, CRM_FIELDS.note]) {
      params.append("fields[]", f);
    }
    if (offset) params.set("offset", offset);
    const json = (await airtableFetch(cfg, `?${params}`)) as {
      records: { id: string; fields: Record<string, unknown> }[];
      offset?: string;
    };
    for (const r of json.records) {
      records.push({
        id: r.id,
        name: String(r.fields[CRM_FIELDS.name] ?? "").trim(),
        email: String(r.fields[CRM_FIELDS.email] ?? "").trim(),
        accountName: String(r.fields[CRM_FIELDS.accountName] ?? "").trim(),
        note: String(r.fields[CRM_FIELDS.note] ?? ""),
      });
    }
    offset = json.offset;
  } while (offset);
  return records;
}

export async function createCrmRecord(cfg: AgentConfig, fields: Record<string, unknown>): Promise<string> {
  // Drop empty values so we never overwrite defaults with blanks or send invalid emails/urls.
  const clean = Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  );
  const json = (await airtableFetch(cfg, "", {
    method: "POST",
    body: JSON.stringify({ records: [{ fields: clean }] }),
  })) as { records: { id: string }[] };
  return json.records[0].id;
}

export function recordUrl(cfg: AgentConfig, recordId: string): string {
  return `https://airtable.com/${cfg.airtableBaseId}/${cfg.airtableTableId}/${recordId}`;
}
