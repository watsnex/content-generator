import { z } from "zod";

export const QuoteSchema = z.object({
  text: z.string().describe("The quote or standalone saying, verbatim or lightly cleaned up from the transcript"),
  speaker: z
    .string()
    .nullable()
    .describe("Name of the guest who said it, or null if it's a general saying/insight not attributed to a specific person"),
});

export const CarouselSlideSchema = z.object({
  heading: z.string().describe("Short slide headline, 3-8 words"),
  body: z.string().describe("1-3 sentences of supporting text for this slide"),
});

export const LinkedInShortPostSchema = z.object({
  angle: z
    .string()
    .describe("The angle for this variant: one of 'Story', 'POV', or 'Quick insight'"),
  post: z
    .string()
    .describe(
      "A complete, ready-to-publish short-form LinkedIn post, 80-150 words: strong hook first line, native formatting with line breaks, ends with relevant hashtags.",
    ),
});

export const EpisodeContentSchema = z.object({
  guestName: z.string().nullable().describe("Detected guest name(s) from the transcript, or null if not identifiable"),
  guestCompany: z
    .string()
    .nullable()
    .describe("Guest's company/organization if stated or clearly inferable from the transcript, or null"),
  episodeTopic: z.string().describe("One-line topic/title summarizing the episode"),
  linkedinPost: z
    .string()
    .describe("A complete, ready-to-publish LinkedIn long-form post: strong hook first line, well-formatted with line breaks, ends with a call to action and relevant hashtags."),
  linkedinShortPosts: z
    .array(LinkedInShortPostSchema)
    .length(3)
    .describe(
      "Exactly 3 additional short-form LinkedIn posts (distinct from the long-form one and from each other), one per angle: a 'Story' post telling a small narrative/anecdote from the episode, a 'POV' post staking out a clear opinion/stance in the company's voice, and a 'Quick insight' post delivering one sharp, tweet-length-adjacent takeaway. All still grounded strictly in the transcript.",
    ),
  blogPost: z.object({
    title: z.string().describe("SEO-optimized blog title"),
    metaDescription: z.string().describe("SEO meta description, under 160 characters"),
    body: z.string().describe("Full blog post body in markdown, with headings, at least 500 words"),
  }),
  newsletter: z.object({
    subjectLine: z.string().describe("Compelling email subject line"),
    previewText: z.string().describe("Email preview/preheader text"),
    body: z.string().describe("Full newsletter body in markdown, scannable with short sections"),
  }),
  quotes: z
    .array(QuoteSchema)
    .min(4)
    .max(6)
    .describe("4-6 standalone quotable moments or sayings from the transcript, for postcard graphics"),
  carousel: z.object({
    title: z.string().describe("Carousel cover slide title"),
    slides: z
      .array(CarouselSlideSchema)
      .min(5)
      .max(6)
      .describe("5-6 body slides (not counting the cover) walking through the episode's key ideas"),
  }),
  seoKeywordsUsed: z.array(z.string()).describe("Industry/SEO keywords woven into the generated content"),
});

export type EpisodeContent = z.infer<typeof EpisodeContentSchema>;
export type Quote = z.infer<typeof QuoteSchema>;
export type CarouselSlide = z.infer<typeof CarouselSlideSchema>;

export const CaptionVariantSchema = z.object({
  style: z.string().describe("Short label for this variant, e.g. 'Hook-first', 'Question', 'Bold claim'"),
  caption: z.string().describe("Ready-to-publish social caption for the reel, including line breaks where natural"),
});

export const ReelCaptionsSchema = z.object({
  clipTopic: z.string().describe("One-line summary of what this reel clip is about"),
  guestName: z.string().nullable().describe("Speaker/guest name if stated or clearly identifiable in the clip, else null"),
  guestCompany: z
    .string()
    .nullable()
    .describe("Guest's company/organization if stated or clearly inferable from the clip, or null"),
  captionVariants: z
    .array(CaptionVariantSchema)
    .min(3)
    .max(3)
    .describe("3 distinct caption options for the same clip"),
  hashtags: z
    .array(z.string())
    .min(8)
    .max(15)
    .describe(
      "Mix of broad industry and niche hashtags, without the # symbol. Must include one derived from the guest's name and, if known, one from their company (e.g. 'janesmith', 'acmepharma') so the post surfaces in their own network's searches.",
    ),
});

export type ReelCaptions = z.infer<typeof ReelCaptionsSchema>;
