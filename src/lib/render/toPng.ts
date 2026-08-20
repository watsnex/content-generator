import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { ReactNode } from "react";
import { loadFonts } from "./fonts";

export async function renderToPng(
  node: ReactNode,
  width: number,
  height: number,
): Promise<Buffer> {
  const svg = await satori(node as never, {
    width,
    height,
    fonts: loadFonts(),
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

export function pngToDataUri(buf: Buffer): string {
  return `data:image/png;base64,${buf.toString("base64")}`;
}
