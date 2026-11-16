import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
let checks = 0;
let failures = 0;
const PDF = '/Priyansh_Sharma_Resume.pdf';
const paths = ['/', '/work/distributed-billing/', '/work/order-scheduler/'];
const widths = [320, 390, 768, 1024, 1440];
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const path of paths) {
      for (const theme of ['dark', 'light']) {
        await page.goto('http://127.0.0.1:4321' + path, { waitUntil: 'networkidle' });
        await page.evaluate(async selected => {
          document.documentElement.dataset.theme = selected;
          await document.fonts.ready;
        }, theme);
        const result = await page.evaluate(() => {
          const html = document.documentElement;
          const headerResume = document.querySelector('.desktop-nav a[href$=".pdf"]');
          const mobileResume = document.querySelector('.mobile-nav a[href$=".pdf"]');
          const heroResume = document.querySelector('.intro-links a[href$=".pdf"]');
          const experience = document.querySelector('.experience-section');
          const work = document.querySelector('#work');
          const about = document.querySelector('#about');
          const roles = [...document.querySelectorAll('.experience-roles li')];
          const sectionText = document.querySelector('.about-text')?.textContent || '';
          return {
            documentWidth: html.scrollWidth,
            viewport: window.innerWidth,
            hasHeaderResume: !!headerResume && headerResume.target === '_blank',
            hasMobileResume: !!mobileResume && mobileResume.target === '_blank',
            hasHeroResume: !!heroResume && heroResume.target === '_blank',
            experienceEntries: document.querySelectorAll('.experience-entry').length,
            roles: roles.map(e => e.textContent?.replace(/\\s+/g, ' ').trim()),
            experienceOrder: !!work && !!experience && !!about &&
              (work.compareDocumentPosition(experience) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 &&
              (experience.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
            aboutJiIt: sectionText.includes('studying Computer Science at JIIT'),
            aboutCompetition: sectionText.includes('competitive programming'),
            aboutAi: sectionText.includes('AI-powered developer tools'),
            mobileMenuVisible: getComputedStyle(document.querySelector('[data-menu-toggle]')).display !== 'none',
          };
        });
        const errors = [];
        if (result.documentWidth > width + 1) errors.push('horizontal overflow');
        if (!result.hasHeaderResume || !result.hasMobileResume) errors.push('missing header resume link');
        if (path === '/') {
          if (!result.hasHeroResume) errors.push('missing hero resume');
          if (!result.experienceOrder || result.experienceEntries !== 2) errors.push('experience section structure/order');
          if (result.roles.length !== 3 || !result.roles.some(x => x.includes('Software Engineer II'))) errors.push('career progression');
          if (!result.aboutJiIt || !result.aboutCompetition || !result.aboutAi) errors.push('approved About text');
        }
        if (width <= 768 && !result.mobileMenuVisible) errors.push('mobile menu hidden');
        checks += 1;
        failures += errors.length;
        console.log('AUDIT ' + JSON.stringify({ width, path, theme, ...result, errors }));
      }
      if (width <= 768) {
        const menu = page.locator('[data-menu-toggle]');
        await menu.click();
        const expanded = await menu.getAttribute('aria-expanded');
        const linkShown = await page.locator('.mobile-nav a[href$=".pdf"]').isVisible();
        await page.keyboard.press('Escape');
        const collapsed = await menu.getAttribute('aria-expanded');
        if (expanded !== 'true' || collapsed !== 'false' || !linkShown) {
          failures += 1;
          console.log('NAV_FAIL ' + JSON.stringify({ width, path, expanded, collapsed, linkShown }));
        }
      }
    }
    await page.close();
  }
  const page = await browser.newPage();
  const request = await page.request.get('http://127.0.0.1:4321' + PDF);
  const body = await request.body();
  if (request.status() !== 200 || !body.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    failures += 1;
    console.log('PDF_FAIL ' + JSON.stringify({ status:request.status() }));
  }
  console.log('PDF_HTTP ' + JSON.stringify({ status:request.status(), type:request.headers()['content-type'], bytes:body.length }));
  await page.close();
} finally {
  await browser.close();
}
console.log('AUDIT_SUMMARY ' + JSON.stringify({ checks, failures }));
if (failures) process.exitCode = 1;
