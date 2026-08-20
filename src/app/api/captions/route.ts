import { NextRequest, NextResponse } from "next/server";
import { generateReelCaptions } from "@/lib/generate";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transcript: string = body.transcript ?? "";

    if (!transcript.trim() || transcript.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide the reel's transcript or script text." },
        { status: 400 },
      );
    }

    const result = await generateReelCaptions(transcript);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
