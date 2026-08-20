import type { ReactNode } from "react";
import type { BrandConfig } from "../brand";
import { getLogoDataUri } from "../brand";

const PETAL_ANGLES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];

/**
 * Vector recreation of the WATSNEX flower/W mark (10-petal rosette + centered "W").
 * Used whenever no uploaded logo file is found — see findLogoPath() in lib/brand.ts.
 */
export function FlowerLogo({ color = "#FFFFFF", size = 64 }: { color?: string; size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {PETAL_ANGLES.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 100 100)`}>
            <path
              d="M100,100 C82,76 82,36 100,14 C118,36 118,76 100,100 Z"
              fill="none"
              stroke={color}
              strokeWidth={7}
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: size * 0.34,
        }}
      >
        W
      </div>
    </div>
  );
}

export function LogoMark({
  brand,
  size = 64,
  fallbackColor = "#FFFFFF",
}: {
  brand: BrandConfig;
  size?: number;
  fallbackColor?: string;
}) {
  const logoUri = getLogoDataUri();

  if (logoUri) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUri}
        alt={`${brand.companyName} logo`}
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
      />
    );
  }

  return <FlowerLogo color={fallbackColor} size={size} />;
}

/** Logo mark that always renders on a solid brand-colored circle, for use on light backgrounds. */
export function LogoBadge({ brand, size = 56 }: { brand: BrandConfig; size?: number }) {
  const logoUri = getLogoDataUri();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: brand.colors.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {logoUri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUri}
          alt={`${brand.companyName} logo`}
          width={size * 0.72}
          height={size * 0.72}
          style={{ objectFit: "contain" }}
        />
      ) : (
        <FlowerLogo color="#FFFFFF" size={size * 0.72} />
      )}
    </div>
  );
}

export function WordMark({ brand, dark = false }: { brand: BrandConfig; dark?: boolean }) {
  const color = dark ? brand.colors.text : "#FFFFFF";
  const subColor = dark ? brand.colors.muted : "rgba(255,255,255,0.85)";
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          color,
          fontFamily: "Inter",
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        {brand.companyName}
      </div>
      <div
        style={{
          display: "flex",
          color: subColor,
          fontFamily: "Inter",
          fontSize: 17,
          fontWeight: 400,
          marginTop: -2,
        }}
      >
        {brand.productLine}
      </div>
    </div>
  );
}

function IconBadge({ children, size = 36 }: { children: ReactNode; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: "#101828",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
      }}
    >
      {children}
    </div>
  );
}

function InstagramIcon({ size = 36 }: { size?: number }) {
  const box = size * 0.44;
  return (
    <IconBadge size={size}>
      <div
        style={{
          width: box,
          height: box,
          borderRadius: box * 0.32,
          border: "2px solid #FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            width: box * 0.42,
            height: box * 0.42,
            borderRadius: box * 0.42,
            border: "1.6px solid #FFFFFF",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -1,
            right: -1,
            width: box * 0.16,
            height: box * 0.16,
            borderRadius: box * 0.16,
            background: "#FFFFFF",
            display: "flex",
          }}
        />
      </div>
    </IconBadge>
  );
}

function GlyphIcon({ glyph, size = 36 }: { glyph: string; size?: number }) {
  return (
    <IconBadge size={size}>
      <div
        style={{
          display: "flex",
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: size * 0.42,
          letterSpacing: -0.5,
        }}
      >
        {glyph}
      </div>
    </IconBadge>
  );
}

export function SocialRow({ size = 36 }: { size?: number }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <InstagramIcon size={size} />
      <GlyphIcon glyph="f" size={size} />
      <GlyphIcon glyph="in" size={size} />
      <GlyphIcon glyph="X" size={size} />
    </div>
  );
}

export function WebsitePill({ brand, dark = false }: { brand: BrandConfig; dark?: boolean }) {
  const bg = dark ? "#FFFFFF" : "rgba(255,255,255,0.14)";
  const border = dark ? brand.colors.primary : "rgba(255,255,255,0.6)";
  const color = dark ? brand.colors.primary : "#FFFFFF";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: 999,
        padding: "10px 18px",
      }}
    >
      <div
        style={{
          display: "flex",
          color,
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: 18,
          transform: "rotate(45deg)",
        }}
      >
        &uarr;
      </div>
      <div style={{ display: "flex", color, fontFamily: "Inter", fontWeight: 700, fontSize: 18 }}>
        {brand.website}
      </div>
    </div>
  );
}

/** Full footer used on brand-colored (dark) backgrounds: website pill + social icon row. */
export function BrandFooter({ brand }: { brand: BrandConfig }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <WebsitePill brand={brand} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SocialRow size={34} />
        <div style={{ display: "flex", color: "#FFFFFF", fontFamily: "Inter", fontWeight: 600, fontSize: 18 }}>
          {brand.socialHandle}
        </div>
      </div>
    </div>
  );
}

/** Footer used on light backgrounds (e.g. carousel body slides). */
export function BrandFooterLight({ brand }: { brand: BrandConfig }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <WebsitePill brand={brand} dark />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SocialRow size={32} />
        <div
          style={{ display: "flex", color: brand.colors.muted, fontFamily: "Inter", fontWeight: 600, fontSize: 17 }}
        >
          {brand.socialHandle}
        </div>
      </div>
    </div>
  );
}
