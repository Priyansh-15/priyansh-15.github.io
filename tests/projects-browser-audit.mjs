import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const viewports = [
  {w:320,h:640}, {w:360,h:720}, {w:375,h:760}, {w:390,h:750}, {w:428,h:820},
  {w:540,h:720}, {w:680,h:820}, {w:768,h:800}, {w:800,h:600}, {w:801,h:600},
  {w:910,h:430}, {w:1024,h:700}, {w:1093,h:520}, {w:1280,h:630},
  {w:1366,h:650}, {w:1536,h:745}, {w:1920,h:930},
];

let checks = 0;
const errors = [];
const pages = ['/', '/projects/', '/work/distributed-billing/', '/work/order-scheduler/'];

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({viewport});
    for (const path of pages) {
      await page.goto('http://127.0.0.1:4321' + path, {waitUntil:'networkidle'});
      for (const theme of ['dark','light']) {
        await page.evaluate(async themeName => {
          document.documentElement.dataset.theme = themeName;
          await document.fonts.ready;
        }, theme);

        const result = await page.evaluate(() => {
          const select = s => document.querySelector(s);
          const projects = document.body.classList.contains('projects-page') ||
            !!select('.projects-page');
          const rectangles = [...document.querySelectorAll('.projects-archive-card')].map(el => {
            const r=el.getBoundingClientRect();
            return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};
          });
          const visible = el => {
            if (!el) return false;
            const s=getComputedStyle(el);
            return s.display !== 'none' && s.visibility !== 'hidden';
          };
          return {
            viewport:innerWidth,
            htmlWidth:document.documentElement.scrollWidth,
            bodyWidth:document.body.scrollWidth,
            title:document.title,
            h1:!!select('h1'),
            visibleMobileMenu:visible(select('[data-menu-toggle]')),
            projects,
            professionalCount:document.querySelectorAll('.projects-professional-card').length,
            archiveCount:rectangles.length,
            independent:!!select('.projects-independent-feature'),
            sections:['professional','independent','earlier'].every(id=>!!document.getElementById(id)),
            links:[...document.querySelectorAll('.projects-archive-links a')].map(a=>a.href),
            allBlankSafe:[...document.querySelectorAll('a[target="_blank"]')].every(a=>
              (a.rel || '').includes('noopener') && (a.rel || '').includes('noreferrer')),
            homeProjectLink:!!select('.work-directory-link[href="/projects/"]'),
            codeIntelligence:select('#code-intelligence')?.textContent.includes('entire team'),
            aiHomepage:!!select('a[href="/projects/#code-intelligence"]'),
            previewWidth:select('.projects-independent-feature')?.getBoundingClientRect().width,
            cards:rectangles,
          };
        });

        const why = [];
        if (result.htmlWidth > viewport.w + 1 || result.bodyWidth > viewport.w + 1)
          why.push('horizontal overflow');
        if (!result.h1) why.push('missing heading');
        if (!result.allBlankSafe) why.push('unsafe external target');
        if (path === '/projects/') {
          if (!result.sections || !result.independent) why.push('missing project group');
          if (result.professionalCount !== 3) why.push('professional count');
          if (result.archiveCount !== 7) why.push('archive count');
          if (result.links.length < 7) why.push('repository coverage');
          if (!result.codeIntelligence) why.push('team-adoption attribution');
          if (result.previewWidth > viewport.w + 1) why.push('project feature offscreen');
          const sorted = result.cards.slice();
          for(let i=0;i<sorted.length;i++)
            for(let j=i+1;j<sorted.length;j++) {
              const a=sorted[i], b=sorted[j];
              if(a.left+1 < b.right && a.right-1 > b.left &&
                 a.top+1 < b.bottom && a.bottom-1 > b.top)
                 why.push('archive cards overlap');
            }
        }
        if (path === '/' && (!result.homeProjectLink || !result.aiHomepage))
          why.push('missing home-to-project navigation');
        if (why.length) errors.push({path,theme,viewport:viewport.w,why});
        checks++;
        if (path === '/projects/' && theme === 'dark') {
          console.log('PROJECTS_SAMPLE '+JSON.stringify({
            width:viewport.w,height:viewport.h,
            htmlWidth:result.htmlWidth,
            groups:result.professionalCount+'/'+result.independent+'/'+result.archiveCount,
            safe:result.allBlankSafe,
          }));
        }
      }
    }
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:750}});
  const response=await page.goto('http://127.0.0.1:4321/projects.html',{waitUntil:'domcontentloaded'});
  const finalUrl=page.url();
  if(response?.status()!==200 || !finalUrl.endsWith('/projects/'))
    errors.push({path:'/projects.html',why:['legacy redirect broken'],status:response?.status(),finalUrl});
  const anchor=await page.locator('a[href="#earlier"]');
  if(await anchor.count()){
    await anchor.click();
    if(!page.url().endsWith('/projects/#earlier'))errors.push({path:'/projects/',why:['in-page links broken']});
  }else{
    errors.push({path:'/projects/',why:['missing category navigation']});
  }
  await page.close();
} finally {
  await browser.close();
}

console.log('PROJECTS_BROWSER_SUMMARY '+JSON.stringify({checks,failures:errors.length,errors}));
if (errors.length) process.exitCode=1;
