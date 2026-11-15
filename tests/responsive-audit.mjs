import { chromium } from 'playwright-core';

const origin = 'http://127.0.0.1:4321';
const widths = [320, 375, 390, 768];
const paths = ['/', '/work/distributed-billing/', '/work/order-scheduler/'];
const binary = process.env.CHROME_BIN || '/usr/bin/google-chrome';
const browser = await chromium.launch({
  executablePath: binary,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const findings = [];
let failures = 0;
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1 });
    for (const path of paths) {
      for (const theme of ['dark', 'light']) {
        await page.goto(origin + path, { waitUntil: 'networkidle' });
        await page.evaluate(async selected => {
          document.documentElement.dataset.theme = selected;
          await document.fonts.ready;
        }, theme);
        const measured = await page.evaluate(() => {
          const $ = s => document.querySelector(s);
          const bounds = el => {
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
          };
          const visible = el => !!el && getComputedStyle(el).display !== 'none';
          const root = document.documentElement;
          const name = $('.eyebrow-identity');
          const toc = $('.case-mobile-toc');
          const navButton = $('[data-menu-toggle]');
          const title = $('main h1');
          const pageWidth = root.clientWidth;
          return {
            viewport: innerWidth,
            scrollWidth: root.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            headline: bounds(title),
            identity: bounds(name),
            eyebrow: bounds($('.eyebrow')),
            card: bounds($('.intro-aside')),
            header: bounds($('.site-header')),
            cta: bounds($('.intro-links .button-primary')),
            navVisible: visible(navButton),
            caseTocVisible: visible(toc),
            hasMainTitle: !!title?.textContent?.trim(),
            hasFullName: name ? name.textContent.includes('Priyansh Sharma') : null,
            fonts: { name: name ? getComputedStyle(name).fontSize : null, headline: title ? getComputedStyle(title).fontSize : null }
          };
        });
        const fail = [];
        if (measured.scrollWidth > measured.viewport + 1 || measured.bodyScrollWidth > measured.viewport + 1) {
          fail.push('horizontal document overflow');
        }
        if (!measured.hasMainTitle) fail.push('missing page headline');
        if (!measured.navVisible) fail.push('mobile menu hidden');
        if (path === '/') {
          if (!measured.hasFullName) fail.push('full name absent');
          if (!measured.cta?.width) fail.push('CTA absent');
          if (measured.card && measured.card.x + measured.card.width > width + 2) fail.push('note card exceeds viewport');
        } else if (!measured.caseTocVisible) {
          fail.push('article table of contents hidden');
        }
        const item = { width, path, theme, ...measured, failures: fail };
        findings.push(item);
        if (fail.length) failures += fail.length;
        console.log('RESPONSIVE ' + JSON.stringify(item));
      }
      if (width <= 800) {
        await page.goto(origin + path, { waitUntil: 'networkidle' });
        const menu = page.locator('[data-menu-toggle]');
        if (await menu.isVisible()) {
          await menu.click();
          const expanded = await menu.getAttribute('aria-expanded');
          await page.keyboard.press('Escape');
          const collapsed = await menu.getAttribute('aria-expanded');
          if (expanded !== 'true' || collapsed !== 'false') {
            failures++;
            console.log('NAV_FAILURE ' + JSON.stringify({ width, path, expanded, collapsed }));
          }
        } else {
          failures++;
          console.log('NAV_FAILURE ' + JSON.stringify({ width, path, reason: 'button not visible' }));
        }
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('RESPONSIVE_SUMMARY ' + JSON.stringify({ checked: findings.length, failures }));
if (failures) process.exitCode = 1;
