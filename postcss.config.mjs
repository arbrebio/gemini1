// Tailwind CSS 3 runs as a PostCSS plugin. (The @astrojs/tailwind
// integration that used to wire this up does not support Astro 6+.)
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
