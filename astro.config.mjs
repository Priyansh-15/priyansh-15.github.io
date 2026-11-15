import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://priyansh-15.github.io',
  output: 'static',
  build: {
    format: 'preserve',
  },
  redirects: {
    '/about_me': '/#about',
    '/projects': '/#work',
    '/work_experience': '/#work',
    '/coding_profile': 'https://github.com/Priyansh-15',
    '/achievements_and_certifications':
      'https://www.linkedin.com/in/priyansh-sharma-bb4095216/',
  },
});
