import { defineConfig } from 'astro/config';

// Set `site` to the production domain once it is confirmed
// (also update robots.txt and the og:url/canonical tags in Base.astro).
export default defineConfig({
  server: { port: 4321 },
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
});
