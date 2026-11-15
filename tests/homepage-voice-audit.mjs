import { chromium } from 'playwright-core';

const widths = [320, 375, 390, 768, 1024, 1280, 1440, 1920];
const browser = await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
let failures = 0, count = 0;
try {
  for (const width of widths) {
    const page = await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    for (const theme of ['dark','light']) {
      await page.goto('http://127.0.0.1:4321/',{waitUntil:'networkidle'});
      await page.evaluate(async t=>{document.documentElement.dataset.theme=t;await document.fonts.ready;},theme);
      const m=await page.evaluate(()=>{
        const q=s=>document.querySelector(s);
        const b=s=>{const e=q(s);if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),right:Math.round(r.right),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height)}};
        const h=q('h1');
        const c=q('.intro-aside');
        const cardText=q('.note-body');
        const link=q('.intro-links .button-primary');
        return {viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,hero:b('.intro'),name:b('.eyebrow-identity'),headline:b('.intro h1'),headlineLineCount:h?Math.round(h.getBoundingClientRect().height/parseFloat(getComputedStyle(h).lineHeight)):0,content:b('.intro-content'),card:b('.intro-aside'),cardText:b('.note-body'),cardOverflow:c?c.scrollHeight>c.clientHeight+1:false,bodyOverflow:cardText?cardText.scrollHeight>cardText.clientHeight+1:false,cta:b('.intro-links .button-primary'),ctaVisible:!!link && getComputedStyle(link).visibility==='visible',headlineText:h?.textContent?.trim(),identity:q('.eyebrow-identity')?.textContent?.trim(),newCopy:q('.intro-lede')?.textContent?.includes('AI-powered developer tooling'),noteText:q('.note-body')?.textContent?.includes("getting something to work"),theme:document.documentElement.dataset.theme};
      });
      const faults=[];
      if(m.pageWidth>width+1)faults.push('horizontal overflow');
      if(!m.identity?.includes('Priyansh Sharma'))faults.push('identity missing');
      if(!m.headlineText?.includes('work together.'))faults.push('hero copy missing');
      if(!m.newCopy||!m.noteText)faults.push('new copy missing');
      if(m.headlineLineCount>4)faults.push('too many headline lines');
      if(!m.ctaVisible||m.cta.width<140)faults.push('CTA not visible');
      if(m.cardOverflow||m.bodyOverflow)faults.push('note card text clipped');
      if(m.card.right>width+3||m.card.x<-3)faults.push('card clipped at viewport');
      if(m.content.right>width+3||m.content.x<-3)faults.push('content clipped at viewport');
      if(width>800 && m.card.x < m.content.right-24)faults.push('desktop card overlaps introduction');
      console.log('VISUAL_AUDIT '+JSON.stringify({width,theme,...m,failures:faults}));
      count++;
      failures+=faults.length;
    }
    await page.close();
  }
} finally {
  await browser.close();
}
console.log('VISUAL_AUDIT_SUMMARY '+JSON.stringify({scenarios:count,failures}));
if(failures)process.exitCode=1;
