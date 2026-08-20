"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

interface BrandConfig {
  companyName: string;
  productLine: string;
  website: string;
  socialHandle: string;
  tagline: string;
  colors: { primary: string; primaryDark: string; background: string; text: string; muted: string };
  industry: string;
  seoKeywords: string[];
  voice: string;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-brand";

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-900">{title}</h2>
      {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-800">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [hasLogo, setHasLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "not-persisted">("idle");

  useEffect(() => {
    fetch("/api/brand")
      .then((r) => r.json())
      .then((data) => {
        setBrand(data.brand);
        setHasLogo(data.hasLogo);
      });
  }, []);

  if (!brand) {
    return (
      <div className="flex flex-1 flex-col">
        <Nav />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 text-sm text-slate-500">Loading…</main>
      </div>
    );
  }

  async function handleSave() {
    if (!brand) return;
    setSaving(true);
    setSaveState("idle");
    const form = new FormData();
    form.set("companyName", brand.companyName);
    form.set("productLine", brand.productLine);
    form.set("website", brand.website);
    form.set("socialHandle", brand.socialHandle);
    form.set("tagline", brand.tagline);
    form.set("industry", brand.industry);
    form.set("voice", brand.voice);
    form.set("colorPrimary", brand.colors.primary);
    form.set("colorPrimaryDark", brand.colors.primaryDark);
    form.set("colorBackground", brand.colors.background);
    form.set("colorText", brand.colors.text);
    form.set("colorMuted", brand.colors.muted);
    form.set("seoKeywords", brand.seoKeywords.join(", "));
    if (logoFile) form.set("logo", logoFile);

    const res = await fetch("/api/brand", { method: "POST", body: form });
    const data = await res.json();
    setBrand(data.brand);
    if (logoFile) setHasLogo(true);
    setLogoFile(null);
    setSaving(false);
    setSaveState(data.persisted ? "saved" : "not-persisted");
    setTimeout(() => setSaveState("idle"), 4000);
  }

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Brand Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          This is what makes generated content <em>yours</em>: your logo and colors get baked into
          every postcard and carousel image, and your industry/voice/keywords steer the tone and
          SEO terms in every LinkedIn post, blog post, and newsletter.
        </p>

        <div className="mt-6 space-y-5">
          <Card title="Logo" description="Square PNG, JPG, or WEBP works best — used on every postcard and carousel slide.">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
            />
            {hasLogo && !logoFile ? (
              <p className="text-xs text-emerald-700">Logo currently set. Upload a new file to replace it.</p>
            ) : (
              <p className="text-xs text-slate-500">
                No logo uploaded yet — a placeholder monogram badge is used until you add one.
              </p>
            )}
          </Card>

          <Card title="Identity">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Company name">
                <input
                  value={brand.companyName}
                  onChange={(e) => setBrand({ ...brand, companyName: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Product line / division">
                <input
                  value={brand.productLine}
                  onChange={(e) => setBrand({ ...brand, productLine: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Website">
                <input
                  value={brand.website}
                  onChange={(e) => setBrand({ ...brand, website: e.target.value })}
                  className={inputClass}
                />
              </Field>
              <Field label="Social handle (no @)">
                <input
                  value={brand.socialHandle}
                  onChange={(e) => setBrand({ ...brand, socialHandle: e.target.value })}
                  className={inputClass}
                />
              </Field>
            </div>
          </Card>

          <Card title="Voice & positioning" description="Steers the tone and SEO keywords used in generated copy.">
            <Field label="Industry / positioning">
              <input
                value={brand.industry}
                onChange={(e) => setBrand({ ...brand, industry: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Brand voice">
              <input
                value={brand.voice}
                onChange={(e) => setBrand({ ...brand, voice: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="SEO / industry keywords (comma-separated)">
              <textarea
                value={brand.seoKeywords.join(", ")}
                onChange={(e) =>
                  setBrand({ ...brand, seoKeywords: e.target.value.split(",").map((k) => k.trim()) })
                }
                rows={3}
                className={inputClass}
              />
            </Field>
          </Card>

          <Card title="Colors" description="Used across every generated postcard and carousel slide.">
            <div className="grid grid-cols-3 gap-4">
              {(["primary", "primaryDark", "background", "text", "muted"] as const).map((key) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 capitalize">{key}</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="color"
                      value={brand.colors[key]}
                      onChange={(e) =>
                        setBrand({ ...brand, colors: { ...brand.colors, [key]: e.target.value } })
                      }
                      className="h-9 w-9 shrink-0 rounded border border-slate-300"
                    />
                    <input
                      value={brand.colors[key]}
                      onChange={(e) =>
                        setBrand({ ...brand, colors: { ...brand.colors, [key]: e.target.value } })
                      }
                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save brand settings"}
            </button>
            {saveState === "saved" ? (
              <span className="text-sm font-medium text-emerald-700">Saved.</span>
            ) : null}
            {saveState === "not-persisted" ? (
              <span className="text-xs text-amber-700">
                Applied for now, but this hosting setup can&apos;t save files permanently — it&apos;ll
                reset on the next deploy. Tell your Claude Code session the values you want and it can
                bake them in as the permanent defaults.
              </span>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
