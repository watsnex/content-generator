import type { BrandConfig } from "../brand";
import type { CarouselSlide } from "../schemas";
import { renderToPng } from "./toPng";
import { LogoMark, BrandFooter, WordMark } from "./branding";

const SIZE = 1080;

function CoverSlide({
  brand,
  title,
  episodeTopic,
}: {
  brand: BrandConfig;
  title: string;
  episodeTopic: string;
}) {
  return (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: brand.colors.primary,
        padding: 72,
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <WordMark brand={brand} />
        <LogoMark brand={brand} size={72} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "flex",
            color: "rgba(255,255,255,0.75)",
            fontSize: 24,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          {episodeTopic}
        </div>
        <div
          style={{
            display: "flex",
            color: "#FFFFFF",
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            color: "rgba(255,255,255,0.85)",
            fontSize: 26,
            fontWeight: 400,
            marginTop: 12,
          }}
        >
          Swipe to see what we learned &rarr;
        </div>
      </div>

      <BrandFooter brand={brand} />
    </div>
  );
}

function BodySlide({
  brand,
  slide,
  index,
  total,
}: {
  brand: BrandConfig;
  slide: CarouselSlide;
  index: number;
  total: number;
}) {
  return (
    <div
      style={{
        width: SIZE,
        height: SIZE,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: brand.colors.background,
        padding: 72,
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            color: brand.colors.primary,
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          {brand.companyName}
        </div>
        <div
          style={{
            display: "flex",
            color: brand.colors.muted,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {String(index).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            width: 64,
            height: 6,
            background: brand.colors.primary,
            borderRadius: 3,
          }}
        />
        <div
          style={{
            display: "flex",
            color: brand.colors.text,
            fontSize: 46,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          {slide.heading}
        </div>
        <div
          style={{
            display: "flex",
            color: brand.colors.muted,
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          {slide.body}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 24,
          borderTop: `2px solid ${brand.colors.primary}22`,
        }}
      >
        <div style={{ display: "flex", color: brand.colors.muted, fontSize: 20, fontWeight: 600 }}>
          {brand.website}
        </div>
        <div style={{ display: "flex", color: brand.colors.muted, fontSize: 20, fontWeight: 400 }}>
          @{brand.socialHandle}
        </div>
      </div>
    </div>
  );
}

export async function renderCarousel(
  brand: BrandConfig,
  params: { title: string; episodeTopic: string; slides: CarouselSlide[] },
): Promise<Buffer[]> {
  const total = params.slides.length;
  const cover = await renderToPng(
    <CoverSlide brand={brand} title={params.title} episodeTopic={params.episodeTopic} />,
    SIZE,
    SIZE,
  );

  const bodyPngs = await Promise.all(
    params.slides.map((slide, i) =>
      renderToPng(<BodySlide brand={brand} slide={slide} index={i + 1} total={total} />, SIZE, SIZE),
    ),
  );

  return [cover, ...bodyPngs];
}
