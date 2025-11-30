import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
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

const dataCollection = defineCollection({
  type: 'data',
  schema: z.any(), // Allow any JSON structure for data files
});

const productsCollection = defineCollection({
  type: 'data',
  schema: z.any(), // Allow any JSON structure for product files
});

const caseStudiesCollection = defineCollection({
  type: 'data',
  schema: z.any(), // Allow any JSON structure for case study files
});

export const collections = {
  blog: blogCollection,
  data: dataCollection,
  products: productsCollection,
  'case-studies': caseStudiesCollection,
};