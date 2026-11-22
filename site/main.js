import './style.css';
import {sceneSvg} from './scenes.js';
import {DETAIL,STUCK} from './detail.js';
import logo from './logo.svg';
import manifest from '../official-lesson-assets.json';
import {LANGS,CATS,LESSONS,GLOSSARY,TROUBLE,ELAB,TODAY,tx,pick,hasLang} from './data.js?v=2';

const KEY='ponjalal.v4';
const def={fam:null,lang:'ko',device:'',onboarded:false,size:1,level:'normal',contrast:false,speed:.9,done:{},step:{},mode:{},last:'',mistakes:{},saved:[]};
let S;
try{S={...def,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch{S={...def};}
if(S.size>1.3)S.size=1.4;else if(S.size>1.1)S.size=1.2;else S.size=1;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch{}};
const $app=document.getElementById('app');
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t=k=>tx(k,S.lang);
const L=o=>pick(o,S.lang);
const fam=()=>S.device==='iPhone'?'iphone':S.device==='Galaxy'?'galaxy':'';
const REFMAP={remove:'remove_app',permission:'app_permissions'};
const icon=n=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${{
home:'<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',learn:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM8 8h8M8 12h8"/>',practice:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.6 2.4c-.7.4-1.1.9-1.1 1.8M12 17h.01"/>',family:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 1.6 6 5"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',sound:'<path d="M4 10v4h4l5 4V6L8 10zM16 9a4 4 0 0 1 0 6"/>',check:'<path d="m5 12 4.5 4.5L19 7"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',search:'<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',book:'<path d="M5 5a2 2 0 0 1 2-2h12v16H7a2 2 0 0 0-2 2zM5 19V5"/>',warn:'<path d="M12 4 3 20h18zM12 10v4M12 17h.01"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>',camera:'<path d="M4 8h4l2-3h4l2 3h4v11H4z"/><circle cx="12" cy="13" r="3.5"/>',touch:'<path d="M9 11V5a2 2 0 0 1 4 0v5l5 1.5V16c0 3-2 5-5 5h-2c-2 0-3-1-4-3l-2-4 2-1z"/>'
}[n]}</svg>`;

function apply(){
 document.documentElement.lang={zh:'zh-CN'}[S.lang]||S.lang;
 document.documentElement.style.setProperty('--fs',16*S.size+'px');
 document.documentElement.dataset.contrast=S.contrast?'high':'normal';
}
function speak(text){
 if(!('speechSynthesis' in window))return false;
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang={zh:'zh-CN'}[S.lang]||S.lang;u.rate=S.speed;speechSynthesis.speak(u);return true;
}
function say(msg){const n=document.getElementById('live');if(n)n.textContent=msg;}
function lessonSteps(l){
 if(DETAIL[l.id])return DETAIL[l.id].map(([x,sc])=>{const t=typeof x==='string'?x:(x[fam()==='galaxy'?'g':fam()==='iphone'?'i':'c']||x.c);return {ko:t,en:t,sc};});
 const s=l.steps;if(Array.isArray(s))return s;
 return s[fam()]||s.common;
}
const notice=()=>!['ko','en'].includes(S.lang)?`<p class="note" role="status">Lesson text is available in Korean and English. This language shows English until a reviewed translation is added.</p>`:'';
const progress=()=>Math.round(100*LESSONS.filter(l=>S.done[l.id]).length/LESSONS.length);
const nextLesson=()=>LESSONS.find(l=>!S.done[l.id]&&(S.mistakes[l.id]||0)>0)||LESSONS.find(l=>!S.done[l.id]);

const nav=r=>{const items=[['home','home'],['learn','learn'],['practice','practice'],['family','family'],['me','user']];
 return `<nav class="tabs" aria-label="${h(L({ko:'주 메뉴',en:'Main menu'}))}">${items.map(([k,i])=>`<a href="#/${k}" class="tab" ${r===k?'aria-current="page"':''}>${icon(i)}<span>${h(k==='me'?L({ko:'내 기록',en:'Records'}):t(k))}</span></a>`).join('')}</nav>`;};
const shell=(r,body)=>`<div class="shell" data-route="${r}"><header class="top"><a class="brand" href="#/home"><img src="${logo}" alt="" width="40" height="40"><b>폰잘알</b></a><div class="tools"><a class="tool" href="#/search" aria-label="${h(t('search'))}">${icon('search')}</a><label class="tool lang" aria-label="${h(t('language'))}">${icon('globe')}<span class="lname">${h((LANGS.find(x=>x[0]===S.lang)||[0,''])[1])}</span><select id="top-lang" aria-label="${h(t('language'))}">${LANGS.map(([c,n])=>`<option value="${c}" ${S.lang===c?'selected':''}>${n}</option>`).join('')}</select></label><a class="tool" href="#/help" aria-label="${h(t('help'))}">${icon('help')}</a><a class="tool" href="#/settings" aria-label="${h(t('settings'))}">${icon('settings')}</a><a class="tool" href="#/me" aria-label="${h(L({ko:'내 정보',en:'My page'}))}">${icon('user')}</a></div></header><main id="main" tabindex="-1">${body}</main>${nav(r)}</div><p id="live" class="sr" role="status"></p>`;

function welcome(){
 const langs=LANGS.map(([c,n])=>`<button class="wl ${S.lang===c?'on':''}" data-lang="${c}" lang="${c}" aria-pressed="${S.lang===c}">${n}</button>`).join('');
 return `<main class="welcome" id="main"><img class="wlogo" src="${logo}" alt="폰잘알 로고" width="140" height="140"><h1>폰잘알</h1><p>${h(L({ko:'어려웠던 스마트폰 사용법,',en:'Hard-to-learn phone skills,'}))}<br>${h(L({ko:'이제 하나씩 쉽게 배워보세요',en:'now learned one step at a time'}))}</p><a class="btn primary wstart" href="#/${S.onboarded?'home':'onboard'}" autofocus>${h(t('start'))}</a><div class="wlangs" role="group" aria-label="${h(t('language'))}"><small>${icon('globe')} ${h(t('language'))}</small>${langs}</div></main>`;
}
function onboard(){
 const langs=LANGS.map(([c,n])=>`<button class="choice ${S.lang===c?'on':''}" data-lang="${c}" lang="${c}" aria-pressed="${S.lang===c}">${n}</button>`).join('');
 const devs=[['Galaxy','Samsung Galaxy'],['iPhone','Apple iPhone'],['Unknown',t('unsure')]].map(([d,n])=>`<button class="choice dev ${S.device===d?'on':''}" data-device="${d}" aria-pressed="${S.device===d}">${h(n)}</button>`).join('');
 const unknown=S.device==='Unknown'?`<section class="panel"><h3>${h(L({ko:'내 휴대폰 알아보기',en:'Find out which phone you have'}))}</h3><ul class="plain"><li>${h(L({ko:'뒷면에 사과 모양이 있으면 아이폰이에요.',en:'An apple on the back means iPhone.'}))}</li><li>${h(L({ko:'뒷면에 SAMSUNG이라고 쓰여 있으면 갤럭시예요.',en:'The word SAMSUNG on the back means Galaxy.'}))}</li><li>${h(L({ko:'설정 → 휴대폰 정보에서도 확인할 수 있어요. 그래도 모르면 가족에게 물어보세요.',en:'You can also check Settings → About phone, or ask family.'}))}</li></ul></section>`:'';
 return `<div class="onb"><h1>${h(t('language'))}</h1><div class="grid2">${langs}</div><h2>${h(t('device'))}</h2><div class="stack">${devs}</div>${unknown}<button class="btn primary big" data-finish ${S.device?'':'disabled'}>${h(t('start'))}${icon('arrow')}</button></div>`;
}
function pathNodes(){
 const list=LESSONS.filter(l=>l.cat!=='public').slice(0,12);
 const nx=nextLesson();const i=Math.max(0,list.findIndex(l=>l.id===nx?.id));
 const view=list.slice(Math.min(i,list.length-4),Math.min(i,list.length-4)+4);
 return `<ol class="path" aria-label="${h(L({ko:'배움의 길',en:'Learning path'}))}">${view.map(l=>`<li class="${S.done[l.id]?'done':l.id===nx?.id?'now':''}"><i>${S.done[l.id]?icon('check'):''}</i><span>${h(L(l.title))}</span></li>`).join('')}</ol>`;
}
function home(){
 const n=nextLesson()||LESSONS[0],p=progress(),last=LESSONS.find(l=>l.id===S.last&&!S.done[l.id]);
 const d=new Date(),mission=LESSONS.find(l=>l.id===TODAY[(d.getFullYear()*372+d.getMonth()*31+d.getDate())%TODAY.length]);
 const first=!LESSONS.some(l=>S.done[l.id]||S.step[l.id]);
 const resume=last?`<a class="resume-band" href="#/lesson/${last.id}"><span class="touch">${icon('touch')}</span><span><small>${h(t('cont'))}</small><b>${h(L(last.title))}</b><em>${h(L({ko:'단계',en:'Step'}))} ${(S.step[last.id]||0)+1}/${lessonSteps(last).length}</em></span>${icon('arrow')}</a>`:'';
 const ids=['login','signup','sms','cert','copypaste','wifi','install','sendphoto','sendsms','remove'];
 const list=ids.map(i=>LESSONS.find(l=>l.id===i)).filter(Boolean);
 const list2=list.length>=6?list:LESSONS.slice(0,10);
 const doneN=LESSONS.filter(l=>S.done[l.id]).length,startedN=LESSONS.filter(l=>S.step[l.id]&&!S.done[l.id]).length;
 const rec=LESSONS.filter(l=>S.done[l.id]).slice(-3).map(l=>h(L(l.title))).join(' · ');
 const track=first?`<p>${h(L({ko:'아직 배운 내용이 없어요. 위에서 첫 수업을 시작해 보세요.',en:'Nothing learned yet. Start the first lesson above.'}))}</p>`:`<p>${h(L({ko:`끝낸 수업 ${doneN}개 · 배우는 중 ${startedN}개 · 전체 ${p}%`,en:`${doneN} done · ${startedN} in progress · ${p}% overall`}))}</p>${rec?`<p class="mini">${h(L({ko:'최근 끝낸 수업: ',en:'Recently done: '}))}${rec}</p>`:''}<div class="bar" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p}%"></i></div>`;
 const ex=[['로그인','Login'],['비밀번호','Password'],['인증번호','Code'],['공동인증서','Certificate'],['사진 보내기','Send photo'],['앱 설치','Install app']];
 const dev=S.device?(S.device==='Galaxy'?L({ko:'삼성 갤럭시',en:'Samsung Galaxy'}):L({ko:'애플 아이폰',en:'Apple iPhone'})):'';
 const prog=first?L({ko:'아직 시작 전이에요',en:'Not started yet'}):L({ko:`${doneN}개 끝냄 · 전체 ${p}%`,en:`${doneN} done · ${p}% overall`});
 const row=(href,ic,name,desc)=>`<a class="mrow" href="${href}">${icon(ic)}<span><b>${h(name)}</b><small>${h(desc)}</small></span>${icon('arrow')}</a>`;
 const hr=d.getHours(),hello=hr<6?L({ko:'편안한 밤이에요',en:'Good night'}):hr<12?L({ko:'좋은 아침이에요',en:'Good morning'}):hr<18?L({ko:'좋은 오후예요',en:'Good afternoon'}):L({ko:'좋은 저녁이에요',en:'Good evening'});
 return shell('home',`<p class="hello">${h(hello)}</p><h1 class="mh">${h(L({ko:'어려운 스마트폰 사용법, 하나씩 쉽게 배워보세요.',en:'Hard phone skills, learned one step at a time.'}))}</h1>
 <p class="msub">${h(L({ko:'모르는 것이 있어도 괜찮아요.',en:"It's okay not to know."}))}</p>
 <nav class="mgrid" aria-label="${h(L({ko:'주요 기능',en:'Main features'}))}">${[['#/lesson/'+(last||n).id,'touch',L({ko:'따라 하며 배우기',en:'Learn step by step'}),last?L({ko:'이어서: ',en:'Continue: '})+L(last.title):L({ko:'스마트폰 사용법을 단계별로 학습',en:'Step-by-step phone lessons'}),'t1'],['#/ask','camera',L({ko:'사진으로 물어보기',en:'Ask with a photo'}),L({ko:'모르는 화면을 사진으로 질문',en:'Ask about a screen'}),''],['#/family','family',L({ko:'가족과 대화하기',en:'Talk with family'}),S.fam?S.fam.name:L({ko:'가족에게 도움 요청',en:'Ask family for help'}),''],['#/me','user',L({ko:'내 학습 이어하기',en:'My progress'}),prog,'']].map(([href,ic,name,desc,c])=>`<a class="mtile ${c}" href="${href}">${icon(ic)}<b>${h(name)}</b><small>${h(desc)}</small></a>`).join('')}</nav><a class="mmission" href="#/lesson/${mission.id}"><span class="dot">${icon('touch')}</span><span><small>${h(L({ko:'오늘의 작은 미션',en:"Today's small mission"}))}</small><b>${h(L(mission.title))}</b></span>${icon('arrow')}</a>`);
}
function learn(cat){
 const groups=CATS.filter(([id])=>!cat||id===cat).map(([id,name])=>`<section class="group"><h2>${h(L(name))}</h2>${LESSONS.filter(l=>l.cat===id).map(l=>`<a class="lrow" href="#/lesson/${l.id}"><span class="mark ${S.done[l.id]?'ok':''}">${S.done[l.id]?icon('check'):''}</span><span>${h(L(l.title))}</span>${icon('arrow')}</a>`).join('')}</section>`).join('');
 return shell('learn',`<h1>${h(t('learn'))}</h1><p class="lead">${h(L({ko:'수업은 한 번에 한 단계씩 진행해요.',en:'Each lesson moves one step at a time.'}))}</p>${cat?`<a class="textlink" href="#/learn">${icon('back')}${h(t('learn'))}</a>`:''}${groups}`);
}
function officialPanel(l,i,total){
 const sc=sceneSvg(l.id,lessonSteps(l)[i]?.sc??i,fam(),L);
 if(sc)return `<figure class="shot scene">${sc}<figcaption>${h(L({ko:'폰잘알이 그린 연습 화면이에요. 실제 휴대폰은 모양이 조금 다를 수 있어요.',en:'A practice picture drawn by PhoneJalal. Your real phone may look slightly different.'}))}</figcaption></figure>`;
 const f=fam();if(!l.ref)return `<div class="shot none"><b>${h(L({ko:'공식 화면 없음',en:'No official screenshot'}))}</b><p>${h(L({ko:'이 수업에 맞는 제조사 공식 화면을 아직 확인하지 못했어요. 가짜 화면으로 대체하지 않아요.',en:'No matching official screenshot has been verified for this lesson. No substitute image is shown.'}))}</p></div>`;
 if(!f)return `<div class="shot none"><b>${h(L({ko:'휴대폰을 먼저 골라 주세요',en:'Choose your phone first'}))}</b><p>${h(L({ko:'기종에 맞는 공식 안내만 연결해요.',en:'Only guides for your phone are linked.'}))}</p><a class="btn" href="#/settings">${h(t('settings'))}</a></div>`;
 const key=REFMAP[l.ref]||l.ref;
 const inline=manifest.assets.find(a=>a.device_family===f&&a.lesson_id===key&&a.license_status==='verified'&&a.step_id===(manifest.web_steps[key]||[])[i]);
 if(inline){const tg=inline.target;return `<figure class="shot img"><div class="frame" style="max-width:${Math.min(420,480*inline.width/inline.height)}px"><img src="${h(inline.original_image_url)}" width="${inline.width}" height="${inline.height}" alt="${h(inline.label[S.lang==='ko'?0:1])}" referrerpolicy="no-referrer">${tg?`<span class="hl" aria-hidden="true" style="left:${tg[0]*100}%;top:${tg[1]*100}%;width:${tg[2]*100}%;height:${tg[3]*100}%"><b>${i+1}</b></span>`:''}</div></figure>`;}
 const sk=manifest.reference_source_keys[f][key]||manifest.reference_source_keys[f][l.ref];
 const src=manifest.sources[sk];
 const assets=manifest.assets.filter(a=>a.device_family===f&&(a.lesson_id===key||a.lesson_id===l.id));
 const al=assets.map(a=>`<li><a href="${h(a.original_image_url)}" target="_blank" rel="noopener noreferrer">${h(a.label[S.lang==='ko'?0:1])}</a><small> ${h(a.device_model==='unknown'?'':a.device_model)} ${h(a.os_version==='unknown'?'':a.os_version)}</small></li>`).join('');
 if(!src)return `<div class="shot none"><b>${h(L({ko:'공식 화면 없음',en:'No official screenshot'}))}</b><p>${h(L({ko:'이 기종·수업에 맞는 공식 자료를 아직 확인하지 못했어요.',en:'No verified official source for this phone and lesson yet.'}))}</p></div>`;
 return `<div class="shot link"><b>${h(L({ko:'제조사 공식 화면',en:'Official manufacturer screens'}))}</b><p>${h(L({ko:'앱 안에 표시할 권한이 확인되지 않아 공식 안내 페이지로 연결해요. 단계별 화면 대응도 확인 전이에요.',en:'Embedding rights are not confirmed, so the official guide opens in a new tab. Step-by-step image matching is not verified.'}))}</p><a class="btn" href="${h(src.page)}" target="_blank" rel="noopener noreferrer">${h(src.publisher)} ↗</a>${al?`<ul class="plain">${al}</ul>`:''}</div>`;
}
let phase=0,phaseKey='';
function intake(l,steps){
 const id=l.id,q=L({ko:'지금 어떤 상황이세요? 상황에 맞춰 도와 드릴게요.',en:'What is your situation? I will help accordingly.'});
 const cont=S.step[id]>0&&S.step[id]<steps.length?`<a class="mtile intk c4" href="#/lesson/${id}/${S.step[id]}">${icon('arrow')}<b>${h(L({ko:'아까 하던 곳부터 이어서 할래요',en:'Continue where I left off'}))}</b><small>${h(L({ko:'단계',en:'Step'}))} ${S.step[id]+1}/${steps.length}</small></a>`:'';
 const opt=(m,ic,a,b)=>`<button class="mtile intk" data-mode="${m}" data-lid="${id}">${icon(ic)}<b>${h(a)}</b><small>${h(b)}</small></button>`;
 return shell('learn',`<div class="lhead"><a class="iconbtn" href="#/learn" aria-label="${h(t('learn'))}">${icon('back')}</a><h1>${h(L(l.title))}</h1></div><p class="lead">${h(q)}</p><div class="intakes">${cont}${opt('slow','touch',L({ko:'처음 해 봐요. 하나하나 따라 할래요',en:'First time: one tiny step at a time'}),L({ko:'한 단계를 찾기 → 누르기 → 확인하기로 나눠서 알려 드려요',en:'Each step is split into find, do, check'}))}${opt('stuck','help',L({ko:'해 보다가 막혔어요',en:'I got stuck'}),L({ko:'어떤 점이 어려운지 물어보고 그 문제만 도와 드려요',en:'Tell me what is hard and I will help with that'}))}${opt('try','arrow',L({ko:'어렵진 않고 그냥 해 보려고요',en:'Not hard, just trying'}),L({ko:'핵심만 빠르게 보여 드려요',en:'Quick view of the main points'}))}</div><p class="note">${h(L({ko:'더 많은 내용은 ',en:'More content: '}))}<a href="https://20261118-7dmaxzfnotja7njkkadwsq.streamlit.app/" target="_blank" rel="noopener noreferrer">${h(L({ko:'기존 앱잘알(Streamlit) 열기 ↗',en:'Open the original app (Streamlit) ↗'}))}</a></p>`);
}
let stuckSel=null,intakeDone={};
function stuckPick(l,steps){
 const id=l.id,list=STUCK[id],back=`<div class="lhead"><a class="iconbtn" href="#/learn" aria-label="${h(t('learn'))}">${icon('back')}</a><h1>${h(L(l.title))}</h1></div>`;
 const more=`<a class="lrow" href="#/ask"><span class="mark"></span><span>${h(L({ko:'무슨 상황인지 모르겠어요. 화면 사진으로 물어볼래요',en:'Not sure. Ask with a photo'}))}</span>${icon('arrow')}</a><a class="lrow" href="#/family"><span class="mark"></span><span>${h(L({ko:'가족에게 도움을 요청할래요',en:'Ask family'}))}</span>${icon('arrow')}</a><button class="linkbtn" data-modereset="${id}">${h(L({ko:'처음 질문으로 돌아가기',en:'Back to the first question'}))}</button>`;
 if(!list)return shell('learn',`${back}<p class="lead">${h(L({ko:'어느 단계에서 막혔나요?',en:'Which step are you stuck on?'}))}</p>${steps.map((x,k)=>`<a class="lrow" href="#/lesson/${id}/${k}"><span class="mark">${k+1}</span><span>${h(L(x))}</span>${icon('arrow')}</a>`).join('')}${more}`);
 if(stuckSel!==null&&list[stuckSel]){const [q,tip,to]=list[stuckSel];const href=typeof to==='string'?`#/lesson/${to}`:`#/lesson/${id}/${to}`;
  return shell('learn',`${back}<section class="panel"><h2>${h(q)}</h2><p class="big">${h(tip)}</p><div class="helps"><a class="btn primary" href="${href}">${h(L({ko:'그 부분 그림으로 보기',en:'Show me the screen'}))}</a><button class="btn" data-stuck="-1">${h(L({ko:'다른 어려움 고르기',en:'Pick another problem'}))}</button></div></section><p class="lead">${h(L({ko:'그래도 안 되면',en:'Still stuck?'}))}</p>${more}`);}
 return shell('learn',`${back}<p class="lead">${h(L({ko:'지금 어떤 점이 어려우세요?',en:'What is the problem now?'}))}</p>${list.map((x,k)=>`<button class="lrow stk" data-stuck="${k}"><span class="mark">${k+1}</span><span>${h(x[0])}</span>${icon('arrow')}</button>`).join('')}${more}`);
}
function lesson(id,idx){
 const l=LESSONS.find(x=>x.id===id);if(!l)return shell('learn',`<p>${h(L({ko:'수업을 찾지 못했어요.',en:'Lesson not found.'}))}</p><a class="btn" href="#/learn">${h(t('learn'))}</a>`);
 const steps=lessonSteps(l);
 if(idx===undefined&&!intakeDone[id])return intake(l,steps);
 if(idx===undefined&&S.mode[id]==='stuck')return stuckPick(l,steps);
 let i=idx??Math.min(S.step[id]||0,steps.length-1);i=Math.max(0,Math.min(i,steps.length));
 S.last=id;S.step[id]=Math.min(i,steps.length-1);save();
 if(i>=steps.length){const lock=!S.done[l.id];
  return shell('learn',`<div class="done"><span class="bigcheck">${icon('check')}</span><h1>${h(L(l.title))}</h1><p class="lead">${h(L(l.result))}</p><p class="note">${h(L({ko:'연습 결과는 실제 휴대폰에서 같은 일을 했다는 뜻이 아니에요. 실제 휴대폰으로 직접 한 번 해 보세요.',en:'Finishing this lesson does not mean the real operation is done. Try it on your own phone.'}))}</p><button class="btn primary" data-complete="${id}">${h(lock?t('done'):t('learn'))}</button> <a class="btn" href="#/practice">${h(t('practice'))}</a></div>`);}
 const slow=S.mode[id]==='slow'&&i<steps.length,try_=S.mode[id]==='try';
 if(phaseKey!==id+':'+i){phaseKey=id+':'+i;phase=0;}
 const E=ELAB[id],s=steps[i],terms=(l.terms||[]).map(k=>`<button class="term" data-term="${k}">${h(L(GLOSSARY[k].t))}</button>`).join('');
 return shell('learn',`<div class="lhead"><a class="iconbtn" href="#/learn" aria-label="${h(t('learn'))}">${icon('back')}</a><h1>${h(L(l.title))}</h1></div><p class="stepcount">${h(L({ko:'단계',en:'Step'}))} ${i+1} / ${steps.length}</p><ol class="stepper" aria-label="${h(i+1+'/'+steps.length)}">${steps.map((_,k)=>`<li class="${k<i?'done':k===i?'now':''}" ${k===i?'aria-current="step"':''}><a href="#/lesson/${id}/${k}" aria-label="${k+1}"><i>${k<i?icon('check'):k+1}</i></a></li>`).join('')}</ol>
 ${S.device==='Unknown'||!S.device?`<p class="note">${h(L({ko:'휴대폰을 고르지 않아 공통 안내를 보여 줘요. 화면은 다를 수 있어요.',en:'No phone selected, so this is general guidance. Your screen may differ.'}))}</p>`:''}
 <div class="lesson-col">${officialPanel(l,i,steps.length)}<section class="instr"><span class="num">${i+1}</span>${i===0&&E&&!try_?`<p class="why"><b>${h(L({ko:'왜 필요할까요?',en:'Why does it matter?'}))}</b> ${h(L(E.why))}</p>`:''}${slow?`<p class="phase">${h(L({ko:['① 먼저 눈으로 찾아요','② 손가락으로 해 봐요','③ 잘 됐는지 확인해요'][phase],en:['1 Look first','2 Now do it','3 Check it'][phase]}))} <small>(${phase+1}/3)</small></p><p class="big" id="instr">${h(phase===0?L({ko:'그림의 노란 표시를 찾아보세요. 지금은 누르지 않고 눈으로만 찾아요.',en:'Find the yellow mark in the picture. Just look; do not tap yet.'}):phase===2?L({ko:'화면이 그림처럼 바뀌었나요?',en:'Did the screen change as in the picture?'}):L(s))}</p>${phase===0?`<p class="more-txt">${h(L(s))}</p>`:''}`:`<p class="big" id="instr">${h(L(s))}</p>`}${S.level==='detail'&&E?.more?.[i]?`<p class="more-txt" id="more">${h(L(E.more[i]))}</p>`:''}${S.level==='easy'&&false?'':''}${E&&S.level!=='easy'?`<details class="fixbox"><summary>${h(L({ko:'잘 안 될 때',en:'If it does not work'}))}</summary><p>${h(L(E.fix))}</p></details>`:''}${notice()}${slow&&phase===2?`<div class="doit"><div class="helps"><button class="btn primary" data-phase="ok">${h(L({ko:'네, 됐어요',en:'Yes, it worked'}))}</button><button class="btn" data-phase="no">${h(L({ko:'아니요, 달라요',en:'No, it looks different'}))}</button></div>${phase===2&&window.__no?`<p class="note">${h(E?L(E.fix):L({ko:'다시 한 번 천천히 해 보세요.',en:'Try again slowly.'}))}</p><div class="helps"><button class="btn" data-phase="again">${h(L({ko:'이 단계 다시 하기',en:'Redo this step'}))}</button><a class="btn" href="#/family">${h(L({ko:'가족에게 도움 요청',en:'Ask family'}))}</a></div>`:''}</div>`:try_?'':`<div class="doit"><b>${h(L({ko:'이제 내 휴대폰에서 직접 해 보세요.',en:'Now try it on your own phone.'}))}</b><label class="chk"><input type="checkbox" id="did"> ${h(L({ko:'해 봤어요',en:'I did it'}))}</label></div>`}<div class="helps"><button class="btn" data-listen>${icon('sound')}${h(L({ko:'다시 듣기',en:'Listen again'}))}</button><button class="btn" data-easier>${h(L({ko:'더 쉽게',en:'Simpler'}))}</button><a class="btn" href="#/help">${h(L({ko:'잘 모르겠어요',en:'I am not sure'}))}</a><a class="btn" href="#/family">${h(L({ko:'가족에게 도움 요청',en:'Ask family'}))}</a></div><div class="termrow">${terms}</div><button class="linkbtn" data-modereset="${id}">${h(L({ko:'배우는 방법 다시 고르기',en:'Choose how to learn again'}))}</button><div id="termbox" class="panel" hidden></div></section></div>
 <div class="pager"><button class="btn" ${slow&&phase>0?'data-phprev':`data-go="${i-1}"`} ${i===0&&!(slow&&phase>0)?'disabled':''}>${icon('back')}${h(t('prev'))}</button><button class="btn" data-go="${i}" data-replay>${h(L({ko:'다시 보기',en:'Replay'}))}</button><button class="btn primary" ${slow&&phase<2?'data-phnext':`data-go="${i+1}"`}>${h(t('next'))}${icon('arrow')}</button></div>`);
}
function search(q=''){
 const norm=s=>s.toLowerCase().replace(/\s/g,'');
 const syn={'문자번호':'sms','인증':'sms','글씨크게':'textsize','글자':'textsize','복사해서넣기':'copypaste','붙여넣기':'copypaste','사진보내기':'sendphoto','사진':'sendphoto','와이파이':'wifi','인터넷':'wifi','비번':'recover','비밀번호':'recover','가입':'signup','삭제':'remove','설치':'install'};
 const nq=norm(q);
 const hits=!nq?[]:LESSONS.filter(l=>norm(l.title.ko+l.title.en+Object.values(l.steps.common||l.steps).flat?.().map?.(x=>x.ko||'').join('')).includes(nq)||Object.entries(syn).some(([k,v])=>(nq.includes(k)||k.includes(nq))&&v===l.id));
 const gl=!nq?[]:Object.entries(GLOSSARY).filter(([,g])=>norm(g.t.ko+g.t.en+g.d.ko+g.d.en).includes(nq));
 const all=Object.entries(GLOSSARY).map(([k,g])=>`<details class="gl"><summary>${h(L(g.t))}</summary><p>${h(L(g.d))}</p><small>${h(L({ko:'예: ',en:'Example: '}))}${h(L(g.e))}</small> <button class="linkbtn" data-say="${k}">${icon('sound')}${h(t('listen'))}</button></details>`).join('');
 return shell('search',`<h1>${h(t('search'))}</h1><form class="searchf" role="search"><label class="sr" for="q">${h(t('search'))}</label><input id="q" type="search" value="${h(q)}" placeholder="${h(L({ko:'예: 글씨 크게, 문자 번호',en:'e.g. text size, code'}))}" autocomplete="off"><button class="btn primary">${h(t('search'))}</button></form>
 <div id="results">${q?(hits.length||gl.length?hits.map(l=>`<a class="lrow" href="#/lesson/${l.id}"><span>${h(L(l.title))}</span>${icon('arrow')}</a>`).join('')+gl.map(([k,g])=>`<p class="gl-hit"><b>${h(L(g.t))}</b> ${h(L(g.d))}</p>`).join(''):`<p class="note">${h(L({ko:'찾는 수업이 없어요. 다른 말로 검색하거나 ‘도움’에서 문제를 골라 보세요.',en:'No lesson found. Try other words or use Help.'}))}</p>`):''}</div><h2 class="sec">${h(t('glossary'))}</h2>${all}`);
}
function helpPage(){
 return shell('help',`<h1>${h(L({ko:'막혔어요',en:'I am stuck'}))}</h1><p class="lead">${h(L({ko:'어떤 일이 있었나요?',en:'What happened?'}))}</p>${TROUBLE.map(([id,q,a])=>`<details class="tr"><summary>${h(L(q))}</summary><p>${h(L(a))}</p><a class="textlink" href="#/learn">${h(L({ko:'관련 수업 찾기',en:'Find a lesson'}))}</a> · <a class="textlink" href="#/family">${h(L({ko:'가족에게 묻기',en:'Ask family'}))}</a></details>`).join('')}`);
}
function practice(mode){
 const menu=`<h1>${h(t('practice'))}</h1><p class="lead">${h(L({ko:'연습 화면은 실제 휴대폰이 아니라 연습용 모의 화면이에요. 가짜 정보만 입력해요.',en:'This is a practice simulation, not a real phone. Use fictional information only.'}))}</p><div class="stack"><a class="btn big" href="#/practice/sms">${h(L({ko:'인증번호 입력 연습',en:'Verification code practice'}))}</a><a class="btn big" href="#/practice/copy">${h(L({ko:'복사·붙여넣기 연습',en:'Copy and paste practice'}))}</a><a class="btn big" href="#/practice/login">${h(L({ko:'로그인 연습',en:'Sign-in practice'}))}</a></div>`;
 if(!mode)return shell('practice',menu);
 return shell('practice',`<div class="lhead"><a class="iconbtn" href="#/practice" aria-label="${h(t('practice'))}">${icon('back')}</a><h1>${h(L({sms:{ko:'인증번호 입력 연습',en:'Verification code practice'},copy:{ko:'복사·붙여넣기 연습',en:'Copy and paste practice'},login:{ko:'로그인 연습',en:'Sign-in practice'}}[mode]))}</h1></div><p class="badge">${h(L({ko:'모의 화면 · 실제 기기 화면이 아니에요',en:'Simulation · not a real device screen'}))}</p><div id="sim" class="sim" data-mode="${mode}"></div>`);
}
const SIM={
 sms:{codes:['246810','417962'],init(){return {screen:'form',code:SIM.sms.codes[Math.floor(Math.random()*2)],val:'',tries:0};},
  view(s){
   if(s.screen==='form')return `<div class="phone"><h3>${h(L({ko:'연습 서비스 가입',en:'Practice sign-up'}))}</h3><p>${h(L({ko:'아래 버튼으로 가짜 인증번호 문자를 받아요.',en:'Tap to receive a fake code text.'}))}</p><button class="btn primary" data-sim="send">${h(L({ko:'인증번호 받기',en:'Send code'}))}</button></div>`;
   if(s.screen==='wait')return `<div class="phone"><p>${h(L({ko:'문자가 왔어요! 문자 앱을 열어 보세요.',en:'A text arrived! Open Messages.'}))}</p><button class="btn primary" data-sim="open">${h(L({ko:'문자 앱 열기',en:'Open Messages'}))}</button></div>`;
   if(s.screen==='inbox')return `<div class="phone"><h3>${h(L({ko:'문자',en:'Messages'}))}</h3><div class="bubble">[${h(L({ko:'연습',en:'Practice'}))}] ${h(L({ko:'인증번호는',en:'Your code is'}))} <b>${s.code}</b></div><button class="btn" data-sim="back">${h(L({ko:'원래 화면으로 돌아가기',en:'Go back to sign-up'}))}</button></div>`;
   if(s.screen==='enter')return `<div class="phone"><h3>${h(L({ko:'인증번호 입력',en:'Enter code'}))}</h3><label for="simcode">${h(L({ko:'문자로 받은 숫자',en:'Number from the text'}))}</label><input id="simcode" inputmode="numeric" maxlength="6" value="${h(s.val)}" autocomplete="off"><button class="btn primary" data-sim="check">${h(L({ko:'확인',en:'Confirm'}))}</button><p class="note" id="simmsg" role="status">${s.msg?h(s.msg):''}</p><button class="linkbtn" data-sim="open">${h(L({ko:'문자 다시 보기',en:'View the text again'}))}</button></div>`;
   return `<div class="phone ok"><span class="bigcheck">${icon('check')}</span><p>${h(L({ko:'연습 완료! 실제 휴대폰에서도 직접 해 보세요.',en:'Practice complete! Try it on your real phone too.'}))}</p></div>`;},
  act(s,a,root){
   if(a==='send')s.screen='wait';else if(a==='open')s.screen='inbox';else if(a==='back')s.screen='enter';
   else if(a==='check'){s.val=root.querySelector('#simcode').value.trim();if(s.val===s.code){s.screen='done';markPractice('sms');}else{s.tries++;S.mistakes.sms=(S.mistakes.sms||0)+1;save();s.msg=s.val?L({ko:'숫자가 달라요. 문자를 다시 보고 천천히 입력해 보세요.',en:'The number differs. Look at the text again and retype slowly.'}):L({ko:'숫자를 입력해 주세요.',en:'Please type the number.'});}}
   return s;}},
 copy:{init(){return {screen:'text',sel:false,copied:false,pasted:''};},word:'4821',
  view(s){return s.screen==='done'?`<div class="phone ok"><span class="bigcheck">${icon('check')}</span><p>${h(L({ko:'연습 완료!',en:'Practice complete!'}))}</p></div>`:`<div class="phone"><p>${h(L({ko:'아래 문장에서 숫자 4821만 복사해 아래 칸에 붙여넣어 보세요.',en:'Copy only the number 4821 and paste it in the box below.'}))}</p><p class="msgtxt">${h(L({ko:'연습 번호는',en:'Practice number:'}))} <button class="sel ${s.sel?'on':''}" data-sim="select" aria-pressed="${s.sel}">4821</button></p>${s.sel?`<button class="btn" data-sim="copy">${h(L({ko:'복사',en:'Copy'}))}</button>`:''}${s.copied?`<p class="note">${h(L({ko:'복사했어요. 이제 칸을 길게 눌러 붙여넣어요.',en:'Copied. Now press and hold the box to paste.'}))}</p>`:''}<div class="pastebox" id="paste">${h(s.pasted)||'<span class="ph">…</span>'}</div><button class="btn" data-sim="paste" ${s.copied?'':'disabled'}>${h(L({ko:'붙여넣기',en:'Paste'}))}</button><p class="note" role="status">${s.msg?h(s.msg):''}</p></div>`;},
  act(s,a){if(a==='select'){s.sel=!s.sel;s.copied=false;}else if(a==='copy')s.copied=true;else if(a==='paste'){s.pasted='4821';s.screen='done';markPractice('copy');}return s;}},
 login:{init(){return {tries:0,show:false,screen:'form'};},
  view(s){return s.screen==='done'?`<div class="phone ok"><span class="bigcheck">${icon('check')}</span><p>${h(L({ko:'연습 완료! 실제 비밀번호는 이 앱에 입력하지 마세요.',en:'Practice complete! Never enter real passwords here.'}))}</p></div>`:`<div class="phone"><h3>${h(L({ko:'연습 서비스',en:'Practice service'}))}</h3><p class="note">${h(L({ko:'아이디 demo-user, 비밀번호 Demo!4821 을 입력해 보세요.',en:'Type ID demo-user and password Demo!4821.'}))}</p><label for="sid">${h(L({ko:'아이디',en:'ID'}))}</label><input id="sid" autocomplete="off"><label for="spw">${h(L({ko:'비밀번호',en:'Password'}))}</label><input id="spw" type="${s.show?'text':'password'}" autocomplete="off"><button class="linkbtn" data-sim="eye">${h(L({ko:'비밀번호 보기/숨기기',en:'Show or hide password'}))}</button><button class="btn primary" data-sim="login">${h(L({ko:'로그인',en:'Sign in'}))}</button><p class="note" role="status">${s.msg?h(s.msg):''}</p></div>`;},
  act(s,a,root){if(a==='eye'){s.show=!s.show;}else if(a==='login'){const id=root.querySelector('#sid').value.trim(),pw=root.querySelector('#spw').value;if(id==='demo-user'&&pw==='Demo!4821'){s.screen='done';markPractice('login');}else{S.mistakes.login=(S.mistakes.login||0)+1;save();s.msg=!id||!pw?L({ko:'두 칸을 모두 채워 주세요.',en:'Please fill both boxes.'}):L({ko:'아이디나 비밀번호가 달라요. 안내 문구를 보고 다시 입력해 보세요.',en:'The ID or password differs. Check the hint and try again.'});}}return s;}},
};
function markPractice(k){S.done['practice-'+k]=true;save();}
function settings(){
 const langs=LANGS.map(([c,n])=>`<option value="${c}" ${S.lang===c?'selected':''}>${n}</option>`).join('');
 const devs=[['Galaxy','Samsung Galaxy'],['iPhone','Apple iPhone'],['Unknown',t('unsure')]].map(([d,n])=>`<option value="${d}" ${S.device===d?'selected':''}>${h(n)}</option>`).join('');
 return shell('settings',`<h1>${h(t('settings'))}</h1>
 <section class="sgroup"><h2>${h(L({ko:'더 보기',en:'More'}))}</h2><a class="lrow" href="https://20261118-7dmaxzfnotja7njkkadwsq.streamlit.app/" target="_blank" rel="noopener noreferrer"><span>${h(L({ko:'기존 앱잘알 열기 (Streamlit)',en:'Open the original app (Streamlit)'}))}</span>${icon('arrow')}</a><a class="lrow" href="#/search"><span>${h(L({ko:'검색 · 용어 사전',en:'Search · Phone words'}))}</span>${icon('arrow')}</a><a class="lrow" href="#/help"><span>${h(L({ko:'자주 묻는 질문 · 도움',en:'FAQ · Help'}))}</span>${icon('arrow')}</a><a class="lrow" href="#/learn"><span>${h(L({ko:'모든 수업',en:'All lessons'}))}</span>${icon('arrow')}</a></section>
 <section class="sgroup"><h2>${h(L({ko:'언어와 휴대폰',en:'Language and phone'}))}</h2><label for="s-lang">${h(t('language'))}</label><select id="s-lang">${langs}</select><p class="note">${h(L({ko:'메뉴 이름은 8개 언어로 준비했지만 검수 전 초안이에요. 수업 설명은 한국어와 영어만 제공해요.',en:'Menu names exist in 8 languages but are unreviewed drafts. Lesson text is available in Korean and English only.'}))}</p><label for="s-dev">${h(t('device'))}</label><select id="s-dev"><option value="">—</option>${devs}</select></section>
 <section class="sgroup"><h2>${h(L({ko:'보기와 소리',en:'Display and sound'}))}</h2><label for="s-size">${h(L({ko:'글씨 크기',en:'Text size'}))}</label><select id="s-size">${[[1,L({ko:'기본',en:'Default'})],[1.2,L({ko:'크게',en:'Large'})],[1.4,L({ko:'아주 크게',en:'Extra large'})]].map(([v,n])=>`<option value="${v}" ${S.size===v?'selected':''}>${h(n)}</option>`).join('')}</select><label for="s-level">${h(L({ko:'설명 난이도',en:'Explanation level'}))}</label><select id="s-level">${[['easy',L({ko:'쉽게',en:'Easy'})],['normal',L({ko:'보통',en:'Normal'})],['detail',L({ko:'자세히',en:'Detailed'})]].map(([v,n])=>`<option value="${v}" ${S.level===v?'selected':''}>${h(n)}</option>`).join('')}</select><label class="chk"><input id="s-con" type="checkbox" ${S.contrast?'checked':''}> ${h(L({ko:'높은 대비',en:'High contrast'}))}</label><label for="s-speed">${h(L({ko:'읽어 주는 속도',en:'Voice speed'}))}</label><input id="s-speed" type="range" min=".5" max="1.4" step=".1" value="${S.speed}"><button class="btn" id="s-test">${icon('sound')}${h(t('listen'))}</button></section>
 <section class="sgroup"><h2>${h(L({ko:'폰잘알 소개',en:'About PONJALAL'}))}</h2><p class="slogan">${h(L({ko:'어려운 스마트폰을, 나다운 속도로.',en:'Hard phones, at your own pace.'}))}</p></section><section class="sgroup"><h2>${h(L({ko:'저장된 정보',en:'Saved data'}))}</h2><p class="note">${h(L({ko:'진도와 설정은 이 브라우저에만 저장돼요. 다른 기기와 공유되지 않아요. 실제 비밀번호·인증번호는 저장하지 않아요.',en:'Progress and settings stay only in this browser. Real passwords and codes are never stored.'}))}</p><button class="btn danger" id="s-reset">${h(L({ko:'학습 기록 지우기',en:'Erase learning history'}))}</button></section>
 <section class="sgroup"><h2>${h(t('family'))}</h2><a class="btn" href="#/family">${h(t('family'))}</a></section>`);
}
function me(){
 const rows=(ls,empty)=>ls.length?ls.map(l=>`<a class="lrow" href="#/lesson/${l.id}"><span class="mark ${S.done[l.id]?'ok':''}">${S.done[l.id]?icon('check'):''}</span><span>${h(L(l.title))}</span>${icon('arrow')}</a>`).join(''):`<p class="empty">${h(empty)}</p>`;
 const prog=LESSONS.filter(l=>!S.done[l.id]&&S.step[l.id]>0),done=LESSONS.filter(l=>S.done[l.id]),rec=LESSONS.find(l=>l.id===S.last);
 return shell('me',`<h1>${h(L({ko:'내 학습 기록',en:'My learning record'}))}</h1><p class="lead">${h(L({ko:'이 기록은 이 브라우저에만 저장돼요.',en:'Saved in this browser only.'}))}</p>
 <h2>${h(L({ko:'최근 학습',en:'Recent'}))}</h2>${rows(rec?[rec]:[],L({ko:'아직 없어요.',en:'None yet.'}))}
 <h2>${h(L({ko:'진행 중',en:'In progress'}))}</h2>${rows(prog,L({ko:'진행 중인 수업이 없어요.',en:'Nothing in progress.'}))}
 <h2>${h(L({ko:'완료한 학습 · 다시 학습하기',en:'Completed · study again'}))}</h2>${rows(done,L({ko:'아직 완료한 수업이 없어요.',en:'No completed lessons yet.'}))}
 <h2>${h(L({ko:'완료한 연습',en:'Completed practice'}))}</h2><p>${['sms','copy','login'].filter(k=>S.done['practice-'+k]).map(k=>({sms:L({ko:'인증번호 입력',en:'Code entry'}),copy:L({ko:'복사·붙여넣기',en:'Copy and paste'}),login:L({ko:'로그인',en:'Sign in'})}[k])).join(' · ')||L({ko:'아직 없어요.',en:'None yet.'})}</p>`);
}
function ask(){
 const can=!!(navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia);
 const mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
 return shell('ask',`<h1>${h(L({ko:'사진으로 물어보기',en:'Ask with a photo'}))}</h1>
 <section class="panel"><h2>${h(L({ko:'화면 공유가 뭐예요?',en:'What is screen sharing?'}))}</h2><p>${h(L({ko:'내가 직접 시작하면, 지금 보고 있는 화면을 이 앱 안에서 다시 볼 수 있어요. 언제든 ‘공유 끝내기’로 멈출 수 있고, 이 앱은 화면을 저장하거나 기록하지 않아요.',en:'When you start it yourself, the screen you are viewing appears inside this app. You can stop any time with Stop sharing. This app does not save or record the screen.'}))}</p><p class="note"><b>${h(L({ko:'먼저 확인하세요.',en:'Check first.'}))}</b> ${h(L({ko:'비밀번호, 인증번호, OTP, 은행·카드 정보가 보이는 화면은 공유하지 마세요.',en:'Never share a screen showing passwords, codes, OTPs or bank or card details.'}))}</p>
 ${can&&!mobile?`<label class="chk"><input type="checkbox" id="share-ok"> ${h(L({ko:'위 내용을 읽었어요.',en:'I have read the above.'}))}</label><div class="helps"><button class="btn primary" id="share-start" disabled>${h(L({ko:'화면 공유 시작',en:'Start sharing'}))}</button><button class="btn danger" id="share-stop" hidden>${h(L({ko:'공유 끝내기',en:'Stop sharing'}))}</button></div><video id="share-video" class="sharev" autoplay muted playsinline hidden></video><p id="share-msg" role="status" class="note" hidden></p>`:`<p class="note">${h(mobile?L({ko:'이 휴대폰의 브라우저는 화면 공유를 지원하지 않아요. 아래의 화면 사진 올리기를 이용해 주세요.',en:'Phone browsers do not support screen sharing. Use the screenshot option below.'}):L({ko:'이 브라우저는 화면 공유를 지원하지 않아요. 아래의 화면 사진 올리기를 이용해 주세요.',en:'This browser does not support screen sharing. Use the screenshot option below.'}))}</p>`}</section>
 <section class="panel" id="aiph"><h2>${h(L({ko:'사진으로 물어보기',en:'Ask with a photo'}))}</h2><p>${h(L({ko:'막힌 화면을 사진으로 찍거나 캡처해서 올리면, AI가 사진에 보이는 내용만 보고 쉬운 말로 알려 드려요.',en:'Upload a photo or screenshot and the AI explains only what it can see, in plain words.'}))}</p><p class="note"><b>${h(L({ko:'먼저 확인하세요.',en:'Check first.'}))}</b> ${h(L({ko:'비밀번호, 인증번호, 주민등록번호, 계좌·카드 정보가 보이는 사진은 올리지 마세요. 올린 사진은 설명을 만들기 위해 AI 서비스로 보내지고, 이 앱은 저장하지 않아요.',en:'Do not upload photos showing passwords, codes, ID numbers or bank/card details. The photo is sent to an AI service to write the answer and is not stored by this app.'}))}</p><label class="chk"><input type="checkbox" id="ai-ok"> ${h(L({ko:'사진에 민감한 정보가 없어요.',en:'My photo has no sensitive information.'}))}</label>
 <div class="helps"><label class="btn" for="shot-file">${icon('camera')}${h(L({ko:'사진 고르기 · 찍기',en:'Choose or take a photo'}))}</label></div><input id="shot-file" class="sr" type="file" accept="image/*"><figure id="shot-prev" hidden><img alt="${h(L({ko:'고른 화면 사진',en:'Chosen photo'}))}"><button type="button" class="linkbtn" id="shot-clear">${h(L({ko:'사진 지우고 다시 고르기',en:'Remove and choose again'}))}</button></figure>
 <label for="ai-q" class="fl">${h(L({ko:'궁금한 점',en:'Your question'}))}</label><input id="ai-q" maxlength="300" placeholder="${h(L({ko:'예: 다음에 어디를 눌러요?',en:'e.g. What do I tap next?'}))}"><button type="button" class="btn primary" id="ai-go">${h(L({ko:'AI에게 물어보기',en:'Ask the AI'}))}</button><p class="note" id="ai-msg" role="status" hidden></p><div id="ai-out" class="aiout" aria-live="polite"></div></section>`);
}
let shareStream=null;
function stopShare(){shareStream?.getTracks().forEach(x=>x.stop());shareStream=null;const v=document.getElementById('share-video');if(v){v.srcObject=null;v.hidden=true;}const a=document.getElementById('share-start'),b=document.getElementById('share-stop'),m=document.getElementById('share-msg');if(a)a.hidden=false;if(b)b.hidden=true;if(m){m.hidden=false;m.textContent=L({ko:'공유를 끝냈어요.',en:'Sharing stopped.'});}}
const FERR={not_found:{ko:'없는 코드예요. 글자를 다시 확인해 주세요.',en:'That code does not exist. Check the letters.'},expired:{ko:'기간이 지난 코드예요. 가족에게 새 코드를 받아 주세요.',en:'This code has expired. Ask for a new one.'},used_up:{ko:'사용 횟수가 다 찬 코드예요. 새 코드를 받아 주세요.',en:'This code has no uses left.'},name_taken:{ko:'같은 이름이 이미 있어요. 다른 이름을 써 주세요.',en:'That name is already in this family.'},missing:{ko:'이름과 필요한 칸을 채워 주세요.',en:'Please fill in the boxes.'},forbidden:{ko:'이 가족 공간에 접근할 수 없어요. 다시 참여해 주세요.',en:'No access to this family space.'},image_too_big:{ko:'사진이 너무 커요. 다른 사진을 골라 주세요.',en:'The photo is too large.'},net:{ko:'인터넷 연결을 확인해 주세요. 지금은 보낼 수 없어요.',en:'Check your internet connection.'}};
const ferr=k=>L(FERR[k]||{ko:'문제가 생겼어요. 잠시 뒤 다시 해 주세요.',en:'Something went wrong. Try again soon.'});
async function api(path,opt={}){
 try{const r=await fetch('/api'+path,{...opt,headers:{'content-type':'application/json',...(S.fam?{'x-member-token':S.fam.token}:{}),...opt.headers}});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'x'),{code:j.error||'x',status:r.status});return j;}
 catch(e){if(e.code)throw e;throw Object.assign(new Error('net'),{code:'net'});}
}
let famTimer=null,famLast=0;
const stopFam=()=>{clearInterval(famTimer);famTimer=null;};
const crumb=(...p)=>`<nav class="crumb" aria-label="${h(L({ko:'현재 위치',en:'You are here'}))}">${p.map((x,i)=>i<p.length-1?`<a href="${x[1]}">${h(x[0])}</a>`:`<span aria-current="page">${h(x[0])}</span>`).join(' › ')}</nav>`;
const home0=()=>[L({ko:'홈',en:'Home'}),'#/home'];
function familyPage(sub){
 if(S.fam&&!sub)return chatPage();
 const back=crumb(home0(),[L({ko:'가족',en:'Family'}),'#/family'],...(sub?[[sub==='create'?L({ko:'가족 공간 만들기',en:'Create'}):L({ko:'초대 코드로 참여',en:'Join'}),'']]:[]));
 const note=`<p class="note">${h(L({ko:'이 가족 대화는 계정 없이 이름과 초대 코드로 이용해요. 대화는 몇 초마다 새 메시지를 확인하는 방식이라 약간 늦게 도착할 수 있어요. 비밀번호·인증번호·금융정보는 보내지 마세요.',en:'Family chat uses a name and invite code, without accounts. New messages are checked every few seconds, so they may arrive slightly late. Never send passwords, codes or financial details.'}))}</p>`;
 if(sub==='create')return shell('family',`${back}<h1>${h(L({ko:'가족 공간 만들기',en:'Create a family space'}))}</h1><form class="panel fform" data-form="create"><label for="f-name">${h(L({ko:'가족 이름',en:'Family name'}))} *</label><input id="f-name" maxlength="30" required placeholder="${h(L({ko:'예: 김씨네 가족',en:'e.g. The Kims'}))}"><label for="f-nick">${h(L({ko:'내 이름',en:'My name'}))} *</label><input id="f-nick" maxlength="20" required placeholder="${h(L({ko:'예: 엄마',en:'e.g. Mom'}))}"><button class="btn primary">${h(L({ko:'만들기',en:'Create'}))}</button><p class="note" id="f-msg" role="alert" hidden></p></form>${note}`);
 if(sub==='join')return shell('family',`${back}<h1>${h(L({ko:'초대 코드로 참여',en:'Join with a code'}))}</h1><form class="panel fform" data-form="join"><label for="f-code">${h(L({ko:'초대 코드',en:'Invite code'}))} *</label><div class="row"><input id="f-code" maxlength="12" required autocapitalize="characters" autocomplete="off"><button type="button" class="btn" data-fpaste>${h(L({ko:'붙여넣기',en:'Paste'}))}</button></div><label for="f-nick">${h(L({ko:'내 이름',en:'My name'}))} *</label><input id="f-nick" maxlength="20" required><div class="helps"><button class="btn primary">${h(L({ko:'참여하기',en:'Join'}))}</button><a class="btn" href="#/family">${h(L({ko:'취소',en:'Cancel'}))}</a></div><p class="note" id="f-msg" role="alert" hidden></p></form>${note}`);
 return shell('family',`${back}<h1>${h(L({ko:'가족과 대화하기',en:'Talk with family'}))}</h1><p class="lead">${h(L({ko:'아직 연결된 가족 공간이 없어요.',en:'No family space connected yet.'}))}</p><div class="stack"><a class="btn primary big" href="#/family/create">${h(L({ko:'가족 공간 만들기',en:'Create a family space'}))}</a><a class="btn big" href="#/family/join">${h(L({ko:'초대 코드로 참여하기',en:'Join with an invite code'}))}</a></div>${note}`);
}
function chatPage(){
 const f=S.fam;
 return shell('family',`${crumb(home0(),[L({ko:'가족',en:'Family'}),'#/family'],[f.name,''])}<div class="lhead"><a class="iconbtn" href="#/home" aria-label="${h(L({ko:'뒤로',en:'Back'}))}">${icon('back')}</a><h1 id="fam-title">${h(f.name)}</h1></div>
 <details class="panel famp"><summary>${h(L({ko:'가족 구성원과 초대 코드',en:'Members and invite code'}))}</summary><div id="fam-info" aria-live="polite">…</div></details>
 <p class="mini">${h(L({ko:'2초마다 새 메시지를 확인해요. 인터넷이 끊기면 보내거나 받을 수 없어요.',en:'New messages are checked every few seconds. Without internet, nothing is sent or received.'}))}</p>
 <div id="chat" class="chat" role="log" aria-live="polite" aria-label="${h(L({ko:'대화 내용',en:'Conversation'}))}"></div>
 <p id="chat-msg" class="note" role="alert" hidden></p>
 <form class="composer" data-form="send"><figure id="c-prev" hidden><img alt="${h(L({ko:'보낼 사진 미리보기',en:'Photo to send'}))}"><button type="button" class="linkbtn" data-cclear>${h(L({ko:'사진 빼기',en:'Remove'}))}</button></figure><div class="row"><label class="btn attach" for="c-file" aria-label="${h(L({ko:'사진 첨부',en:'Attach photo'}))}">${icon('camera')}</label><input id="c-file" class="sr" type="file" accept="image/*"><label class="sr" for="c-text">${h(L({ko:'메시지',en:'Message'}))}</label><input id="c-text" maxlength="1000" autocomplete="off" placeholder="${h(L({ko:'메시지를 쓰세요',en:'Write a message'}))}"><button class="btn primary">${h(L({ko:'보내기',en:'Send'}))}</button></div></form>`);
}
const fmtTime=iso=>{const d=new Date(iso);return d.toLocaleString(S.lang==='ko'?'ko-KR':undefined,{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});};
function bubble(m){
 const mine=S.fam.member_id===m.sender_id;
 return `<div class="msg ${mine?'mine':''}" data-id="${m.id}"><small>${h(m.sender_name)} · ${h(fmtTime(m.created_at))}</small>${m.has_image?`<img src="/api/family/${S.fam.id}/messages/${m.id}/image?t=${encodeURIComponent(S.fam.token)}" alt="${h(L({ko:'보낸 사진',en:'Sent photo'}))}" loading="lazy">`:''}${m.message_content?`<p>${h(m.message_content)}</p>`:''}</div>`;
}
async function pollChat(full){
 const box=document.getElementById('chat');if(!box||!S.fam)return;
 const warn=document.getElementById('chat-msg');
 try{const j=await api(`/family/${S.fam.id}/messages?after=${full?0:famLast}`);
  if(!document.getElementById('chat'))return;
  warn.hidden=true;
  const stick=box.scrollHeight-box.scrollTop-box.clientHeight<80||full;
  if(full){box.innerHTML='';}
  if(full&&!j.messages.length)box.innerHTML=`<p class="empty">${h(L({ko:'아직 대화가 없어요. 첫 인사를 보내 보세요.',en:'No messages yet. Say hello.'}))}</p>`;
  if(j.messages.length){box.querySelector('.empty')?.remove();box.insertAdjacentHTML('beforeend',j.messages.filter(m=>!box.querySelector(`[data-id="${m.id}"]`)).map(bubble).join(''));famLast=Math.max(famLast,j.messages[j.messages.length-1].id);if(stick)box.scrollTop=box.scrollHeight;}
 }catch(e){warn.hidden=false;warn.textContent=e.code==='forbidden'?ferr('forbidden'):ferr('net');if(e.code==='forbidden'){S.fam=null;save();}}
}
async function loadFamInfo(){
 const box=document.getElementById('fam-info');if(!box)return;
 try{const j=await api(`/family/${S.fam.id}`);
  const inv=j.invite&&j.me.role==='owner'?`<p><b>${h(L({ko:'초대 코드',en:'Invite code'}))}</b> <code class="code">${h(j.invite.invite_code)}</code></p><p class="mini">${h(L({ko:'7일 동안, 최대 10명까지 쓸 수 있어요.',en:'Valid 7 days, up to 10 uses.'}))} (${j.invite.used_count}/${j.invite.max_uses})</p><div class="helps"><button class="btn" data-fcopy="${h(j.invite.invite_code)}">${h(L({ko:'코드 복사',en:'Copy code'}))}</button><button class="btn" data-fshare="${h(j.invite.invite_code)}">${h(L({ko:'공유',en:'Share'}))}</button><button class="btn" data-freissue>${h(L({ko:'새 코드 받기',en:'New code'}))}</button></div>`:`<p class="mini">${h(L({ko:'초대 코드는 가족 공간을 만든 사람이 관리해요.',en:'The family creator manages invite codes.'}))}</p>`;
  box.innerHTML=`<ul class="plain members">${j.members.map(m=>`<li>${h(m.nickname)} <small>${h(m.role==='owner'?L({ko:'관리자',en:'Owner'}):L({ko:'구성원',en:'Member'}))}</small></li>`).join('')}</ul>${inv}<button class="btn danger" data-fleave>${h(L({ko:'가족 공간 나가기',en:'Leave this family'}))}</button><p class="note" id="fam-msg" role="status" hidden></p>`;
 }catch(e){box.textContent=ferr(e.code==='forbidden'?'forbidden':'net');}
}
function startChat(){
 loadFamInfo();famLast=0;pollChat(true);
 famTimer=setInterval(()=>{if(!document.hidden)pollChat(false);},2000);
}
function shrink(file,mx=900,q=.6){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const k=Math.min(1,mx/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',q));};im.onerror=()=>rej();im.src=u;});}
let pendingImg=null;
const fmsg=(id,t)=>{const n=document.getElementById(id);if(n){n.hidden=false;n.textContent=t;}};
document.addEventListener('submit',async e=>{
 if(e.target.id==='ai-follow'){e.preventDefault();const i=document.getElementById('ai-f'),t=i.value.trim();if(!t)return;aiHist.push({role:'user',content:t});await aiCall();return;}
 const f=e.target.closest('[data-form]');if(!f)return;e.preventDefault();
 const kind=f.dataset.form,btn=f.querySelector('button:not([type=button])');
 if(btn)btn.disabled=true;
 try{
  if(kind==='create'||kind==='join'){
   const body=kind==='create'?{name:f.querySelector('#f-name').value,nickname:f.querySelector('#f-nick').value}:{code:f.querySelector('#f-code').value,nickname:f.querySelector('#f-nick').value};
   const j=await api(kind==='create'?'/family':'/join',{method:'POST',body:JSON.stringify(body)});
   S.fam={id:j.id,name:j.name,token:j.token,member_id:j.member_id,role:j.role};save();location.hash='#/family';
   if(location.hash==='#/family')render();
  }else if(kind==='send'){
   const inp=f.querySelector('#c-text'),text=inp.value.trim();
   if(!text&&!pendingImg)return;
   await api(`/family/${S.fam.id}/messages`,{method:'POST',body:JSON.stringify({text,image:pendingImg})});
   inp.value='';pendingImg=null;document.getElementById('c-prev').hidden=true;document.getElementById('chat-msg').hidden=true;await pollChat(false);
  }
 }catch(er){fmsg(kind==='send'?'chat-msg':'f-msg',ferr(er.code)+(kind==='send'?' '+L({ko:'(쓴 내용은 그대로 남아 있어요. 다시 보내기를 눌러 주세요.)',en:'(Your text is kept. Press Send again.)'}):''));}
 finally{if(btn)btn.disabled=false;}
});
document.addEventListener('change',async e=>{
 if(e.target.id!=='c-file')return;const file=e.target.files[0];if(!file)return;
 try{const d=await shrink(file);if(d.length>400000)throw 0;pendingImg=d;const fig=document.getElementById('c-prev');fig.querySelector('img').src=d;fig.hidden=false;}
 catch{fmsg('chat-msg',ferr('image_too_big'));}
 e.target.value='';
});
let aiHist=[];
async function aiCall(){
 const out=document.getElementById('ai-out'),msg=document.getElementById('ai-msg');
 out.innerHTML=aiHist.filter(m=>m.role!=='system').map(m=>`<div class="msg ${m.role==='user'?'mine':''}"><small>${h(m.role==='user'?L({ko:'나',en:'Me'}):'AI')}</small><p>${h(typeof m.content==='string'?m.content:m.content.find(c=>c.type==='text').text)}</p></div>`).join('');
 const wait=document.createElement('p');wait.className='note';wait.textContent=L({ko:'사진을 살펴보고 있어요. 잠시만 기다려 주세요.',en:'Looking at your photo. One moment.'});out.append(wait);
 try{const r=await fetch('/api/ask-photo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({messages:aiHist})});const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'x');aiHist.push({role:'assistant',content:j.answer});msg.hidden=true;
 }catch(er){aiHist.pop();msg.hidden=false;msg.textContent=er.message==='no_key'?L({ko:'AI 설정이 아직 끝나지 않았어요. 앱 관리자가 설정해야 사용할 수 있어요.',en:'AI is not set up yet. The app owner must finish setup.'}):er.message==='too_big'?L({ko:'사진이 너무 커요. 다른 사진을 골라 주세요.',en:'The photo is too large.'}):L({ko:'AI 요청을 완료하지 못했어요. 다시 시도해 주세요. 쓴 내용은 그대로 있어요.',en:'The AI request failed. Please try again. Your text is kept.'});}
 wait.remove();
 out.innerHTML=aiHist.map((m,i)=>`<div class="msg ${m.role==='user'?'mine':''}"><small>${h(m.role==='user'?L({ko:'나',en:'Me'}):L({ko:'AI (틀릴 수 있어요)',en:'AI (may be wrong)'}))}</small><p>${h(typeof m.content==='string'?m.content:m.content.find(c=>c.type==='text').text)}</p></div>`).join('')+(aiHist.length?`<form class="row" id="ai-follow"><label class="sr" for="ai-f">${h(L({ko:'추가 질문',en:'Follow-up'}))}</label><input id="ai-f" maxlength="300" placeholder="${h(L({ko:'추가로 궁금한 점',en:'Another question'}))}"><button class="btn">${h(L({ko:'보내기',en:'Send'}))}</button></form><button type="button" class="linkbtn" id="ai-new">${h(L({ko:'새 사진으로 시작',en:'Start with a new photo'}))}</button>`:'');
}
document.addEventListener('click',async e=>{
 if(e.target.closest('#ai-go')){
  const msg=document.getElementById('ai-msg'),f=document.getElementById('shot-file').files[0],q=document.getElementById('ai-q').value.trim();
  const bad=m=>{msg.hidden=false;msg.textContent=m;};
  if(!document.getElementById('ai-ok').checked)return bad(L({ko:'사진에 민감한 정보가 없는지 확인하고 체크해 주세요.',en:'Please confirm the photo has no sensitive information.'}));
  if(!f)return bad(L({ko:'먼저 사진을 골라 주세요.',en:'Choose a photo first.'}));
  let d;try{d=await shrink(f,1280,.8);}catch{return bad(L({ko:'사진을 읽을 수 없어요. 다른 사진을 골라 주세요.',en:'Cannot read this photo.'}));}
  aiHist=[{role:'user',content:[{type:'text',text:q||L({ko:'이 화면에서 지금 무엇을 해야 하는지 알려 주세요.',en:'Tell me what to do on this screen.'})},{type:'image_url',image_url:{url:d}}]}];
  msg.hidden=true;e.target.closest('#ai-go').disabled=true;await aiCall();document.getElementById('ai-go').disabled=false;return;
 }
 if(e.target.closest('#ai-new')){aiHist=[];document.getElementById('ai-out').innerHTML='';document.getElementById('shot-clear')?.click();return;}
 const b=e.target.closest('[data-fpaste],[data-cclear],[data-fcopy],[data-fshare],[data-freissue],[data-fleave]');if(!b)return;
 if('fpaste' in b.dataset){try{document.getElementById('f-code').value=(await navigator.clipboard.readText()).trim().toUpperCase();}catch{fmsg('f-msg',L({ko:'붙여넣기를 허용하지 않았어요. 코드를 직접 써 주세요.',en:'Paste was not allowed. Type the code.'}));}}
 else if('cclear' in b.dataset){pendingImg=null;document.getElementById('c-prev').hidden=true;}
 else if(b.dataset.fcopy){try{await navigator.clipboard.writeText(b.dataset.fcopy);fmsg('fam-msg',L({ko:'코드를 복사했어요.',en:'Code copied.'}));}catch{fmsg('fam-msg',L({ko:'복사하지 못했어요. 코드를 직접 알려 주세요.',en:'Could not copy. Share the code by hand.'}));}}
 else if(b.dataset.fshare){const txt=L({ko:`폰잘알 가족 초대 코드: ${b.dataset.fshare}`,en:`PONJALAL family invite code: ${b.dataset.fshare}`});if(navigator.share){try{await navigator.share({text:txt});}catch{}}else fmsg('fam-msg',L({ko:'이 브라우저는 공유를 지원하지 않아요. 코드 복사를 이용해 주세요.',en:'Sharing is unsupported here. Use Copy code.'}));}
 else if('freissue' in b.dataset){try{await api(`/family/${S.fam.id}/invite`,{method:'POST'});await loadFamInfo();fmsg('fam-msg',L({ko:'새 코드를 만들었어요. 이전 코드는 더 쓸 수 없어요.',en:'New code created. The old one no longer works.'}));}catch(er){fmsg('fam-msg',ferr(er.code));}}
 else if('fleave' in b.dataset){if(!confirm(L({ko:'이 가족 공간에서 나갈까요? 다시 들어오려면 초대 코드가 필요해요.',en:'Leave this family? You will need a code to rejoin.'})))return;try{await api(`/family/${S.fam.id}/me`,{method:'DELETE'});S.fam=null;save();render();}catch(er){fmsg('fam-msg',ferr(er.code));}}
});

function render(){
 const [r,a,b]=(location.hash.slice(2)||'welcome').split('/');
 apply();let html;if(r!=='lesson')intakeDone={};
 if(r==='welcome')html=welcome();
 else if(r==='onboard')html=onboard();
 else if(!S.onboarded&&r!=='settings')html=welcome();
 else if(r==='home')html=home();
 else if(r==='learn')html=learn(a);
 else if(r==='lesson')html=lesson(a,b===undefined?undefined:Number(b));
 else if(r==='search')html=search(decodeURIComponent(a||''));
 else if(r==='help')html=helpPage();
 else if(r==='practice')html=practice(a);
 else if(r==='settings')html=settings();
 else if(r==='family')html=familyPage(a);
 else if(r==='me')html=me();
 else if(r==='ask')html=ask();
 else html=home();
 $app.innerHTML=html;
 document.title=r==='welcome'?'폰잘알':'폰잘알 · '+({home:t('home'),learn:t('learn'),lesson:t('learn'),practice:t('practice'),help:t('help'),settings:t('settings'),me:L({ko:'내 기록',en:'Records'}),ask:L({ko:'화면 도움',en:'Screen help'}),family:t('family'),search:t('search'),onboard:t('start')}[r]||'');
 stopFam();
 if(r==='family'&&S.fam&&!a)startChat();
 if(r==='practice'&&a&&SIM[a]){window.__sim=SIM[a].init();drawSim();}
 if(r!=='welcome'&&r!=='onboard')window.scrollTo(0,0);
}
function drawSim(){const root=document.getElementById('sim');if(!root)return;const m=root.dataset.mode;root.innerHTML=SIM[m].view(window.__sim);const f=root.querySelector('input');if(f&&window.__simfocus)f.focus();}

document.addEventListener('click',e=>{
 const b=e.target.closest('button,[data-term]');if(!b)return;
 if(b.dataset.lang){S.lang=b.dataset.lang;save();render();}
 else if(b.dataset.device){S.device=b.dataset.device;save();render();}
 else if('finish' in b.dataset){S.onboarded=true;save();location.hash='#/home';}
 else if(b.dataset.stuck!==undefined){stuckSel=+b.dataset.stuck<0?null:+b.dataset.stuck;render();}
 else if(b.dataset.mode){intakeDone[b.dataset.lid]=true;S.mode[b.dataset.lid]=b.dataset.mode;if(b.dataset.mode==='stuck'){S.stuckSet=S.stuckSet||{};}save();render();}
 else if(b.dataset.modereset){stuckSel=null;intakeDone={};delete S.mode[b.dataset.modereset];S.step[b.dataset.modereset]=0;phaseKey='';save();location.hash='#/lesson/'+b.dataset.modereset;render();}
 else if('phnext' in b.dataset){phase=Math.min(2,phase+1);window.__no=false;render();}
 else if('phprev' in b.dataset){phase=Math.max(0,phase-1);window.__no=false;render();}
 else if(b.dataset.phase==='ok'){const m=location.hash.split('/');window.__no=false;phaseKey='';location.hash=`#/lesson/${m[2]}/${(+m[3]||0)+1}`;}
 else if(b.dataset.phase==='no'){window.__no=true;render();}
 else if(b.dataset.phase==='again'){window.__no=false;phase=0;render();}
 else if(b.dataset.go!==undefined){const m=location.hash.split('/');location.hash=`#/lesson/${m[2]}/${b.dataset.go}`;}
 else if(b.dataset.complete){S.done[b.dataset.complete]=true;save();location.hash='#/learn';}
 else if('easier' in b.dataset){S.level='easy';save();const st=document.getElementById('instr');say(L({ko:'가장 쉬운 설명으로 바꿨어요.',en:'Switched to the simplest explanation.'}));render();}
 else if('speakhome' in b.dataset){if(!speak(document.querySelector('.greet').textContent))alert(L({ko:'이 브라우저는 음성 안내를 지원하지 않아요.',en:'Voice is not supported here.'}));}
 else if('listen' in b.dataset){if(!speak(document.getElementById('instr').textContent+' '+(document.getElementById('more')?.textContent||'')))say(L({ko:'이 브라우저에서는 음성을 사용할 수 없어요.',en:'Audio is not available in this browser.'}));}
 else if(b.dataset.say){const g=GLOSSARY[b.dataset.say];if(!speak(L(g.t)+'. '+L(g.d)))say(L({ko:'이 브라우저에서는 음성을 사용할 수 없어요.',en:'Audio is not available in this browser.'}));}
 else if(b.dataset.term){const g=GLOSSARY[b.dataset.term],box=document.getElementById('termbox');box.hidden=false;box.innerHTML=`<b>${h(L(g.t))}</b><p>${h(L(g.d))}</p><small>${h(L({ko:'예: ',en:'Example: '}))}${h(L(g.e))}</small>`;}
 else if(b.id==='s-test'){if(!speak(L({ko:'안녕하세요. 소리가 잘 들리나요?',en:'Hello. Can you hear this?'})))say(L({ko:'이 브라우저에서는 음성을 사용할 수 없어요.',en:'Audio is not available in this browser.'}));}
 else if(b.id==='s-reset'){if(confirm(L({ko:'학습 기록을 모두 지울까요?',en:'Erase all learning history?'}))){S={...def,lang:S.lang,device:S.device,onboarded:true,size:S.size,contrast:S.contrast,speed:S.speed};save();render();}}
 else if(b.dataset.sim){const root=document.getElementById('sim'),m=root.dataset.mode;const inp=root.querySelector('input');if(inp&&m==='sms')window.__sim.val=inp.value;window.__sim=SIM[m].act(window.__sim,b.dataset.sim,root);window.__simfocus=window.__sim.screen==='enter';drawSim();}
});
document.addEventListener('change',e=>{
 const i=e.target;
 if(i.id==='s-lang'){S.lang=i.value;save();render();}
 else if(i.id==='s-dev'){S.device=i.value;save();render();}
 else if(i.id==='s-level'){S.level=i.value;save();}
 else if(i.id==='top-lang'){S.lang=i.value;save();render();}
 else if(i.id==='s-size'){S.size=Number(i.value);save();apply();}
 else if(i.id==='s-con'){S.contrast=i.checked;save();apply();}
 else if(i.id==='s-speed'){S.speed=Number(i.value);save();}
});
document.addEventListener('click',async e=>{
 const b=e.target.closest('#share-start,#share-stop,#shot-clear');if(!b)return;
 if(b.id==='share-stop'){stopShare();return;}
 if(b.id==='shot-clear'){document.getElementById('shot-prev').hidden=true;document.getElementById('shot-file').value='';return;}
 const m=document.getElementById('share-msg');
 try{shareStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});const v=document.getElementById('share-video');v.srcObject=shareStream;v.hidden=false;b.hidden=true;document.getElementById('share-stop').hidden=false;m.hidden=false;m.textContent=L({ko:'공유 중이에요. 이 화면은 이 기기에서만 보이고 저장되지 않아요.',en:'Sharing. This view stays on this device and is not saved.'});shareStream.getVideoTracks()[0].addEventListener('ended',stopShare);}
 catch{m.hidden=false;m.textContent=L({ko:'공유를 시작하지 못했어요. 허용하지 않으셨거나 이 기기에서 지원되지 않을 수 있어요.',en:'Sharing did not start. It may have been declined or is unsupported here.'});}
});
document.addEventListener('change',e=>{
 if(e.target.id==='share-ok')document.getElementById('share-start').disabled=!e.target.checked;
 if(e.target.id==='shot-file'){const f=e.target.files[0];const fig=document.getElementById('shot-prev');if(!f)return;if(!f.type.startsWith('image/')){return;}const img=fig.querySelector('img');if(img.dataset.u)URL.revokeObjectURL(img.dataset.u);img.dataset.u=img.src=URL.createObjectURL(f);fig.hidden=false;}
});
addEventListener('hashchange',()=>{if(shareStream)stopShare();});
document.addEventListener('submit',e=>{if(e.target.classList.contains('searchf')){e.preventDefault();location.hash='#/search/'+encodeURIComponent(e.target.querySelector('input').value.trim());}});
const safeRender=()=>{try{render();}catch(e){$app.innerHTML='<main style="padding:2rem;font:18px sans-serif"><h1>화면을 불러오지 못했어요</h1><p>새로고침해도 같으면 아래 내용을 알려 주세요.</p><pre style="white-space:pre-wrap">'+String(e&&e.stack||e).replace(/</g,'&lt;').slice(0,600)+'</pre></main>';}};
addEventListener('hashchange',safeRender);
safeRender();
