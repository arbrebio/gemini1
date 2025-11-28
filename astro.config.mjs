import { defineConfig } from 'astro/config';
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
          af: 'af'
        }
      },
      filter: (page) =>
        !page.includes('/newsletter/confirm') &&
        !page.includes('/newsletter/unsubscribe') &&
        !page.includes('/404') &&
        !page.includes('/500') &&
        !page.includes('/api/'),
      changefreq: 'weekly',
      lastmod: new Date().toISOString(),
      serialize: (item) => {
        // Customize sitemap entries with enhanced SEO priorities

        // Homepage - highest priority
        if (item.url === '/' || item.url.match(/\/(en|fr|es|af)\/?$/)) {
          item.priority = 1.0;
          item.changefreq = 'daily';
        }
        // Product pages - very high priority
        else if (item.url.includes('/greenhouses/') ||
          item.url.includes('/irrigation/') ||
          item.url.includes('/substrates/')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        }
        // Main category pages
        else if (item.url.match(/\/(greenhouses|irrigation|substrates|projects|solutions|about|contact)$/)) {
          item.priority = 0.8;
          item.changefreq = 'weekly';
        }
        // Blog posts
        else if (item.url.includes('/blog/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        }
        // Other pages
        else {
          item.priority = 0.6;
          item.changefreq = 'monthly';
        }

        return item;
      }
    })
  ],
  site: 'https://arbrebio.com',
  output: 'static',
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
              if (id.includes('@supabase/supabase-js')) {
                return 'supabase';
              }
              if (id.includes('zod')) {
                return 'zod';
              }
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
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 2
        },
        mangle: {
          safari10: true
        }
      }
    },
    ssr: {
      noExternal: ['@sendgrid/mail']
    },
    optimizeDeps: {
      exclude: ['@sendgrid/mail'],
      include: ['@supabase/supabase-js', 'zod']
    },
  },
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
    assets: '_assets',
    format: 'directory'
  }
});