import type { BrandConfig } from "../brand";
import type { Quote } from "../schemas";
import { renderToPng } from "./toPng";
import { LogoMark, BrandFooter, WordMark } from "./branding";

const SIZE = 1080;

function fitQuoteFontSize(text: string): number {
  const len = text.length;
  if (len < 80) return 64;
  if (len < 140) return 52;
  if (len < 220) return 42;
  return 34;
}

export async function renderQuotePostcard(
  brand: BrandConfig,
  quote: Quote,
): Promise<Buffer> {
  const fontSize = fitQuoteFontSize(quote.text);

  const node = (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: `linear-gradient(135deg, ${brand.colors.primary} 0%, ${brand.colors.primaryDark} 100%)`,
        padding: 72,
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <WordMark brand={brand} />
        <LogoMark brand={brand} size={72} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div
          style={{
            display: "flex",
            fontSize: fontSize + 40,
            color: "#FFFFFF",
            opacity: 0.35,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          &ldquo;
        </div>
        <div
          style={{
            display: "flex",
            color: "#FFFFFF",
            fontSize,
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: -0.5,
          }}
        >
          {quote.text}
        </div>
        {quote.speaker ? (
          <div
            style={{
              display: "flex",
              color: "#FFFFFF",
              fontSize: 28,
              fontWeight: 600,
              opacity: 0.9,
            }}
          >
            — {quote.speaker}
          </div>
        ) : null}
      </div>

      <BrandFooter brand={brand} />
    </div>
  );

  return renderToPng(node, SIZE, SIZE);
}
