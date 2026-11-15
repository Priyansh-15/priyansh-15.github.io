import { chromium } from 'playwright-core';

const base = 'http://127.0.0.1:4321';
const scenarios = [
  ['baseline', ''],
  ['balanced', `
@media (min-width:801px) {
 .intro {padding-top:72px;padding-bottom:76px;gap:clamp(48px,6vw,92px)}
 .eyebrow {margin-bottom:26px}
 .intro h1 {font-size:clamp(52px,4.5vw,70px);line-height:1.09;margin-bottom:28px}
 .intro-lede {line-height:1.68;margin-bottom:15px}
 .intro-secondary {line-height:1.68}
 .intro-links {margin-top:27px}
}
.note-top,.note-bottom {padding:17px 23px}
.note-body {padding:27px 26px 23px}
.note-body p {font-size:16px;line-height:1.65;margin-bottom:17px}
@media (min-width:541px) and (max-width:800px) {
 .intro {padding-top:70px;padding-bottom:78px;gap:52px}
 .eyebrow {margin-bottom:26px}
 .intro h1 {margin-bottom:28px}
 .intro-links {margin-top:27px}
}
@media (max-width:540px) {
 .intro {padding-top:47px;padding-bottom:70px;gap:40px}
 .eyebrow {margin-bottom:24px}
 .intro h1 {margin-bottom:27px}
 .intro-links {margin-top:27px}
 .note-body {padding:25px 23px 22px}
 .note-body p {font-size:15px}
}
`],
  ['compact', `
@media (min-width:801px) {
 .intro {padding-top:65px;padding-bottom:70px;gap:clamp(40px,5.3vw,84px)}
 .eyebrow {margin-bottom:23px}
 .intro h1 {font-size:clamp(49px,4.1vw,64px);line-height:1.09;margin-bottom:24px}
 .intro-lede {font-size:17px;line-height:1.64;margin-bottom:14px}
 .intro-secondary {font-size:15px;line-height:1.65}
 .intro-links {margin-top:24px}
}
.note-top,.note-bottom {padding:16px 22px}
.note-body {padding:25px 25px 21px}
.note-body p {font-size:16px;line-height:1.6;margin-bottom:16px}
@media (min-width:541px) and (max-width:800px) {
 .intro {padding-top:65px;padding-bottom:72px;gap:48px}
 .eyebrow {margin-bottom:24px}
 .intro h1 {margin-bottom:24px}
 .intro-links {margin-top:24px}
}
@media (max-width:540px) {
 .intro {padding-top:43px;padding-bottom:64px;gap:36px}
 .eyebrow {margin-bottom:22px}
 .intro h1 {font-size:clamp(42px,11vw,62px);margin-bottom:25px}
 .intro-links {margin-top:24px}
 .note-body {padding:24px 22px 20px}
 .note-body p {font-size:15px;line-height:1.62}
}
`],
  ['editorial', `
@media (min-width:801px) {
 .intro {padding-top:70px;padding-bottom:72px;gap:clamp(43px,5.8vw,92px)}
 .eyebrow {margin-bottom:26px}
 .intro h1 {font-size:clamp(52px,4.8vw,74px);line-height:1.06;margin-bottom:27px}
 .intro-lede {line-height:1.68;margin-bottom:15px}
 .intro-secondary {line-height:1.68}
 .intro-links {margin-top:26px}
}
.note-top,.note-bottom {padding:17px 23px}
.note-body {padding:27px 26px 23px}
.note-body p {font-size:16px;line-height:1.65;margin-bottom:17px}
@media (min-width:541px) and (max-width:800px) {
 .intro {padding-top:70px;padding-bottom:78px;gap:52px}
 .eyebrow {margin-bottom:26px}
 .intro h1 {margin-bottom:28px}
 .intro-links {margin-top:27px}
}
@media (max-width:540px) {
 .intro {padding-top:47px;padding-bottom:70px;gap:40px}
 .eyebrow {margin-bottom:24px}
 .intro h1 {margin-bottom:27px}
 .intro-links {margin-top:27px}
 .note-body {padding:25px 23px 22px}
 .note-body p {font-size:15px}
}
`],
];

const browser = await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
for(const width of [320,390,768,1024,1280,1525,1920]){
  const page=await browser.newPage({viewport:{width,height:992},deviceScaleFactor:1});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready});
  for(const [variant, css] of scenarios){
    const stylesheet= css?await page.addStyleTag({content:css}):null;
    const measure=await page.evaluate(()=>{
      const e=s=>document.querySelector(s);
      const bb=s=>{const r=e(s).getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),bottom:Math.round(r.bottom),right:Math.round(r.right)};};
      const h=e('.intro h1');
      const note=e('.intro-aside');
      return {
        bodyW:document.documentElement.scrollWidth,
        header:bb('.site-header'),
        intro:bb('.intro'), headline:bb('.intro h1'),
        lines:Math.round(h.getBoundingClientRect().height/parseFloat(getComputedStyle(h).lineHeight)),
        font:parseFloat(getComputedStyle(h).fontSize),
        note:bb('.intro-aside'), cardClipped:note.scrollHeight>note.clientHeight+1,
        cta:bb('.intro-links .button-primary'),
        text:bb('.intro-lede'),
        second:bb('.intro-secondary')
      }
    });
    console.log('VARIANT '+JSON.stringify({variant,width,...measure}));
    await stylesheet?.evaluate(el=>el.remove());
  }
  await page.close();
}
await browser.close();
