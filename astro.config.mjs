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
        // Customize sitemap entries
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