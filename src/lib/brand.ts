import fs from "fs";
import path from "path";

export interface BrandConfig {
  companyName: string;
  productLine: string;
  website: string;
  socialHandle: string;
  tagline: string;
  colors: {
    primary: string;
    primaryDark: string;
    background: string;
    text: string;
    muted: string;
  };
  industry: string;
  seoKeywords: string[];
  voice: string;
}

const BRAND_CONFIG_PATH = path.join(process.cwd(), "data", "brand.json");

export const defaultBrand: BrandConfig = {
  companyName: "WATSNEX",
  productLine: "BioPharma",
  website: "watsnexbiopharma.com",
  socialHandle: "watsnexbiopharma",
  tagline: "Integrating AI where it matters",
  colors: {
    primary: "#1E4FE0",
    primaryDark: "#12318C",
    background: "#F4F5F7",
    text: "#101828",
    muted: "#475467",
  },
  industry: "AI for biopharma and medtech companies",
  seoKeywords: [
    "biopharma AI",
    "medtech AI",
    "AI in life sciences",
    "pharma digital transformation",
    "clinical trial AI",
    "drug development AI",
    "regulatory affairs AI",
    "life sciences data strategy",
    "AI adoption in healthcare",
    "biotech innovation",
  ],
  voice:
    "authoritative but approachable, practical over hype, speaks to biopharma/medtech executives and operators",
};

export function getBrand(): BrandConfig {
  try {
    const raw = fs.readFileSync(BRAND_CONFIG_PATH, "utf-8");
    const stored = JSON.parse(raw);
    return { ...defaultBrand, ...stored };
  } catch {
    return defaultBrand;
  }
}

export function saveBrand(brand: BrandConfig): void {
  const dir = path.dirname(BRAND_CONFIG_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(BRAND_CONFIG_PATH, JSON.stringify(brand, null, 2), "utf-8");
}

const LOGO_MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export function findLogoPath(): string | null {
  const brandDir = path.join(process.cwd(), "public", "brand");
  for (const ext of Object.keys(LOGO_MIME_BY_EXT)) {
    const candidate = path.join(brandDir, `logo${ext}`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function getLogoDataUri(): string | null {
  const logoPath = findLogoPath();
  if (!logoPath) return null;
  try {
    const buf = fs.readFileSync(logoPath);
    const mime = LOGO_MIME_BY_EXT[path.extname(logoPath).toLowerCase()] ?? "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}
