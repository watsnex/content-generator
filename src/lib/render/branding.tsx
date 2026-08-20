import type { BrandConfig } from "../brand";
import { getLogoDataUri } from "../brand";

export function LogoMark({ brand, size = 64 }: { brand: BrandConfig; size?: number }) {
  const logoUri = getLogoDataUri();
  const initial = brand.companyName.trim().charAt(0).toUpperCase() || "W";

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

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: "rgba(255,255,255,0.16)",
        border: "3px solid rgba(255,255,255,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontSize: size * 0.5,
        fontWeight: 800,
        fontFamily: "Inter",
      }}
    >
      {initial}
    </div>
  );
}

export function BrandFooter({ brand }: { brand: BrandConfig }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 24,
        borderTop: "2px solid rgba(255,255,255,0.25)",
      }}
    >
      <div
        style={{
          display: "flex",
          color: "#FFFFFF",
          fontFamily: "Inter",
          fontSize: 22,
          fontWeight: 700,
          opacity: 0.95,
        }}
      >
        {brand.website}
      </div>
      <div
        style={{
          display: "flex",
          color: "#FFFFFF",
          fontFamily: "Inter",
          fontSize: 22,
          fontWeight: 400,
          opacity: 0.85,
        }}
      >
        @{brand.socialHandle}
      </div>
    </div>
  );
}

export function WordMark({ brand }: { brand: BrandConfig }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          color: "#FFFFFF",
          fontFamily: "Inter",
          fontSize: 26,
          fontWeight: 800,
          letterSpacing: 1,
        }}
      >
        {brand.companyName}
      </div>
      <div
        style={{
          display: "flex",
          color: "#FFFFFF",
          fontFamily: "Inter",
          fontSize: 20,
          fontWeight: 400,
          opacity: 0.85,
          marginTop: -4,
        }}
      >
        {brand.productLine}
      </div>
    </div>
  );
}
