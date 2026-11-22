import './style.css';
import logo from '../assets/logo.svg';
import heroArt from '../assets/guide.svg';
import {t,tr,h,ico,glyph,goBtn,action,box,note,prefs,progress,local,flows,legacy,checks,cards,names,instruction,speak} from './shared.js';

const app=document.querySelector('#app');
let route='',topic='',diagnostic=null,quizOpen=false,chosen=-1;
const freshPhone=(mode='free',key='')=>({mode,key,at:0,digits:'',bad:false,clipboard:'',pasted:''});
let sim=freshPhone();
let extraModule, mountSequence=0;
const lessonExists=k=>Object.hasOwn(flows,k)||k.startsWith('old:')&&Object.hasOwn(legacy,k.slice(4));
const appKeys=['calls','contacts','sms','camera','gallery','internet','wifi','font','login','signup','verify','copy','cert','simple','clock'];
const skin={normal:1,large:1.14,xl:1.3};
const safeHome='<span aria-hidden="true">⌂</span> ';
const voice=(str,lang=prefs.lang)=>prefs.voice?`<button type="button" data-speak="${h(str)}" data-voice-lang="${h(lang)}"><span aria-hidden="true">🔊</span> ${h(t('listen'))}</button><p class="notice warn" id="voice-status" role="status"></p>`:'';
const bar=()=>`<nav class="toolbar" aria-label="${h(t('home'))}">${goBtn('home',safeHome+h(t('home')))}${!['help','family','profile'].includes(route)?goBtn('help','♡ '+h(t('help'))):''}</nav>`;
const titleFor=k=>k.startsWith('old:')?legacy[k.slice(4)]?.title:t(k);
const options=(items,selected,labels=t)=>items.map(k=>`<option value="${h(k)}" ${selected===k?'selected':''}>${h(labels(k))}</option>`).join('');

