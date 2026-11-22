import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {courses} from '../web/curriculum-data.js';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({args:['--no-sandbox']});
const url=process.env.PREVIEW_URL||'http://localhost:5173';
const total=Object.keys(courses).length;
let runs=0;
try{
 for(const [device,width] of [['Galaxy',390],['iPhone',1028]]){
  const page=await browser.newPage({viewport:{width,height:850}});
  page.setDefaultTimeout(5000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const cmd=async key=>{try{await page.locator(`[data-course="${key}"]`).click();}catch(error){throw new Error(`${device} ${page.url()} — ${key}\n${await page.locator('#active-course').innerText()}`,{cause:error});}};
  const status=()=>page.locator('#course-status').textContent();
  const submit=()=>page.locator('#course-form button[type=submit]').click();
  const stage=n=>page.locator(`.course-rail li:nth-child(${n})[aria-current]`).waitFor();
  await page.goto(url);
  await page.getByRole('link',{name:'앱 시작하기'}).click();
  await page.locator(`[data-action="device:${device}"]`).click();
  await page.locator('a[data-go=courses]').first().click();
  await page.locator('.course-index-link').first().waitFor();
  assert.equal(await page.locator('.course-index-link').count(),total);
  for(const [id,course] of Object.entries(courses)){
   await page.goto(`${url}/#course/${id}`);
   await cmd('concept');await stage(2);await cmd('observe');await stage(3);
   const checkReference=async()=>{const panel=page.locator('.official-screen');await panel.waitFor();for(const a of await panel.locator('a').all())assert.match(new URL(await a.getAttribute('href')).hostname,device==='Galaxy'?/\.samsung\.com$/:/\.apple\.com$/);assert.equal(await panel.locator('img').count(),0);};
   await checkReference();
   if(course.tasks.length>1)for(const i of course.tasks.keys()){await cmd(`show:${i}`);await checkReference();}
   await cmd('guided');await stage(4);await cmd('wrong-app');assert.ok(await status());
   await page.reload();await stage(4);
   for(const variant of [0,1]){
    await cmd('launch');
    for(const task of course.tasks){
     if(task.kind==='form'){
      await submit();assert.ok(await status());
      for(const [i,field] of task.fields.entries())await page.locator(`#answer-${i}`).fill(field.values[variant]);
      if(task.fields.some(f=>f.type==='password')){await page.locator('[data-course-show]').check();assert.equal(await page.locator('[data-course-password]').first().getAttribute('type'),'text');}
      if(task.options)await page.locator('#term-0').check();
      await submit();
     }else if(task.kind==='range'){
      await submit();assert.ok(await status());await page.locator('#course-range').focus();
      for(let i=0;i<=task.target[variant];i++)await page.keyboard.press('ArrowRight');
      await submit();
     }else if(task.kind==='select'||task.kind==='qr'){
      if(task.kind==='qr')await cmd('scan');
      await cmd(`pick:${(task.target[variant]+1)%task.options.length}`);assert.ok(await status());await cmd(`pick:${task.target[variant]}`);
     }else if(task.kind==='attach'){
      await cmd('picker:1');await cmd('pick:2');await cmd('confirm-attachment');assert.ok(await status());
      await cmd('remove-attachment');await cmd(`picker:${task.target[variant]}`);await cmd(`pick:${task.target[variant]}`);await cmd('confirm-attachment');
     }else{
      if(!task.note){await cmd('request');await cmd('old-inbox');assert.ok(await status());await cmd('open-inbox');}
      if(task.kind==='copy'){await page.locator('.sim-selection summary').click();await cmd('copy-value');assert.ok(await status());await cmd('select-all');await cmd('copy-value');}
      await cmd('return');
      await submit();assert.ok(await status());
      if(task.kind==='copy')await cmd('paste-value');else await page.locator('#course-code').fill(task.values[variant]);
      await submit();
     }
    }
    await stage(variant===0?5:6);
   }
   await cmd('finish-assessment');await stage(7);
   assert.match(await page.locator('.course-result').innerText(),/다시 보면 좋은 부분/);
   await page.reload();await stage(7);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   runs++;
  }
  await page.goto(`${url}/#learn/signup`);await stage(7);
  assert.match(page.url(),/#course\/signup$/);
  await page.goto(`${url}/#learn/signup/4`);
  await page.locator('.steps').filter({hasText:'4 / 7'}).waitFor();
  await page.goto(`${url}/#learn/signup/guide`);
  await page.locator('[data-action=star]').click();
  await page.goto(`${url}/#favorites`);
  await page.locator('[data-go="learn/signup/guide"]').click();
  await page.locator('[data-action=star][aria-pressed=true]').waitFor();
  await page.locator('main [data-go="course/signup"]').click();await stage(7);
  for(const lang of ['ko','en','vi','ja','zh-CN','th','tl','mn']){
   await page.goto(`${url}/?lang=${lang}#course/login`);
   await page.locator('.course-result').waitFor();
   assert.equal(await page.locator('html').getAttribute('lang'),lang==='tl'?'fil':lang);
   assert.equal(await page.locator('.course-language').count(),['ko','en'].includes(lang)?0:2);
  }
  await page.goto(`${url}/?lang=ko#course/login`);
  await page.locator('[data-course=review]').focus();await page.keyboard.press('Enter');await stage(1);
  assert.equal(await page.locator('#course-stage').evaluate(el=>el===document.activeElement),true);
  await page.goto(`${url}/#backup`);
  const downloading=page.waitForEvent('download');await page.locator('#export-csv').click();
  const file=await (await downloading).path();
  const recipient=await browser.newPage();
  await recipient.goto(`${url}/#backup`);
  await recipient.locator('[name=backup]').setInputFiles(file);
  await recipient.locator('#import-csv button').click();
  await recipient.locator('#backup-result').getByText('기록을 합쳤어요.').waitFor();
  await recipient.goto(`${url}/#courses`);
  await recipient.locator('.course-index-link').first().waitFor();
  assert.equal(await recipient.locator('progress').getAttribute('value'),String(total));
  await recipient.close();
  assert.deepEqual(errors,[]);
  await page.close();
  console.log(`${device}: ${total} courses, guided + independent, error recovery, reload, legacy favorite, CSV round-trip`);
 }
 console.log(`${runs} course runs passed.`);
}finally{await browser.close();}
