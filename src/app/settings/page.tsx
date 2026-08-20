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

export default function SettingsPage() {
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [hasLogo, setHasLogo] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
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
    setHasLogo(true);
    setLogoFile(null);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Brand Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          This drives every generated postcard, carousel slide, and the tone/keywords used in all
          written content.
        </p>

        <div className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Logo (PNG, JPG, or WEBP — square works best)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="mt-1 block text-sm"
            />
            {hasLogo && !logoFile ? (
              <p className="mt-1 text-xs text-green-700">Logo currently set. Upload a new file to replace it.</p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                No logo uploaded yet — a placeholder monogram badge is used until you add one.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Company name</label>
              <input
                value={brand.companyName}
                onChange={(e) => setBrand({ ...brand, companyName: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Product line / division</label>
              <input
                value={brand.productLine}
                onChange={(e) => setBrand({ ...brand, productLine: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Website</label>
              <input
                value={brand.website}
                onChange={(e) => setBrand({ ...brand, website: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Social handle (no @)</label>
              <input
                value={brand.socialHandle}
                onChange={(e) => setBrand({ ...brand, socialHandle: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Industry / positioning</label>
            <input
              value={brand.industry}
              onChange={(e) => setBrand({ ...brand, industry: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Brand voice</label>
            <input
              value={brand.voice}
              onChange={(e) => setBrand({ ...brand, voice: e.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              SEO / industry keywords (comma-separated)
            </label>
            <textarea
              value={brand.seoKeywords.join(", ")}
              onChange={(e) =>
                setBrand({ ...brand, seoKeywords: e.target.value.split(",").map((k) => k.trim()) })
              }
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(["primary", "primaryDark", "background", "text", "muted"] as const).map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-700 capitalize">{key}</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={brand.colors[key]}
                    onChange={(e) =>
                      setBrand({ ...brand, colors: { ...brand.colors, [key]: e.target.value } })
                    }
                    className="h-9 w-9 rounded border border-slate-300"
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

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved!" : "Save brand settings"}
          </button>
        </div>
      </main>
    </div>
  );
}
