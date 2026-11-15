import { chromium } from 'playwright-core';

const base = 'http://127.0.0.1:4321';
const pages = ['/', '/work/distributed-billing/', '/work/order-scheduler/'];
const widths = [320, 375, 390, 768, 1280, 1440];
const browser = await chromium.launch({
  executablePath: process.env.CHROME_BIN || '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const results = [];
let failures = 0;
try {
  for (const width of widths) {
    const page = await browser.newPage({viewport: {width, height: 900}, deviceScaleFactor: 1});
    for (const path of pages) {
      for (const theme of ['dark','light']) {
        await page.goto(base + path, {waitUntil:'networkidle'});
        await page.evaluate(async mode => {
          document.documentElement.dataset.theme = mode;
          await document.fonts.ready;
        }, theme);
        const metrics = await page.evaluate(() => {
          const el = s => document.querySelector(s);
          const css = s => el(s) ? getComputedStyle(el(s)) : null;
          const box = s => {
            const v=el(s);
            if (!v) return null;
            const r=v.getBoundingClientRect();
            return {x: Math.round(r.x),y:Math.round(r.y),width:Math.round(r.width),height:Math.round(r.height)};
          };
          const table = el('.v23-decision-table, .scheduler-matrix-scroll');
          const hint = el('.table-scroll-hint');
          const navBtn = el('[data-menu-toggle]');
          const toc = el('.case-mobile-toc');
          return {
            viewport: innerWidth,
            docWidth: document.documentElement.scrollWidth,
            title: box('main h1'),
            identity: box('.eyebrow-identity'),
            bodyTextPx: parseFloat(css('.case-section p:not(.case-label)')?.fontSize || '0'),
            disclosurePx: parseFloat(css('.case-disclosure')?.fontSize || '0'),
            tableCellPx: parseFloat(css('.scheduler-matrix td')?.fontSize || '0'),
            tableHintVisible: hint ? css('.table-scroll-hint').display !== 'none' : null,
            tableScrollable: table ? table.scrollWidth > table.clientWidth + 1 : null,
            navVisible: !!navBtn && css('[data-menu-toggle]').display !== 'none',
            tocVisible: !!toc && css('.case-mobile-toc').display !== 'none',
            headlineExists: !!el('main h1')?.textContent?.trim(),
            nameVisible: !!el('.eyebrow-identity')?.textContent?.includes('Priyansh Sharma'),
            cta: box('.intro-links .button-primary')
          };
        });
        const errors=[];
        if(metrics.docWidth > width+1)errors.push('horizontal document overflow');
        if(!metrics.headlineExists)errors.push('missing headline');
        if(path==='/'){
          if(!metrics.nameVisible)errors.push('full name absent');
          if(!metrics.cta?.width)errors.push('homepage CTA missing');
        } else {
          if(metrics.bodyTextPx < 15)errors.push('body prose under 15px');
          if(metrics.disclosurePx < 14)errors.push('disclosure under 14px');
          if(width<=768 && !metrics.tocVisible)errors.push('mobile article navigation hidden');
          if(width<=540 && !metrics.tableHintVisible)errors.push('missing mobile table hint');
          if(width>540 && metrics.tableHintVisible)errors.push('table hint visible on larger viewport');
          if(width<=390 && !metrics.tableScrollable)errors.push('table does not horizontally scroll');
          if(path.includes('order-scheduler') && metrics.tableCellPx<13) errors.push('matrix text under 13px');
        }
        if(width<=768 && !metrics.navVisible)errors.push('mobile menu control missing');
        results.push({width,path,theme,...metrics,errors});
        console.log('READABILITY '+JSON.stringify({width,path,theme,...metrics,errors}));
        failures+=errors.length;
      }
      if(path!=='/'){
        await page.goto(base+path,{waitUntil:'networkidle'});
        const accordion=page.locator('details.v23-scenario').first();
        if(await accordion.count()){
          await accordion.locator('summary').click();
          const expanded=await accordion.evaluate(el=>el.open);
          await accordion.locator('summary').click();
          const collapsed=!(await accordion.evaluate(el=>el.open));
          if(!expanded||!collapsed){
            failures++;
            console.log('ACCORDION_FAILURE '+JSON.stringify({width,path,expanded,collapsed}));
          }
        }
      }
    }
    await page.close();
  }
}finally{await browser.close();}
console.log('READABILITY_SUMMARY '+JSON.stringify({scenarios:results.length,failures}));
if(failures)process.exitCode=1;
