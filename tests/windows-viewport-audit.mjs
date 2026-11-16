import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const viewports = [
  { label: '1366x768 100% Windows content', w:1366, h:650 },
  { label: '1366x768 125% scaling', w:1093, h:520 },
  { label: '1366x768 150% scaling', w:910, h:430 },
  { label: '1920x1080 125% scaling', w:1536, h:775 },
  { label: '1920x1080 150% scaling', w:1280, h:630 },
  { label: '1280x720 laptop', w:1280, h:605 },
  { label: '1440x900 laptop', w:1440, h:780 },
  { label: '1536x864 laptop', w:1536, h:745 },
  { label: '1600x900 laptop', w:1600, h:780 },
  { label: '1024x768 tablet', w:1024, h:700 },
  { label: '810x600 tablet', w:810, h:600 },
  { label: '801x600 breakpoint', w:801, h:600 },
  { label: '800x600 mobile breakpoint', w:800, h:600 },
  { label: '768x640 tablet', w:768, h:640 },
  { label: '390x750 mobile', w:390, h:750 },
  { label: '320x640 mobile', w:320, h:640 }
];
const routes = ['/', '/work/distributed-billing/', '/work/order-scheduler/'];
let failures=0, checked=0;
try {
  for(const v of viewports){
    const page=await browser.newPage({viewport:{width:v.w,height:v.h},deviceScaleFactor:1});
    for(const path of routes){
      for(const theme of ['dark','light']){
        await page.goto('http://127.0.0.1:4321'+path, {waitUntil:'networkidle'});
        await page.evaluate(async t=>{document.documentElement.dataset.theme=t;await document.fonts.ready},theme);
        const m=await page.evaluate(()=>{
          const $=s=>document.querySelector(s);
          const rect=s=>{
            const el=$(s); if(!el) return null;
            const r=el.getBoundingClientRect();
            return {x:Math.round(r.left),y:Math.round(r.top),right:Math.round(r.right),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height)}
          };
          const displayed=s=>{const el=$(s);if(!el)return false;const cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'};
          const h=$('main h1'),eyebrow=$('.eyebrow'),aside=$('.intro-aside');
          return {
            viewport:{width:innerWidth,height:innerHeight},
            scroll:{document:document.documentElement.scrollWidth,body:document.body.scrollWidth,height:document.documentElement.scrollHeight},
            header:rect('.site-header'),
            logo:rect('.brand'),
            desktopNav:displayed('.desktop-nav')?rect('.desktop-nav'):null,
            actions:rect('.header-actions'),
            menuVisible:displayed('.mobile-menu-button'),
            hero:rect('.intro'),headline:rect('.intro h1'),intro:rect('.intro-content'),
            eyebrow:rect('.eyebrow'),card:rect('.intro-aside'),
            cta:rect('.intro-links .button-primary'),identityStrip:rect('.marquee-rule'),
            title:!!h?.textContent?.trim(),
            cardTextClipped:aside?aside.scrollHeight>aside.clientHeight+2:false,
            scrolled:document.documentElement.scrollHeight>innerHeight
          };
        });
        const errors=[];
        if(m.scroll.document>v.w+2 || m.scroll.body>v.w+2)errors.push('horizontal-overflow');
        if(!m.title)errors.push('missing-title');
        if(m.desktopNav&&m.desktopNav.x<m.logo.right-1)errors.push('navigation-overlaps-logo');
        if(m.desktopNav&&m.actions&&m.desktopNav.right>m.actions.x+1)errors.push('nav-overlaps-actions');
        if(!m.menuVisible && v.w<=800)errors.push('menu-hidden');
        if(m.menuVisible && v.w>800)errors.push('unexpected-menu-on-desktop');
        if(m.cardTextClipped)errors.push('note-overflows');
        if(path==='/'){
          if(!m.cta?.width)errors.push('missing-cta');
          if(v.w>800&&m.card?.x<m.intro?.right-20)errors.push('columns-overlap');
          if(m.card?.right>v.w+4)errors.push('note-offscreen');
        }
        checked++;failures+=errors.length;
        console.log('WINDOWS_AUDIT '+JSON.stringify({label:v.label,path,theme,...m,errors}));
      }
    }
    await page.close();
  }
}finally{await browser.close()}
console.log('WINDOWS_AUDIT_SUMMARY '+JSON.stringify({checked,failures}));
if(failures)process.exitCode=1;
