import { supabase } from './supabase';
import type { Language } from './i18n';

export interface Product {
  id: string;
  slug: string;
  brand: string;
  category: string;
  image: string | null;
  catalog: string | null;
  name: string;
  short_description: string | null;
  description: string | null;
  specifications: any;
  features: any[];
}

export interface CaseStudy {
  id: string;
  slug: string;
  client: string;
  location: string;
  area: string | null;
  type: string | null;
  client_image: string | null;
  before_image: string | null;
  after_image: string | null;
  stats: any[];
  title: string;
  description: string | null;
  challenge: string | null;
  solution: string | null;
  results: any[];
  testimonial: string | null;
}

export interface PageSection {
  id: string;
  page_name: string;
  section_key: string;
  order_index: number;
}

export interface PageSectionTranslation {
  id: string;
  section_id: string;
  language: Language;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: Record<string, any>;
  cta_text?: string;
  cta_url?: string;
  image_url?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  author: string;
  image?: string;
  category: string;
  featured: boolean;
  pub_date: string;
}

export interface BlogPostTranslation {
  id: string;
  post_id: string;
  language: Language;
  title: string;
  description: string;
  content: string;
}

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function getProduct(slug: string, language: Language): Promise<Product | null> {
  const cacheKey = `product:${slug}:${language}`;
  const cached = getCachedData<Product>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      brand,
      category,
      image,
      catalog,
      product_translations!inner(
        name,
        short_description,
        description,
        specifications,
        features
      )
    `)
    .eq('slug', slug)
    .eq('product_translations.language', language)
    .maybeSingle();

  if (error || !data) return null;

  const translation = data.product_translations[0];
  const product = {
    id: data.id,
    slug: data.slug,
    brand: data.brand,
    category: data.category,
    image: data.image,
    catalog: data.catalog,
    name: translation.name,
    short_description: translation.short_description,
    description: translation.description,
    specifications: translation.specifications,
    features: translation.features,
  };

  setCachedData(cacheKey, product);
  return product;
}

export async function getProducts(category: string | null, language: Language): Promise<Product[]> {
  const cacheKey = `products:${category || 'all'}:${language}`;
  const cached = getCachedData<Product[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('products')
    .select(`
      id,
      slug,
      brand,
      category,
      image,
      catalog,
      product_translations!inner(
        name,
        short_description,
        description,
        specifications,
        features
      )
    `)
    .eq('product_translations.language', language);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  const products = data.map(product => {
    const translation = product.product_translations[0];
    return {
      id: product.id,
      slug: product.slug,
      brand: product.brand,
      category: product.category,
      image: product.image,
      catalog: product.catalog,
      name: translation.name,
      short_description: translation.short_description,
      description: translation.description,
      specifications: translation.specifications,
      features: translation.features,
    };
  });

  setCachedData(cacheKey, products);
  return products;
}

export async function getCaseStudy(slug: string, language: Language): Promise<CaseStudy | null> {
  const cacheKey = `case_study:${slug}:${language}`;
  const cached = getCachedData<CaseStudy>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      id,
      slug,
      client,
      location,
      area,
      type,
      client_image,
      before_image,
      after_image,
      stats,
      case_study_translations!inner(
        title,
        description,
        challenge,
        solution,
        results,
        testimonial
      )
    `)
    .eq('slug', slug)
    .eq('case_study_translations.language', language)
    .maybeSingle();

  if (error || !data) return null;

  const translation = data.case_study_translations[0];
  const caseStudy = {
    id: data.id,
    slug: data.slug,
    client: data.client,
    location: data.location,
    area: data.area,
    type: data.type,
    client_image: data.client_image,
    before_image: data.before_image,
    after_image: data.after_image,
    stats: data.stats,
    title: translation.title,
    description: translation.description,
    challenge: translation.challenge,
    solution: translation.solution,
    results: translation.results,
    testimonial: translation.testimonial,
  };

  setCachedData(cacheKey, caseStudy);
  return caseStudy;
}

