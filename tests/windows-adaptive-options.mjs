import { chromium } from 'playwright-core';

const variants = [
  { name: 'baseline', css: '' },
  {
    name: 'short-height-adaptive',
    css: `
@media (min-width: 801px) and (max-height: 740px) {
  .intro {padding-top: clamp(26px, 4vh, 42px); padding-bottom: 42px}
  .eyebrow {margin-bottom: 18px}
  .intro h1 {font-size: clamp(46px, 4.2vw, 62px);margin-bottom: 21px;line-height: 1.09}
  .intro-lede {font-size: 16px;line-height: 1.58;margin-bottom: 12px}
  .intro-secondary {font-size: 15px;line-height: 1.56}
  .intro-links {margin-top: 20px;gap: 20px}
  .note-body {padding: 22px 23px 19px}
  .note-body p {font-size: 15px;line-height: 1.6;margin-bottom: 15px}
  .note-top, .note-bottom {padding: 14px 20px}
}
@media (min-width: 801px) and (max-width: 1100px) {
  .intro {grid-template-columns: 1.18fr .82fr; gap: clamp(22px, 3vw, 40px)}
  .desktop-nav {gap: 23px; margin-right: 22px}
}
`
  },
  {
    name: 'stack-mid-viewport',
    css: `
@media (min-width: 801px) and (max-width: 1100px) {
  .intro {grid-template-columns: 1fr;gap: 46px;padding-top: 42px;padding-bottom: 58px}
  .intro-content {max-width: 850px}
  .intro h1 {font-size: clamp(48px, 5.5vw, 62px);margin-bottom: 24px}
  .eyebrow {margin-bottom: 22px}
  .intro-links {margin-top: 24px}
  .intro-aside {justify-self: start;max-width: 540px;transform: rotate(.75deg)}
  .desktop-nav {gap: 22px;margin-right: 22px}
}
@media (min-width: 1101px) and (max-height: 740px) {
  .intro {padding-top: 40px;padding-bottom: 45px}
  .eyebrow {margin-bottom: 21px}
  .intro h1 {margin-bottom: 24px;font-size: clamp(52px, 4.25vw, 65px)}
  .intro-lede {line-height: 1.6}
  .intro-secondary {line-height: 1.6}
  .intro-links {margin-top: 22px}
}
`
  },
  {
    name: 'balanced-combination',
    css: `
@media (min-width: 801px) and (max-width: 1040px) {
  .intro {grid-template-columns: 1fr;gap: 42px;padding-top: 38px;padding-bottom: 55px}
  .intro-content {max-width: 850px}
  .intro h1 {font-size: clamp(47px, 5.5vw, 60px);margin-bottom: 23px}
  .eyebrow {margin-bottom: 21px}
  .intro-links {margin-top: 23px}
  .intro-aside {justify-self: start;max-width: 540px;transform: rotate(.75deg)}
  .desktop-nav {gap: 20px;margin-right: 20px}
}
@media (min-width: 1041px) and (max-width: 1200px) {
  .intro {grid-template-columns: 1.12fr .88fr;gap: 28px}
  .desktop-nav {gap: 24px;margin-right: 22px}
}
@media (min-width: 801px) and (max-height: 740px) {
  .intro {padding-top: clamp(26px, 4.3vh, 42px);padding-bottom: 45px}
  .eyebrow {margin-bottom: 21px}
  .intro h1 {font-size: clamp(48px, 4.45vw, 65px);margin-bottom: 23px}
  .intro-lede {line-height: 1.58;margin-bottom: 13px}
  .intro-secondary {line-height: 1.6}
  .intro-links {margin-top: 22px}
  .note-body {padding: 24px 24px 21px}
  .note-body p {font-size: 16px;line-height: 1.58;margin-bottom: 16px}
  .note-top,.note-bottom {padding: 15px 21px}
}
`
  }
];
const cases=[
  {w:1366,h:650,label:'1366x768'},
  {w:1093,h:520,label:'1366 125%'},
  {w:910,h:430,label:'1366 150%'},
  {w:1280,h:605,label:'1280x720'},
  {w:1024,h:700,label:'1024x768'},
  {w:801,h:600,label:'801 breakpoint'},
  {w:810,h:600,label:'810 breakpoint'},
  {w:1180,h:650,label:'1180x650'},
  {w:1440,h:780,label:'1440x900'},
  {w:1536,h:745,label:'1536x864'},
  {w:1920,h:930,label:'1920x1080'},
];
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const v of cases){
   const page=await browser.newPage({viewport:{width:v.w,height:v.h}});
   await page.goto('http://127.0.0.1:4321/',{waitUntil:'networkidle'});
   await page.evaluate(async()=>{await document.fonts.ready});
   for(const x of variants){
     const injected=x.css?await page.addStyleTag({content:x.css}):null;
     const m=await page.evaluate(()=>{
       const rect=s=>{let r=document.querySelector(s).getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),right:Math.round(r.right),bottom:Math.round(r.bottom),width:Math.round(r.width),height:Math.round(r.height)}};
       const title=document.querySelector('.intro h1');
       return {docW:document.documentElement.scrollWidth,header:rect('.site-header'),logo:rect('.brand'),nav:rect('.desktop-nav'),actions:rect('.header-actions'),hero:rect('.intro'),content:rect('.intro-content'),headline:rect('.intro h1'),lines:Math.round(title.getBoundingClientRect().height/parseFloat(getComputedStyle(title).lineHeight)),cta:rect('.intro-links .button-primary'),card:rect('.intro-aside'),strip:rect('.marquee-rule'),font:getComputedStyle(title).fontSize};
     });
     console.log('ADAPTIVE_OPTION '+JSON.stringify({variant:x.name,label:v.label,w:v.w,h:v.h,...m}));
     await injected?.evaluate(el=>el.remove());
   }
   await page.close();
 }
} finally{await browser.close()}
