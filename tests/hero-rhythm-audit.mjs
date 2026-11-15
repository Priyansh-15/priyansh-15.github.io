import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const widths = [320, 390, 768, 1024, 1280, 1440, 1525, 1920];
let errors = 0, tested = 0;
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    for (const theme of ['dark', 'light']) {
      await page.goto('http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
      const data = await page.evaluate(async selectedTheme => {
        document.documentElement.dataset.theme = selectedTheme;
        await document.fonts.ready;
        const get = s => document.querySelector(s);
        const rect = s => {
          const r = get(s)?.getBoundingClientRect();
          return r ? { x:Math.round(r.x), y:Math.round(r.y), right:Math.round(r.right),
            bottom:Math.round(r.bottom), width:Math.round(r.width), height:Math.round(r.height)} : null;
        };
        const heading = get('.intro h1');
        const card = get('.intro-aside');
        return {
          width:innerWidth, theme:selectedTheme,
          scrollWidth:document.documentElement.scrollWidth,
          heading:rect('.intro h1'),
          headingLines:Math.round(heading.getBoundingClientRect().height / parseFloat(getComputedStyle(heading).lineHeight)),
          headingText:heading.textContent.trim(),
          name:get('.eyebrow-identity')?.textContent.trim(),
          card:rect('.intro-aside'),
          noteLines:Math.round(get('.note-body').getBoundingClientRect().height),
          noteClipped: card.scrollHeight > card.clientHeight + 1,
          cta:rect('.intro-links .button-primary'),
          intro:rect('.intro-content')
        };
      }, theme);
      const problems=[];
      if (data.scrollWidth>width+1) problems.push('horizontal page overflow');
      if (!data.name.includes('Priyansh Sharma')) problems.push('name missing');
      if (!data.headingText.includes('I make complex things') || !data.headingText.includes('work together.')) problems.push('headline incorrect');
      if (data.headingLines > (width <= 390 ? 4 : width<1024 ? 3 : 3)) problems.push('headline lines unexpected');
      if (data.noteClipped) problems.push('note clipped');
      if (data.card.right > width+3) problems.push('note offscreen');
      if (data.cta.right > width+2) problems.push('CTA offscreen');
      if (width >= 1280 && data.card.x < data.intro.right-16) problems.push('desktop overlap');
      errors += problems.length; tested++;
      console.log('HERO_MEASURE '+JSON.stringify({...data,problems}));
    }
    await page.close();
  }
} finally { await browser.close(); }
console.log('HERO_SUMMARY '+JSON.stringify({tested,errors}));
if(errors) process.exitCode=1;
