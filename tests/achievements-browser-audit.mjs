import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const viewports = [
  [320, 640], [360, 720], [375, 760], [390, 750], [428, 820],
  [540, 720], [650, 760], [768, 800], [800, 600], [801, 600],
  [910, 430], [1024, 700], [1093, 520], [1280, 630],
  [1366, 650], [1536, 745], [1920, 930],
];
const routes = ['/', '/achievements/', '/projects/', '/work/distributed-billing/'];
let count=0;
const failures=[];

try {
  for (const [width, height] of viewports) {
    const page = await browser.newPage({viewport:{width,height}});
    for (const route of routes) {
      await page.goto('http://127.0.0.1:4321'+route,{waitUntil:'networkidle'});
      for (const theme of ['dark','light']) {
        await page.evaluate(async t=>{
          document.documentElement.dataset.theme=t;
          await document.fonts.ready;
        },theme);
        const m=await page.evaluate(()=>{
          const $=s=>document.querySelector(s);
          const cards=[...document.querySelectorAll('.ach-feature')].map(x=>x.getBoundingClientRect().toJSON());
          const allExternal=[...document.querySelectorAll('a[target="_blank"]')];
          const links=[...document.querySelectorAll('a[href*="drive.google.com/file/d/"]')].map(x=>x.href);
          return {
            htmlWidth:document.documentElement.scrollWidth,
            bodyWidth:document.body.scrollWidth,
            width:window.innerWidth,
            h1:!!$('h1'),
            anchors:['highlights','record','credentials'].every(id=>!!document.getElementById(id)),
            featureCount:cards.length,
            recordCount:document.querySelectorAll('.ach-ledger-row').length,
            certCount:document.querySelectorAll('.ach-credential').length,
            driveLinks:links,
            allLinksSafe:allExternal.every(x=>x.rel.includes('noopener')&&x.rel.includes('noreferrer')),
            featureCards:cards,
            homepageBridge:!!$('.work-directory-link[href="/achievements/"]'),
            headerLinks:[...document.querySelectorAll('.desktop-nav a')].length,
          };
        });
        const errors=[];
        if(m.htmlWidth>width+1||m.bodyWidth>width+1)errors.push('horizontal overflow');
        if(!m.h1)errors.push('missing h1');
        if(!m.allLinksSafe)errors.push('unsafe external link');
        if(route==='/achievements/'){
          if(!m.anchors)errors.push('missing achievement anchors');
          if(m.featureCount!==4)errors.push('incorrect featured rank count');
          if(m.recordCount!==10)errors.push('incorrect complete record count');
          if(m.certCount!==1)errors.push('incorrect certificate count');
          if(m.driveLinks.length!==15)errors.push('source links missing');
          if(new Set(m.driveLinks).size!==11)errors.push('incorrect source document diversity');
          for(let i=0;i<m.featureCards.length;i++){
            for(let j=i+1;j<m.featureCards.length;j++){
              const a=m.featureCards[i],b=m.featureCards[j];
              if(a.left+1<b.right&&a.right-1>b.left&&a.top+1<b.bottom&&a.bottom-1>b.top){
                errors.push('featured cards overlap');
              }
            }
          }
        }
        if(route==='/'&&!m.homepageBridge)errors.push('missing homepage achievements entry point');
        if(m.headerLinks!==5)errors.push('global navigation changed');
        if(errors.length)failures.push({route,theme,width,height,errors});
        count++;
        if(route==='/achievements/'&&theme==='dark'){
          console.log('ACH_VIEW '+JSON.stringify({width,height,htmlWidth:m.htmlWidth,features:m.featureCount,records:m.recordCount,certificate:m.certCount,links:m.driveLinks.length,errors}));
        }
      }
    }
    await page.close();
  }
  const page=await browser.newPage();
  const res=await page.goto('http://127.0.0.1:4321/achievements_and_certifications.html',{waitUntil:'networkidle'});
  if(!res||res.status()!==200||!page.url().endsWith('/achievements/')){
    failures.push({route:'legacy',url:page.url(),status:res?.status(),errors:['legacy redirect']});
  }
  await page.close();
}finally{await browser.close()}

console.log('ACHIEVEMENTS_AUDIT_SUMMARY '+JSON.stringify({checks:count,failures:failures.length,errors:failures}));
if(failures.length)process.exitCode=1;
