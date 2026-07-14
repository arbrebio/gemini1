import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    tailwind(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          fr: 'fr',
          es: 'es',
          af: 'af',
        }
      },
      filter: (page) =>
        !page.includes('/newsletter/') &&
        !page.includes('/404') &&
        !page.includes('/500') &&
        !page.includes('/api/') &&
        !page.includes('/admin/') &&
        !page.includes('/sales-agent/') &&
        !page.includes('/terrain/'),
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize: (item) => {
        if (item.url.includes('/blog/')) {
          item.changefreq = 'monthly';
          item.priority = 0.7;
        } else if (item.url === '/' || item.url.endsWith('/')) {
          item.priority = 1.0;
          item.changefreq = 'daily';
        } else {
          item.priority = 0.8;
        }
        return item;
      }
    })
  ],
  site: 'https://www.arbrebio.com',
  output: 'static',
  adapter: vercel(),
  // Astro's built-in CSRF origin check rejects multipart form POSTs (careers
  // apply, sales proof uploads) with a plain-text "Cross-site POST form
  // submissions are forbidden" 403 whenever the Origin header differs from the
  // serving host (e.g. apex→www redirects on Vercel). All state-changing API
  // routes authenticate via Bearer tokens or per-record tokens — not ambient
  // cookies — so the origin check adds no CSRF protection here.
  security: {
    checkOrigin: false,
  },
  // Prefetch internal links on hover for near-instant navigation.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  server: {
    host: true,
    port: 4321
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase/supabase-js')) return 'supabase';
              if (id.includes('zod')) return 'zod';
              return 'vendor';
            }
          }
        }
      },
      cssMinify: 'lightningcss',
      minify: 'terser',
      assetsInlineLimit: 2048,
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 400,
      target: 'es2020',
      terserOptions: {
        // Strip noisy dev logging but KEEP console.error/console.warn so
        // server-side API error logging remains observable in production.
        compress: { drop_console: ['log', 'debug', 'info'], drop_debugger: true, passes: 2 },
        mangle: { safari10: true }
      }
    },
    ssr: {},
    optimizeDeps: {
      include: ['@supabase/supabase-js', 'zod']
    },
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
    format: 'directory'
  }
});
