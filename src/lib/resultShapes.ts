/**
 * Structural (duck-typed) checks for data read back from localStorage — either the
 * "last result" cache or a history log entry's full content. Used to guard against
 * rendering a shape saved by an older version of the app after a schema change (see
 * the crash this fixed: result.content.linkedinShortPosts.length on undefined).
 */

export function isValidEpisodeResult(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const content = d.content as Record<string, unknown> | undefined;
  const carousel = d.carousel as Record<string, unknown> | undefined;
  return (
    !!content &&
    typeof content.linkedinPost === "string" &&
    Array.isArray(content.linkedinShortPosts) &&
    Array.isArray(d.postcards) &&
    !!carousel &&
    Array.isArray(carousel.slides)
  );
}

export function isValidCaptionsResult(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return typeof d.clipTopic === "string" && Array.isArray(d.captionVariants) && Array.isArray(d.hashtags);
}
