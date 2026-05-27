import { defineCollection, z } from "astro:content";

const guides = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      heroImage: image(),
      heroAlt: z.string().default("Last Thread guide"),
      publishDate: z.date(),
      updatedDate: z.date().optional(),
      featured: z.boolean().default(false),
      items: z
        .array(
          z.object({
            name: z.string(),
            slug: z.string(),
            blurb: z.string(),
            image: z.string().url(),
            imageAlt: z.string().optional(),
            priceRange: z.string().optional(),
          }),
        )
        .min(1),
    }),
});

const journal = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      heroImage: image(),
      heroAlt: z.string().default("Last Thread journal"),
      publishDate: z.date(),
      updatedDate: z.date().optional(),
      author: z.string().default("Last Thread"),
    }),
});

export const collections = { guides, journal };
