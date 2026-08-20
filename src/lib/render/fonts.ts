import fs from "fs";
import path from "path";
import type { SatoriOptions } from "satori";

let cachedFonts: SatoriOptions["fonts"] | null = null;

export function loadFonts(): SatoriOptions["fonts"] {
  if (cachedFonts) return cachedFonts;

  const fontsDir = path.join(process.cwd(), "public", "fonts");
  cachedFonts = [
    {
      name: "Inter",
      data: fs.readFileSync(path.join(fontsDir, "Inter-Regular.ttf")),
      weight: 400,
      style: "normal",
    },
    {
      name: "Inter",
      data: fs.readFileSync(path.join(fontsDir, "Inter-Bold.ttf")),
      weight: 700,
      style: "normal",
    },
    {
      name: "Inter",
      data: fs.readFileSync(path.join(fontsDir, "Inter-ExtraBold.ttf")),
      weight: 800,
      style: "normal",
    },
  ];
  return cachedFonts;
}
