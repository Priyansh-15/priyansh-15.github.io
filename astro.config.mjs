import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://priyansh-15.github.io',
  output: 'static',
  build: {
    format: 'preserve',
  },
  redirects: {
    '/about_me': '/#about',
    '/work_experience': '/#work',
    '/coding_profile': 'https://github.com/Priyansh-15',
  },
});
