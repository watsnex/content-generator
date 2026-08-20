import { NextRequest, NextResponse } from "next/server";
import { generateEpisodeContent } from "@/lib/generate";
import { getBrand } from "@/lib/brand";
import { renderQuotePostcard } from "@/lib/render/postcard";
import { renderCarousel } from "@/lib/render/carousel";
import { pngToDataUri } from "@/lib/render/toPng";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript: string = body.transcript ?? "";
    const guestNameHint: string | undefined = body.guestName || undefined;

    if (!transcript.trim() || transcript.trim().length < 200) {
      return NextResponse.json(
        { error: "Please provide a full transcript (at least a few hundred characters)." },
        { status: 400 },
      );
    }

    const content = await generateEpisodeContent(transcript, guestNameHint);
    const brand = getBrand();

    const [postcardPngs, carouselPngs] = await Promise.all([
      Promise.all(content.quotes.map((q) => renderQuotePostcard(brand, q))),
      renderCarousel(brand, {
        title: content.carousel.title,
        episodeTopic: content.episodeTopic,
        slides: content.carousel.slides,
      }),
    ]);

    return NextResponse.json({
      content,
      postcards: content.quotes.map((q, i) => ({
        ...q,
        image: pngToDataUri(postcardPngs[i]),
      })),
      carousel: {
        title: content.carousel.title,
        slides: carouselPngs.map((buf) => pngToDataUri(buf)),
      },
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