function home(){
 return `<section class="hero"><div><p class="tag">${h(t('tag'))}</p><h1 tabindex="-1">${h(t('hero'))}</h1><p>${h(t('lead'))}</p></div><img src="${heroArt}" alt="" width="440" height="250"></section>
 <div class="section-title"><h2>${h(t('topics'))}</h2><p>${h(t('pick'))}</p></div><div class="grid">${cards.map(([k,icon,tone])=>goBtn(['sim','family','help'].includes(k)?k:'learn/'+k,`<span class="icon ${tone}">${ico(icon,26)}</span><span class="arrow" aria-hidden="true">›</span><strong>${h(t(k))}</strong><small>${h(t(k+'_d'))}</small>`,'card '+k)).join('')}</div>
 <div class="quick">${[['family','person'],['resume','book'],['favorites','star'],['safe','shield']].map(([k,ic])=>goBtn(k,ico(ic,20)+h(t(k)))).join('')}</div><div class="row">${goBtn('catalog',h(t('catalog')))}${goBtn('fix',h(t('fix')))}</div>`;
}
function learn(){
 const old=topic.startsWith('old:'),name=old?topic.slice(4):topic,data=legacy[name],steps=old?data?.steps:flows[topic];
 if(!lessonExists(topic))return catalogue('catalog');
 const values=old?progress.legacySteps:progress.steps,idx=Math.max(0,Math.min(Number(values[name])||0,steps.length-1));
 const str=old?steps[idx]:instruction(steps[idx]),symbol=old?'📚':steps[idx][2];
 const stars=old?progress.legacyFavorites:progress.favorites;
 const lead=old?`<p class="muted">${prefs.lang==='ko'?h(data.desc):'This original lesson is in Korean.'}</p>`:({copy:'copy_def',verify:'verify_safe'}[name]?`<p class="muted">${h(t({copy:'copy_def',verify:'verify_safe'}[name]))}</p>`:['wifi','font'].includes(name)?`<p class="muted">${h(prefs.device)} · ${h(t('settings'))} › ${h(t(name))}</p>`:'');
 let quiz=data?.quiz&&old?data.quiz:null;
 if(!old){const q=steps[Math.min(1,steps.length-1)],opts=[q[1],q[1]==='hang'?'sample_msg':'hang'];if(name.length%2)opts.reverse();quiz={question:instruction(q),options:opts.map(t),answer:opts.indexOf(q[1]),feedback:instruction(q)};}
 return box(titleFor(topic),`${lead}<p class="steps" aria-live="polite">${h(t('step'))} ${idx+1} / ${steps.length}</p><progress value="${idx+1}" max="${steps.length}" aria-label="${h(t('step'))}"></progress>
 <div class="step"><span aria-hidden="true">${symbol}</span><h2>${h(str)}</h2></div>${voice(str,old?'ko':prefs.lang)}
 <div class="two">${action('prev',h(t('previous')),'',idx===0?'disabled':'')}${action(idx<steps.length-1?'next':'complete',h(t(idx<steps.length-1?'next':'finish')),'primary')}</div>
 <div class="row">${action('star',(stars.includes(name)?'★ ':'☆ ')+h(t('favorites')),'',`aria-pressed="${stars.includes(name)}"`)}${!old&&name!=='safe'?goBtn('sim/'+name,'📱 '+h(t('practice'))):''}${old?action('reset',h(tr('처음부터 다시 보기','Restart this lesson'))):''}</div>
 ${quiz?`<details id="quiz" ${quizOpen?'open':''}><summary>${h(t('quiz'))}</summary><p>${h(quiz.question)}</p><div class="list">${quiz.options.map((o,i)=>action('quiz:'+i,h(o))).join('')}</div>${chosen>=0?note(chosen===quiz.answer?t('done')+' '+quiz.feedback:t('retry'),chosen===quiz.answer?'good':'warn'):''}</details>`:''}
 ${name==='safe'?`<details><summary>${h(t('contacts_kr'))}</summary><p>${h(t('independent'))}</p><div class="row"><a class="button" href="https://www.fsc.go.kr/no040102?cnId=913&amp;curPage=1" target="_blank" rel="noopener">${h(t('police'))} · 112</a><a class="button" href="https://www.fss.or.kr/fss/main/contents.do?menuNo=201178" target="_blank" rel="noopener">${h(t('fss'))} · 1332</a></div></details>`:''}`);
}
function catalogue(kind){
 const rows=kind==='catalog'?Object.keys(flows):kind==='resume'?[...new Set([progress.recent,...Object.keys(progress.completed),...Object.keys(progress.legacyCompleted).map(k=>'old:'+k)])].filter(k=>flows[k]||k.startsWith('old:')&&legacy[k.slice(4)]):[...progress.favorites,...progress.legacyFavorites.map(k=>'old:'+k)];
 const list=rows.filter(k=>flows[k]||k.startsWith('old:')&&legacy[k.slice(4)]);
 return box(t(kind),`${list.length?`<div class="list">${list.map(k=>goBtn('learn/'+k,`${progress.completed[k]||k.startsWith('old:')&&progress.legacyCompleted[k.slice(4)]?'✓ ':glyph(k)+' '}${h(titleFor(k))}`)).join('')}</div>`:note(t('empty'))}
 ${kind==='catalog'?`<details><summary>${h(t('legacy'))}</summary><label class="field">${h(tr('기존 학습 검색','Search original lessons'))}<input id="legacy-search" type="search" placeholder="${h(tr('예: 와이파이…','Example: Wi-Fi…'))}"></label><div class="list" id="legacy-list">${Object.keys(legacy).map(k=>goBtn('learn/old:'+k,h(legacy[k].title))).join('')}</div></details>`:''}<div class="row">${goBtn('backup',h(t('legacy')))}</div>`);
}
function settings(){
 return box(t('settings'),`<div class="panel"><label class="field">${h(t('font'))}<select name="size" data-pref>${options(Object.keys(skin),prefs.size)}</select></label><label class="field">${h(t('device'))}<select name="device" data-pref>${options(['Galaxy','iPhone'],prefs.device,k=>k)}</select></label><label class="check"><input type="checkbox" name="voice" data-pref ${prefs.voice?'checked':''}> ${h(t('voice'))}</label><label class="field">${h(t('speed'))}<select name="speed" data-pref>${options(['0.75','0.9','1'],String(prefs.speed),k=>k+'×')}</select></label></div>${goBtn('backup',h(t('legacy')))}`);
}
function fix(){
 if(diagnostic===null)return box(t('fix'),`<p>${h(t('problem_choice'))}</p>${prefs.lang!=='ko'&&prefs.lang!=='en'?note('Troubleshooting steps are shown in English.'):''}<div class="list">${checks.map(([icon,ko,en],i)=>action('diagnose:'+i,icon+' '+h(tr(ko,en)))).join('')}</div>`);
 const [icon,k,e,ks,es]=checks[diagnostic.key],p=diagnostic.at,str=tr(ks[p],es[p]);
 return box(tr(k,e),`<p class="steps">${h(t('step'))} ${p+1} / ${ks.length}</p><div class="step"><span aria-hidden="true">${icon}</span><h2>${h(str)}</h2></div>${voice(str,tr('ko','en'))}<div class="row">${action('fix-prev',h(t('previous')))}${action('fix-next',h(t('next')),'',p+1===ks.length?'disabled':'')}${goBtn('home',h(t('fixed')),'primary')}</div>`);
}
function phone(){
 const {key,mode,at,digits,bad,pasted}=sim,flow=flows[key];let body='';
 if(!key){const apps=mode==='review'?progress.practiced:appKeys;body=`<h2>${h(t('sim'))}</h2><p class="muted">${h(t('free_hint'))}</p>${!apps.length?note(t('empty')):`<div class="two">${apps.map(k=>action('sim-app:'+k,(k==='clock'?'🕒':glyph(k))+' '+h(t(k)))).join('')}</div>`}`;}
 else if(key==='clock')body=`<h2>🕒 ${h(t('clock'))}</h2><p class="value">${h(new Intl.DateTimeFormat(prefs.lang,{hour:'2-digit',minute:'2-digit'}).format(new Date()))}</p>`;
 else if(!flow||at>=flow.length)body=`${note('✓ '+t('done'),'good')}${action('sim-app:'+key,'↻ '+h(t('practice')),'wide')}`;
 else{
  const [,target,emoji]=flow[at];const code=key==='verify',copy=key==='copy';
  body=`<h2>${code&&[2,3].includes(at)?'💬 '+h(t('sms')):emoji+' '+h(t(key))}</h2>${bad?note(t('retry'),'warn'):''}`;
  if(code&&[2,3].includes(at))body+='<p class="value">246810</p>';
  if(code&&target==='code_input')body+=`<div class="value" role="status">${digits||'— — — — — —'}</div><div class="num">${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map(n=>action('digit:'+n,h(n),'',n==='⌫'?`aria-label="${h(tr('한 자리 지우기','Delete one digit'))}"`:n==='✓'?`aria-label="${h(t('confirm'))}"`:'')).join('')}</div>`;
  else{
   if(copy&&at===0)body+='<p class="value" style="user-select:text" tabindex="0">5837</p>';
   if(copy&&at>=2)body+=`<p class="value" role="status">${h(pasted||'▭')}</p>`;
   if(['gallery','camera'].includes(key)&&target==='sample_pic')body+=`<img src="${heroArt}" alt="${h(t('sample_pic'))}" width="220" height="125">`;
   if(target==='show'||key==='login'&&at===3)body+=`<p class="value">${target==='show'?'••••••••':'Sample#1'}</p>`;
   if(['sample_id','sample_num'].includes(target))body+=`<p class="value">${target==='sample_id'?'practice-user':'000-0000-0000'}</p>`;
   body+=action('sim-next',h(t(target)),'wide primary')+`<div class="row">${action('sim-wrong',h(t(target==='settings'?'clock':'settings')),'wide')}</div>`;
  }
 }
 return box('📱 '+t('sim'),`<p class="muted">${h(t('demo'))}</p><div class="row">${['free','mission','review'].map(m=>action('mode:'+m,h(t(m)),'',`aria-pressed="${m===mode}"`)).join('')}</div>
 ${flow&&at<flow.length?`<p class="steps">${h(t('step'))} ${at+1} / ${flow.length}</p><p>${h(instruction(flow[at]))}</p>${voice(instruction(flow[at]))}`:''}
 <div class="phone"><div class="phone-status"><span>9:41</span><span aria-hidden="true">▮▮▮ &nbsp; ◓ &nbsp; ▰</span></div>${body}${key?`<div class="row">${action('sim-home',safeHome+h(t('home')),'wide')}</div>`:''}</div>`);
}
function routeFromURL(){
 let val=location.hash.slice(1)||'home';
 if(val==='main')val=route||'home';
 if(val==='safe')val='learn/safe';
 const [next,key='']=val.split('/');
 const target=['home','learn','catalog','fix','resume','favorites','settings','sim','backup','family','help','profile'].includes(next)?next:'home';
 if(route!==target||topic!==key){quizOpen=false;chosen=-1;if(target==='fix')diagnostic=null;if(target==='sim')sim=freshPhone(sim.mode,appKeys.includes(key)?key:'');}
 route=target;topic=key;
 if(route==='learn'&&(Object.hasOwn(flows,topic)||topic.startsWith('old:')&&Object.hasOwn(legacy,topic.slice(4)))){progress.recent=topic;local();}
 render(true);
}
export function go(to){if((location.hash.slice(1)||'home')===to){routeFromURL();return;}location.hash=to;}
function render(moveFocus=false,focusSelector=''){
 const sequence=++mountSequence,extended=['backup','family','help','profile'].includes(route);
 document.documentElement.lang=prefs.lang==='tl'?'fil':prefs.lang;
 document.documentElement.style.setProperty('--scale',skin[prefs.size]||1);
 document.title=t('brand');document.querySelector('#skip').textContent=tr('본문으로 바로 가기','Skip to main content');
 const html=route==='home'?home():route==='learn'?learn():route==='sim'?phone():route==='settings'?settings():route==='fix'?fix():extended?`<div id="interactive">${box(t(route==='backup'?'legacy':route),note(tr('불러오는 중…','Loading…')))}</div>`:catalogue(route);
 app.innerHTML=`<div class="wrap"><header><a href="#home" class="brand"><img src="${logo}" alt="" width="48" height="48"><span><strong>${h(t('brand'))}</strong><small>${h(t('brand_d'))}</small></span></a><div class="header-actions"><label class="lang"><span aria-hidden="true">🌐</span><select name="lang" aria-label="Language / 언어" data-pref>${options(Object.keys(names),prefs.lang,k=>names[k])}</select></label>${goBtn('settings','⚙ '+h(t('settings')))}${goBtn('profile','♙ '+h(t('profile')))}</div></header><main id="main" tabindex="-1">${route==='home'?'':bar()}${html}</main><footer>${h(t('brand'))} · ${h(t('brand_d'))}</footer></div>`;
 if(moveFocus){window.scrollTo(0,0);if(route!=='home')app.querySelector('h1')?.focus({preventScroll:true});}
 if(focusSelector)app.querySelector(focusSelector)?.focus({preventScroll:true});
 if(extended){const type=route;extraModule??=import('./connections.js');extraModule.then(async m=>{if(sequence!==mountSequence)return;const node=app.querySelector('#interactive');const focus=moveFocus&&node.contains(document.activeElement);await m.mount(node,type,go);if(focus&&node.isConnected&&document.activeElement===document.body)node.querySelector('h1')?.focus();}).catch(()=>{if(sequence===mountSequence)document.querySelector('#interactive').innerHTML=note(tr('화면을 열지 못했어요. 새로고침해 주세요.','Could not open this page. Reload to try again.'),'warn');});}
}
window.addEventListener('hashchange',()=>{window.speechSynthesis?.cancel();routeFromURL();});
window.addEventListener('guide:recover',()=>{if(route==='profile')render();});
document.querySelector('#skip').addEventListener('click',e=>{e.preventDefault();document.querySelector('#main').focus();});
app.addEventListener('input',e=>{if(e.target.id==='legacy-search'){const key=e.target.value.trim().toLowerCase();app.querySelectorAll('#legacy-list a').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(key));}});
app.addEventListener('change',e=>{
 const item=e.target;if(!item.matches('[data-pref]'))return;
 prefs[item.name]=item.type==='checkbox'?item.checked:item.value;local();
 if(item.name==='lang'){const url=new URL(location.href);url.searchParams.set('lang',prefs.lang);history.replaceState(null,'',url);}
 render(false,`[name="${item.name}"]`);
});
app.addEventListener('click',e=>{
 const link=e.target.closest('a[data-go]');
 if(link&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();go(link.dataset.go);return;}
 const btn=e.target.closest('button');if(!btn||btn.disabled)return;
 if(btn.dataset.speak){app.querySelector('#voice-status').textContent=speak(btn.dataset.speak,btn.dataset.voiceLang)?'':t('no_voice');return;}
 const [id,val]=String(btn.dataset.action||'').split(':');if(!id)return;
 if(route==='learn'){
  if(!lessonExists(topic))return;
  const old=topic.startsWith('old:'),k=old?topic.slice(4):topic,steps=old?progress.legacySteps:progress.steps;
  const list=old?progress.legacyFavorites:progress.favorites,done=old?progress.legacyCompleted:progress.completed;
  if(id==='prev')steps[k]=Math.max(0,(steps[k]||0)-1);
  if(id==='next')steps[k]=(steps[k]||0)+1;
  if(id==='reset')steps[k]=0;
  if(id==='star'){const i=list.indexOf(k);if(i<0)list.push(k);else list.splice(i,1);}
  if(id==='quiz'){chosen=Number(val);quizOpen=true;if(old&&legacy[k]?.quiz){progress.legacyQuiz[k]={attempts:(progress.legacyQuiz[k]?.attempts||0)+1,correct:legacy[k].quiz.answer===chosen};}}
  if(id==='complete'){done[k]=new Date().toISOString();local();go('resume');return;}
  local();render(false,id==='quiz'?`[data-action="quiz:${val}"]`:id==='star'?'[data-action="star"]':'h1');return;
 }
 if(route==='fix'){
  if(id==='diagnose')diagnostic={key:Number(val),at:0};else if(id==='fix-next')diagnostic.at++;else if(id==='fix-prev'){if(diagnostic.at===0)diagnostic=null;else diagnostic.at--;}
  render(false,'h1');return;
 }
 if(route==='sim'){
  if(id==='mode')sim=freshPhone(val);
  if(['sim-home','sim-app'].includes(id))sim=freshPhone(sim.mode,id==='sim-home'?'':val);
  if(id==='sim-wrong')sim.bad=true;
  if(id==='sim-next'){
   const target=flows[sim.key][sim.at][1];
   if(sim.key==='copy'&&target==='copy_action')sim.clipboard='5837';
   if(sim.key==='copy'&&target==='paste')sim.pasted=sim.clipboard;
   sim.at++;sim.bad=false;
  }
  if(id==='digit'){
   if(val==='⌫')sim.digits=sim.digits.slice(0,-1);
   else if(val==='✓'){sim.bad=sim.digits!=='246810';sim.digits='';if(!sim.bad)sim.at++;}
   else if(sim.digits.length<6)sim.digits+=val;
  }
  if(flows[sim.key]&&sim.at>=flows[sim.key].length&&!progress.practiced.includes(sim.key)){progress.practiced.push(sim.key);local();}
  render(false,id==='digit'&&val!=='✓'?`[data-action="digit:${val}"]`:'h1');
 }
});
if(new URLSearchParams(location.search).has('code')&&!location.hash)history.replaceState(null,'','#profile');
routeFromURL();
