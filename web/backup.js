import Papa from 'papaparse';
import setupSql from '../supabase/schema.sql?raw';
import {t,tr,h,box,note,field,progress,local,legacy,flows,date} from './shared.js';
import {courseBackup,mergeCourseBackup} from './curriculum.js';

const max=15*1024*1024;
const fields=['schema','kind','id','payload'];
let messages=[];
const isObj=v=>v&&typeof v==='object'&&!Array.isArray(v);
const validId=k=>/^[a-zA-Z0-9_-]{1,100}$/.test(k)&&!['__proto__','constructor','prototype'].includes(k);
const known=(map,key)=>Object.hasOwn(map,key);
const validImage=data=>typeof data==='string'&&data.length<=11_300_000&&/^(?:\/9j\/|iVBORw0KGgo)[A-Za-z0-9+/]*={0,2}$/.test(data);
const hasDate=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const acceptable=(map,k,i,old=false)=>known(map,k)&&Number.isInteger(i)&&i>=0&&i<(old?map[k].steps:map[k]).length;

export function toBackup(){
 const rows=[];
 const add=(kind,id,v)=>rows.push(['appjalal-v1',kind,id,JSON.stringify(v)]);
 messages.forEach(m=>add('message',m.id,m));
 Object.entries(progress.legacyCompleted).forEach(([k,v])=>add('complete',k,{date:v}));
 Object.entries(progress.legacySteps).forEach(([k,v])=>add('step',k,{step:v}));
 add('preferences','local',{favorites:progress.legacyFavorites,quiz_scores:progress.legacyQuiz,guide:{steps:progress.steps,completed:progress.completed,favorites:progress.favorites,practiced:progress.practiced,recent:progress.recent,courses:courseBackup()}});
 return new Blob(['\ufeff'+Papa.unparse([fields,...rows])],{type:'text/csv;charset=utf-8'});
}
async function importBackup(file){
 if(!file||file.size>max)throw Error('size');
 const parsed=Papa.parse(await file.text(),{header:true,skipEmptyLines:true,delimiter:','});
 if(parsed.errors.length||JSON.stringify(parsed.meta.fields)!==JSON.stringify(fields)||parsed.data.length>3000)throw Error('CSV');
 const newMessages=new Map(messages.map(m=>[m.id,m]));
 const next=structuredClone(progress),courseRecords=[];let match=0;
 for(const row of parsed.data){
  if(row.schema!=='appjalal-v1'||!validId(row.id))throw Error('schema');
  const o=JSON.parse(row.payload),k=row.id;if(!isObj(o))throw Error('row');
  if(row.kind==='message'){
   if(o.id!==k||typeof o.name!=='string'||o.name.length>60||typeof o.text!=='string'||o.text.length>2000||!hasDate(o.time)||o.image!==''&&!validImage(o.image))throw Error('message');
   if(!newMessages.has(k))newMessages.set(k,{id:k,name:o.name,text:o.text,time:o.time,image:o.image});
   match++;
  }else if(row.kind==='step'&&known(legacy,k)){
   if(!acceptable(legacy,k,o.step,true))throw Error('step');next.legacySteps[k]=Math.max(next.legacySteps[k]||0,o.step);match++;
  }else if(row.kind==='complete'&&known(legacy,k)){
   if(!hasDate(o.date))throw Error('date');next.legacyCompleted[k]=o.date;match++;
  }else if(row.kind==='preferences'){
   for(const x of Array.isArray(o.favorites)?o.favorites:[])if(known(legacy,x)&&!next.legacyFavorites.includes(x))next.legacyFavorites.push(x);
   for(const [id,q] of Object.entries(isObj(o.quiz_scores)?o.quiz_scores:{}))if(known(legacy,id)&&isObj(q)&&Number.isInteger(q.attempts)&&q.attempts>=0&&typeof q.correct==='boolean')next.legacyQuiz[id]={attempts:q.attempts,correct:q.correct};
   const g=isObj(o.guide)?o.guide:{};
   if(isObj(g.courses))courseRecords.push(g.courses);
   for(const [id,i] of Object.entries(isObj(g.steps)?g.steps:{}))if(acceptable(flows,id,i))next.steps[id]=Math.max(next.steps[id]||0,i);
   for(const [id,d] of Object.entries(isObj(g.completed)?g.completed:{}))if(known(flows,id)&&hasDate(d))next.completed[id]=d;
   for(const list of ['favorites','practiced'])for(const id of Array.isArray(g[list])?g[list]:[])if(known(flows,id)&&!next[list].includes(id))next[list].push(id);
   if(!next.recent&&typeof g.recent==='string'&&(known(flows,g.recent)||g.recent.startsWith('old:')&&known(legacy,g.recent.slice(4))))next.recent=g.recent;
   match++;
  }else if(!['step','complete'].includes(row.kind))throw Error('kind');
 }
 if(!match||newMessages.size>2900||new Blob([...newMessages.values()].map(x=>JSON.stringify(x))).size>max)throw Error('no data');
 Object.assign(progress,next);local();courseRecords.forEach(mergeCourseBackup);messages=[...newMessages.values()];
}
export async function picture(file){
 if(!file||file.size>8*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('image');
 const pic=await createImageBitmap(file);const canvas=document.createElement('canvas');
 try{const scale=Math.min(1,1280/Math.max(pic.width,pic.height));canvas.width=Math.max(1,Math.round(pic.width*scale));canvas.height=Math.max(1,Math.round(pic.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(pic,0,0,canvas.width,canvas.height);return canvas.toDataURL('image/jpeg',.78).split(',')[1];}finally{pic.close();}
}
const download=(blob,name)=>{const a=document.createElement('a');const u=URL.createObjectURL(blob);a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);};
const renderMessages=()=>messages.slice(-40).map(m=>`<article class="message"><strong>${h(m.name)}</strong><p class="muted">${h(date(m.time))}</p><p>${h(m.text)}</p>${m.image?`<img width="360" height="220" loading="lazy" src="data:${m.image.startsWith('/9j/')?'image/jpeg':'image/png'};base64,${m.image}" alt="${h(tr('백업에 포함된 사진','Photo in the backup'))}">`:''}</article>`).join('')||note(t('empty'));

export function mountBackup(node){
 node.innerHTML=box(t('legacy'),`${note(tr('이 화면의 메시지와 사진은 가족에게 자동으로 전송되지 않아요. 파일을 내려받기 전까지 현재 탭에만 남아요.','Messages and photos here are not sent to family. They stay in this tab until you download them.'))}
 <div class="panel"><h2>${h(tr('기록 내보내기 · 가져오기','Export or import records'))}</h2><button type="button" id="export-csv">${h(tr('기록 CSV 내려받기','Download records CSV'))}</button><form id="import-csv"><label class="field">${h(tr('기존 CSV 파일 선택','Choose an existing CSV'))}<input type="file" name="backup" accept=".csv,text/csv" required></label><button type="submit">${h(tr('기록 합치기','Merge records'))}</button></form><p class="notice" id="backup-result" role="status"></p><p class="muted">${h(tr('CSV에는 대화와 사진이 그대로 담겨요. 믿을 수 있는 가족에게만 보내 주세요.','The CSV contains unencrypted messages and photos. Share it only with trusted family.'))}</p></div>
 <details><summary>${h(tr('메시지 또는 사진을 CSV에 담기','Add a message or photo to a CSV'))}</summary><p class="muted">${h(t('privacy'))}</p><form id="local-message">${field('name',tr('보내는 사람 이름','Sender name'),'text','required maxlength="60" autocomplete="off"')}<label class="field">${h(tr('전하고 싶은 말','Message'))}<textarea name="message" maxlength="2000"></textarea></label><label class="field">${h(tr('사진 선택','Choose a photo'))}<input type="file" name="image" accept="image/jpeg,image/png,image/webp"></label><button>${h(tr('백업에 담기','Add to backup'))}</button><p class="notice" id="local-result" role="status"></p></form></details><section class="panel"><h2>${h(tr('백업에 담긴 대화','Messages in this backup'))}</h2><div id="backup-messages">${renderMessages()}</div></section>`);
 node.querySelector('.section').insertAdjacentHTML('beforeend',`<details><summary>${h(tr('가족 연결 설정 파일','Family setup file'))}</summary><button type="button" id="export-sql">${h(tr('Supabase SQL 내려받기','Download Supabase SQL'))}</button></details>`);
 const find=id=>node.querySelector(id);
 find('#export-sql').onclick=()=>download(new Blob([setupSql],{type:'text/plain;charset=utf-8'}),'schema.sql');
 find('#export-csv').onclick=()=>{const blob=toBackup();if(blob.size>max)find('#backup-result').textContent=tr('백업이 너무 커요.','The backup is too large.');else download(blob,'appjalal_backup.csv');};
 const onForm=(selector,work)=>{find(selector).onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,b=form.querySelector('button');if(b.disabled)return;b.disabled=true;try{await work(form)}finally{b.disabled=false}};};
 onForm('#import-csv',async form=>{try{await importBackup(form.backup.files[0]);form.reset();find('#backup-result').textContent=tr('기록을 합쳤어요.','Records merged.');find('#backup-messages').innerHTML=renderMessages();}catch{find('#backup-result').textContent=tr('파일을 읽지 못했어요. 15MB 이하의 앱 백업 CSV를 선택해 주세요.','Choose an app backup CSV up to 15 MB.');}});
 onForm('#local-message',async form=>{const message=form.message.value.trim(),file=form.image.files[0];try{if(!form.name.value.trim()||!message&&!file)throw Error();const image=file?await picture(file):'';messages.push({id:crypto.randomUUID(),name:form.name.value.trim(),text:message,time:new Date().toISOString(),image});if(messages.length>2900||toBackup().size>max){messages.pop();throw Error();}form.reset();find('#local-result').textContent=tr('백업에 담았어요.','Added to the backup.');find('#backup-messages').innerHTML=renderMessages();}catch{find('#local-result').textContent=tr('이름과 메시지 또는 사진을 확인해 주세요.','Check the name and the message or photo.');}});
}
