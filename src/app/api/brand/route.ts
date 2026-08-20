import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getBrand, saveBrand, defaultBrand, findLogoPath, type BrandConfig } from "@/lib/brand";

const ALLOWED_LOGO_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

export async function GET() {
  const brand = getBrand();
  return NextResponse.json({ brand, hasLogo: Boolean(findLogoPath()) });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const current = getBrand();
    const next: BrandConfig = {
      ...current,
      companyName: (form.get("companyName") as string) || current.companyName,
      productLine: (form.get("productLine") as string) || current.productLine,
      website: (form.get("website") as string) || current.website,
      socialHandle: (form.get("socialHandle") as string) || current.socialHandle,
      tagline: (form.get("tagline") as string) || current.tagline,
      industry: (form.get("industry") as string) || current.industry,
      voice: (form.get("voice") as string) || current.voice,
      colors: {
        ...current.colors,
        primary: (form.get("colorPrimary") as string) || current.colors.primary,
        primaryDark: (form.get("colorPrimaryDark") as string) || current.colors.primaryDark,
        background: (form.get("colorBackground") as string) || current.colors.background,
        text: (form.get("colorText") as string) || current.colors.text,
        muted: (form.get("colorMuted") as string) || current.colors.muted,
      },
      seoKeywords: form.get("seoKeywords")
        ? String(form.get("seoKeywords"))
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : current.seoKeywords,
    };

    const persisted = saveBrand(next);

    const logoFile = form.get("logo") as File | null;
    let logoPersisted = true;
    if (logoFile && logoFile.size > 0) {
      const ext = ALLOWED_LOGO_TYPES[logoFile.type];
      if (!ext) {
        return NextResponse.json(
          { error: `Unsupported logo file type: ${logoFile.type}. Use PNG, JPG, WEBP, or SVG.` },
          { status: 400 },
        );
      }
      try {
        const brandDir = path.join(process.cwd(), "public", "brand");
        fs.mkdirSync(brandDir, { recursive: true });
        for (const existingExt of Object.values(ALLOWED_LOGO_TYPES)) {
          const existing = path.join(brandDir, `logo${existingExt}`);
          if (fs.existsSync(existing)) fs.unlinkSync(existing);
        }
        const buf = Buffer.from(await logoFile.arrayBuffer());
        fs.writeFileSync(path.join(brandDir, `logo${ext}`), buf);
      } catch {
        logoPersisted = false;
      }
    }

    return NextResponse.json({ brand: next, persisted: persisted && logoPersisted });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  saveBrand(defaultBrand);
  const brandDir = path.join(process.cwd(), "public", "brand");
  for (const ext of Object.values(ALLOWED_LOGO_TYPES)) {
    const existing = path.join(brandDir, `logo${ext}`);
    if (fs.existsSync(existing)) fs.unlinkSync(existing);
  }
  return NextResponse.json({ brand: defaultBrand });
}
