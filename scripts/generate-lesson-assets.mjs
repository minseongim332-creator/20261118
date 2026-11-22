import {mkdir,writeFile} from 'node:fs/promises';
import {courses} from '../web/curriculum-data.js';

const root=new URL('../public/lesson-screens/',import.meta.url);
const safe=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;', '"':'&quot;'}[c]));
const W=360,H=480;
const manifest={};
const rect=(x,y,w,h,r,fill,stroke='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
const txt=(x,y,value,size=15,fill='#142e3a',extra='')=>`<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" ${extra}>${safe(value)}</text>`;
for(const [id,lesson] of Object.entries(courses)){
 manifest[id]={};
 for(const [device,folder] of [['Galaxy','galaxy'],['iPhone','iphone']]){
  const ios=device==='iPhone';
  manifest[id][device]=[];
  await mkdir(new URL(`${folder}/${id}/`,root),{recursive:true});
  for(const [index,task] of lesson.tasks.entries()){
   const sms=task.kind==='sms'||task.kind==='copy'&&!task.note;
   const copy=task.kind==='copy';
   const title=task.deviceTitle?.[device]??(sms?(ios?['메시지','Messages']:['삼성 메시지','Samsung Messages']):task.title);
   const rows=task.fields?.length?task.fields.map(f=>f.label):sms?[['도서관 연습 문자','Library practice text'],copy?['예시 번호를 선택','Select the demo code']:['예시 확인번호','Demo verification code']]:task.note?[['예시 장소','Sample location'],['선택한 글자 복사','Copy selected text']]:task.options??[task.title];
   const primaryIdx=sms||task.note?1:(task.target?.[0]??0);
   const boxes=rows.map((label,i)=>({target_id:`${id}-${index}-${i}`,shape:'rectangle',x:(ios?34:28)/W,y:((ios?136:128)+i*58)/H,width:(ios?292:304)/W,height:48/H,label,instruction:task.tip}));
   const annotations=task.fields?.length||sms||task.note?boxes:[boxes[primaryIdx]];
   const paths=[];
   for(const [l,lang] of ['ko','en'].entries()){
    const controls=boxes.map((c,i)=>{const x=Math.round(c.x*W),y=Math.round(c.y*H),w=Math.round(c.width*W);return rect(x,y,w,48,ios?10:19,'#fff',ios?'#e1dfe7':'#c9d9e4')+txt(x+14,y+20,rows[i][l],13)+((sms||task.note)&&i===1?txt(x+14,y+39,task.values[0],16,ios?'#205ce7':'#1a5183','font-weight="700"'):task.fields?.length?rect(x+14,y+31,w-28,2,1,'#b9cad7'):'');}).join('');
    const footer=sms||task.note?(copy?(ios?['선택  ·  복사','Select  ·  Copy']:['전체 선택  ·  복사','Select all  ·  Copy']):['돌아가기','Go back']):task.kind==='form'?['입력 확인','Check entries']:['연습 앱','Practice app'];
    const shell=rect(6,3,348,474,ios?38:26,'#253231')+rect(13,10,334,460,ios?31:19,ios?'#f3f2f8':'#e8f2fa');
    const status=txt(33,37,'9:41',15)+txt(282,37,'▴ ◕ ▰',14)+(ios?rect(142,18,76,19,10,'#18201f'):`<circle cx="180" cy="23" r="4" fill="#202629"/>`);
    const header=ios?rect(20,55,320,59,9,'#fff')+txt(37,90,'‹',22,'#2253a7')+txt(180,88,title[l],16,'#192135','text-anchor="middle" font-weight="700"'):txt(30,78,title[l],23,'#193848','font-weight="700"')+txt(30,106,'One UI',12,'#416575');
    const bottom=ios?rect(136,455,88,4,2,'#28312d'):txt(180,456,'Ⅲ      ○      ‹',17,'#263b47','text-anchor="middle"');
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Pretendard, Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR, sans-serif">${shell}${status}${header}${controls}${rect(54,394,252,37,ios?12:20,ios?'#1e59bb':'#23597d')}${txt(180,418,footer[l],14,'#fff','text-anchor="middle"')}${bottom}</svg>`;
    const path=`${folder}/${id}/${index}-${lang}.svg`;
    await writeFile(new URL(path,root),svg);
    paths.push(path);
   }
   manifest[id][device].push({step_id:`${id}-${index}`,width:W,height:H,title,paths,annotations});
  }
 }
}
await writeFile(new URL('../web/lesson-screen-manifest.json',import.meta.url),JSON.stringify(manifest));
console.log(`${Object.keys(courses).length} lessons; ${Object.values(courses).reduce((n,l)=>n+l.tasks.length,0)*4} individual screen images`);
