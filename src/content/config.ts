import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().max(160).optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    canonical: z.string().url().optional(),
    heroImage: z.string().optional(),
    listed: z.boolean().optional(),
    noindex: z.boolean().optional(),
  }),
});

export const collections = { blog };