export async function getCaseStudies(language: Language): Promise<CaseStudy[]> {
  const cacheKey = `case_studies:${language}`;
  const cached = getCachedData<CaseStudy[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      id,
      slug,
      client,
      location,
      area,
      type,
      client_image,
      before_image,
      after_image,
      stats,
      case_study_translations!inner(
        title,
        description,
        challenge,
        solution,
        results,
        testimonial
      )
    `)
    .eq('case_study_translations.language', language);

  if (error || !data) return [];

  const caseStudies = data.map(caseStudy => {
    const translation = caseStudy.case_study_translations[0];
    return {
      id: caseStudy.id,
      slug: caseStudy.slug,
      client: caseStudy.client,
      location: caseStudy.location,
      area: caseStudy.area,
      type: caseStudy.type,
      client_image: caseStudy.client_image,
      before_image: caseStudy.before_image,
      after_image: caseStudy.after_image,
      stats: caseStudy.stats,
      title: translation.title,
      description: translation.description,
      challenge: translation.challenge,
      solution: translation.solution,
      results: translation.results,
      testimonial: translation.testimonial,
    };
  });

  setCachedData(cacheKey, caseStudies);
  return caseStudies;
}

export async function getPageSections(pageName: string, language: Language): Promise<PageSectionTranslation[]> {
  const cacheKey = `page_sections:${pageName}:${language}`;
  const cached = getCachedData<PageSectionTranslation[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('page_sections')
    .select(`
      *,
      page_section_translations!inner(*)
    `)
    .eq('page_name', pageName)
    .eq('page_section_translations.language', language)
    .order('order_index', { ascending: true });

  if (error) return [];

  const sections = data?.map((section: any) => section.page_section_translations[0]) || [];
  setCachedData(cacheKey, sections);
  return sections;
}

export async function getBlogPosts(language: Language, featured?: boolean): Promise<(BlogPost & { translation: BlogPostTranslation })[]> {
  const cacheKey = `blog_posts:${language}:${featured ?? 'all'}`;
  const cached = getCachedData<(BlogPost & { translation: BlogPostTranslation })[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      blog_post_translations!inner(*)
    `)
    .eq('blog_post_translations.language', language)
    .order('pub_date', { ascending: false });

  if (featured !== undefined) {
    query = query.eq('featured', featured);
  }

  const { data, error } = await query;

  if (error) return [];

  const posts = data?.map((post: any) => ({
    ...post,
    translation: post.blog_post_translations[0]
  })) || [];

  setCachedData(cacheKey, posts);
  return posts;
}

export async function getBlogPost(slug: string, language: Language): Promise<(BlogPost & { translation: BlogPostTranslation }) | null> {
  const cacheKey = `blog_post:${slug}:${language}`;
  const cached = getCachedData<BlogPost & { translation: BlogPostTranslation }>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      blog_post_translations!inner(*)
    `)
    .eq('slug', slug)
    .eq('blog_post_translations.language', language)
    .maybeSingle();

  if (error || !data) return null;

  const post = {
    ...data,
    translation: data.blog_post_translations[0]
  };

  setCachedData(cacheKey, post);
  return post;
}

export async function getStaticTranslation(key: string, language: Language): Promise<string> {
  const cacheKey = `translation:${key}:${language}`;
  const cached = getCachedData<string>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('static_translations')
    .select(`
      *,
      static_translation_values!inner(*)
    `)
    .eq('key', key)
    .eq('static_translation_values.language', language)
    .maybeSingle();

  if (error) return key;

  const value = data?.static_translation_values[0]?.value || key;
  setCachedData(cacheKey, value);
  return value;
}

export function createTranslationHelper(language: Language) {
  const translationCache = new Map<string, string>();

  return async function getTranslation(key: string): Promise<string> {
    if (translationCache.has(key)) {
      return translationCache.get(key)!;
    }

    const value = await getStaticTranslation(key, language);
    translationCache.set(key, value);
    return value;
  };
}
