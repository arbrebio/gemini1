import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Entry ids are the file path without extension, e.g. "en/choosing-greenhouse"
// for blog posts — the same shape the old `slug` field had.
const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    image: z.string(),
    category: z.enum(['irrigation', 'greenhouse', 'substrates', 'farming-tips', 'digital-farming']),
    featured: z.boolean().default(false),
  }),
});

const jsonCollection = (dir: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.json', base: `./src/content/${dir}` }),
    schema: z.any(), // these files have free-form structures
  });

export const collections = {
  blog: blogCollection,
  data: jsonCollection('data'),
  products: jsonCollection('products'),
  'case-studies': jsonCollection('case-studies'),
};
