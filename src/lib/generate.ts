import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getClient, MODEL } from "./anthropic";
import { getBrand } from "./brand";
import {
  EpisodeContentSchema,
  ReelCaptionsSchema,
  type EpisodeContent,
  type ReelCaptions,
} from "./schemas";
import {
  episodeSystemPrompt,
  episodeUserPrompt,
  reelCaptionsSystemPrompt,
  reelCaptionsUserPrompt,
} from "./prompts";

export async function generateEpisodeContent(
  transcript: string,
  guestNameHint?: string,
): Promise<EpisodeContent> {
  const brand = getBrand();
  const client = getClient();

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: episodeSystemPrompt(brand),
    messages: [{ role: "user", content: episodeUserPrompt(transcript, guestNameHint) }],
    output_config: {
      format: zodOutputFormat(EpisodeContentSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Model did not return a parseable content package. Try again.");
  }
  return response.parsed_output;
}

export async function generateReelCaptions(clipTranscript: string): Promise<ReelCaptions> {
  const brand = getBrand();
  const client = getClient();

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: reelCaptionsSystemPrompt(brand),
    messages: [{ role: "user", content: reelCaptionsUserPrompt(clipTranscript) }],
    output_config: {
      format: zodOutputFormat(ReelCaptionsSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Model did not return a parseable captions result. Try again.");
  }
  return response.parsed_output;
}
