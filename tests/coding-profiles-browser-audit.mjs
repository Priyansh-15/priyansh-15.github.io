import { chromium } from 'playwright-core';

const expected = [
  ['LeetCode', 'Priyansh_15', 'https://leetcode.com/Priyansh_15/'],
  ['Codeforces', 'Priyansh.15', 'https://codeforces.com/profile/Priyansh.15'],
  ['GeeksforGeeks', 'spidey15priyansh', 'https://auth.geeksforgeeks.org/user/spidey15priyansh'],
  ['InterviewBit', 'priyansh-sharma_596', 'https://www.interviewbit.com/profile/priyansh-sharma_596'],
  ['CodeChef', 'spidy_ps15', 'https://www.codechef.com/users/spidy_ps15'],
  ['HackerRank', '15priyansh13_201', 'https://www.hackerrank.com/15priyansh13_201?hr_r=1'],
  ['HackerEarth', '15priyansh13.2001', 'https://www.hackerearth.com/@15priyansh13.2001'],
  ['AtCoder', 'Priyansh15', 'https://atcoder.jp/users/Priyansh15'],
];
const viewports = [
  [320, 640], [360, 720], [375, 760], [390, 750], [428, 820],
  [540, 720], [650, 760], [768, 800], [800, 600], [801, 600],
  [910, 430], [1024, 700], [1093, 520], [1280, 630],
  [1366, 650], [1536, 745], [1920, 930],
];
const routes = ['/', '/coding-profiles/', '/achievements/', '/projects/'];
let checks=0;
const failures=[];
const browser=await chromium.launch({
  executablePath:'/usr/bin/google-chrome',
  headless:true,
  args:['--no-sandbox','--disable-dev-shm-usage'],
});

try{
  for(const [width,height] of viewports){
    const page=await browser.newPage({viewport:{width,height}});
    for(const path of routes){
      await page.goto('http://127.0.0.1:4321'+path,{waitUntil:'networkidle'});
      for(const theme of ['dark','light']){
        await page.evaluate(async t=>{
          document.documentElement.dataset.theme=t;
          await document.fonts.ready;
        },theme);
        const m=await page.evaluate(()=>{
          const get=s=>document.querySelector(s);
          const rows=[...document.querySelectorAll('.coding-profile-row')];
          return {
            viewport:innerWidth,
            htmlWidth:document.documentElement.scrollWidth,
            bodyWidth:document.body.scrollWidth,
            hasH1:!!get('h1'),
            headerLinks:document.querySelectorAll('.desktop-nav a').length,
            safe:[...document.querySelectorAll('a[target="_blank"]')].every(a=>
              a.rel.includes('noopener') && a.rel.includes('noreferrer')),
            profiles:rows.map(r=>({
              name:r.querySelector('strong')?.textContent?.trim(),
              handle:r.querySelector('.coding-profile-main > span')?.textContent?.trim().replace(/^@/,''),
              url:r.href,
              left:r.getBoundingClientRect().left,
              right:r.getBoundingClientRect().right,
            })),
            fromHome:!!get('.about-reference-links a[href="/coding-profiles/"]'),
            fromAchievements:!!get('.ach-lastword-actions a[href="/coding-profiles/"]'),
          };
        });
        const errors=[];
        if(m.htmlWidth>width+1||m.bodyWidth>width+1)errors.push('horizontal overflow');
        if(!m.hasH1)errors.push('missing heading');
        if(!m.safe)errors.push('unsafe external link');
        if(m.headerLinks!==5)errors.push('changed global navigation');
        if(path==='/coding-profiles/'){
          if(m.profiles.length!==8)errors.push('incorrect profile count');
          for(let i=0;i<Math.min(expected.length,m.profiles.length);i++){
            const [name,handle,url]=expected[i],p=m.profiles[i];
            if(p.name!==name||p.handle!==handle||p.url!==url)errors.push('mismatch: '+name);
            if(p.left< -1||p.right>width+2)errors.push('profile row offscreen: '+name);
          }
        }
        if(path==='/'&&!m.fromHome)errors.push('missing homepage link');
        if(path==='/achievements/'&&!m.fromAchievements)errors.push('missing achievements link');
        if(errors.length)failures.push({path,theme,width,height,errors});
        checks++;
        if(path==='/coding-profiles/'&&theme==='dark'){
          console.log('CODING_WIDTH '+JSON.stringify({width,height,documentWidth:m.htmlWidth,profiles:m.profiles.length,errors}));
        }
      }
    }
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:390,height:760}});
  const response=await page.goto('http://127.0.0.1:4321/coding_profile.html',{waitUntil:'networkidle'});
  if(response?.status()!==200||!page.url().endsWith('/coding-profiles/')){
    failures.push({path:'legacy',status:response?.status(),url:page.url(),errors:['legacy redirect']});
  }
  await page.close();
}finally{await browser.close()}

console.log('CODING_BROWSER_SUMMARY '+JSON.stringify({checks,failures:failures.length,errors:failures}));
if(failures.length)process.exitCode=1;
