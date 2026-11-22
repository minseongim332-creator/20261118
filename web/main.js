import './style.css';
import './brand.css';
import './refinement.css';
import './curriculum.css';
import './onboarding.css';
import logo from '../assets/pon-logo.svg';
import {WelcomeScreen,DeviceSetup} from './onboarding.js';
import heroArt from '../assets/guide.svg';
import {t,tr,h,ico,glyph,goBtn,action,box,note,prefs,progress,local,flows,legacy,checks,names,instruction,speak} from './shared.js';
import {b,line,bottom,brandHome} from './brand.js';
import {deviceFlow,deviceLabel,deviceAdvice,mockVersion} from './device.js';
import {hasForm,practiceForm,validPractice,practiceContext} from './practice.js';
import {courseIndex,courseSummary,isCourse,mountCourse} from './curriculum.js';

const app=document.querySelector('#app');
let route='',topic='',sharedStep=null,diagnostic=null,quizOpen=false,chosen=-1;
const freshPhone=(mode='free',key='')=>({mode,key,at:0,digits:'',bad:false,clipboard:'',pasted:''});
let sim=freshPhone();
let extraModule, mountSequence=0;
const lessonExists=k=>Object.hasOwn(flows,k)||k.startsWith('old:')&&Object.hasOwn(legacy,k.slice(4));
const appKeys=['calls','contacts','sms','camera','gallery','share_photo','internet','wifi','font','login','signup','verify','copy','cert','simple','clock'];
const skin={normal:1,large:1.14,xl:1.3};
const diagnosticTopics=[...checks,
 ['🔔','알림이 오지 않아요','Notifications are missing',['설정에서 ‘알림’을 열고 해당 앱의 알림이 켜져 있는지 확인해 보세요.','방해 금지 또는 집중 모드를 확인해 보세요.'],['Open Notifications in Settings and check whether the app can send notifications.','Check whether Do Not Disturb or a Focus mode is on.']],
 ['🔋','충전이 되지 않아요','The phone is not charging',['충전 케이블과 어댑터가 잘 연결됐는지 확인해 보세요.','휴대폰이 젖었거나 비정상적으로 뜨겁다면 충전을 멈추고 제조사 지원에 문의하세요.'],['Check that the charging cable and adapter are securely connected.','If the phone is wet or unusually hot, stop charging and contact the manufacturer for help.']]];
const safeHome='<span aria-hidden="true">⌂</span> ';
const voice=(str,lang=prefs.lang)=>prefs.voice?`<button type="button" data-speak="${h(str)}" data-voice-lang="${h(lang)}"><span aria-hidden="true">🔊</span> ${h(t('listen'))}</button><p class="notice warn" id="voice-status" role="status"></p>`:'';
const bar=()=>`<nav class="toolbar" aria-label="${h(t('home'))}">${goBtn('home',safeHome+h(t('home')))}${!['help','family','profile'].includes(route)?goBtn('help','♡ '+h(t('help'))):''}</nav>`;
const titleFor=k=>k.startsWith('old:')?legacy[k.slice(4)]?.title:t(k);
const options=(items,selected,labels=t)=>items.map(k=>`<option value="${h(k)}" ${selected===k?'selected':''}>${h(labels(k))}</option>`).join('');

const deviceName=k=>k==='Unknown'?b('unknown'):k==='Galaxy'?'Galaxy':'iPhone';
const stepsFor=k=>deviceFlow(k,flows);
const describe=step=>instruction(step,deviceLabel);
const deviceOptions=()=>['Galaxy','iPhone','Unknown'].map(k=>action('device:'+k,h(deviceName(k)),'',`aria-pressed="${prefs.devicePicked&&prefs.device===k}"`)).join('');
function home(){return brandHome(courseSummary());}
function learn(){
 const old=topic.startsWith('old:'),name=old?topic.slice(4):topic,data=legacy[name],steps=old?data?.steps:stepsFor(topic);
 if(!lessonExists(topic))return catalogue('catalog');
 const values=old?progress.legacySteps:progress.steps,idx=Math.max(0,Math.min(sharedStep??(Number(values[name])||0),steps.length-1));
 const str=old?steps[idx]:describe(steps[idx]),symbol=old?'📚':steps[idx][2];
 const stars=old?progress.legacyFavorites:progress.favorites;
 const lead=old?`<p class="muted">${prefs.lang==='ko'?h(data.desc):'This original lesson is in Korean.'}</p>`:({copy:'copy_def',verify:'verify_safe'}[name]?`<p class="muted">${h(t({copy:'copy_def',verify:'verify_safe'}[name]))}</p>`:['wifi','font'].includes(name)&&prefs.device==='Unknown'?`<div class="onboard"><p>${h(t('device'))}</p><div class="device-choices">${deviceOptions()}</div></div>`:'');
 let quiz=data?.quiz&&old?data.quiz:null;
 if(!old){const q=steps[Math.min(1,steps.length-1)],opts=[q[1],q[1]==='hang'?'sample_msg':'hang'];if(name.length%2)opts.reverse();quiz={question:describe(q),options:opts.map(deviceLabel),answer:opts.indexOf(q[1]),feedback:describe(q)};}
 return box(titleFor(topic),`${!old&&isCourse(topic)?`<div class="row">${goBtn('course/'+topic,h(tr('새 실습으로 배우기','Open the new practice')),'primary')}</div>`:''}${lead}<p class="steps" aria-live="polite">${h(t('step'))} ${idx+1} / ${steps.length}</p><progress value="${idx+1}" max="${steps.length}" aria-label="${h(t('step'))}"></progress>
  ${old?'':practiceContext(name)}<div class="lesson-layout"><div><div class="step" ${old?'lang="ko"':''}><span aria-hidden="true">${symbol}</span><h2>${h(str)}</h2></div>${voice(str,old?'ko':prefs.lang)}</div></div>
 <div class="two">${action('prev',h(t('previous')),'',idx===0?'disabled':'')}${action(idx<steps.length-1?'next':'complete',h(t(idx<steps.length-1?'next':'finish')),'primary')}</div>
  <div class="row">${action('star',(stars.includes(name)?'★ ':'☆ ')+h(t('favorites')),'',`aria-pressed="${stars.includes(name)}"`)}${!old&&appKeys.includes(name)?goBtn('sim/'+name,h(t('practice'))):''}${goBtn(!old?'help/'+name+'/'+(idx+1):'help',h(t('help')))}${old?action('reset',h(tr('처음부터 다시 보기','Restart this lesson'))):''}</div>
 ${quiz?`<details id="quiz" ${quizOpen?'open':''}><summary>${h(t('quiz'))}</summary><p>${h(quiz.question)}</p><div class="list">${quiz.options.map((o,i)=>action('quiz:'+i,h(o))).join('')}</div>${chosen>=0?note(chosen===quiz.answer?t('done')+' '+quiz.feedback:t('retry'),chosen===quiz.answer?'good':'warn'):''}</details>`:''}
 ${name==='safe'?`<details><summary>${h(t('contacts_kr'))}</summary><p>${h(t('independent'))}</p><div class="row"><a class="button" href="https://www.fsc.go.kr/no040102?cnId=913&amp;curPage=1" target="_blank" rel="noopener">${h(t('police'))} · 112</a><a class="button" href="https://www.fss.or.kr/fss/main/contents.do?menuNo=201178" target="_blank" rel="noopener">${h(t('fss'))} · 1332</a></div></details>`:''}`);
}
function catalogue(kind){
 const rows=kind==='catalog'?Object.keys(flows):kind==='resume'?[...new Set([progress.recent,...Object.keys(progress.completed),...Object.keys(progress.legacyCompleted).map(k=>'old:'+k)])].filter(k=>flows[k]||k.startsWith('old:')&&legacy[k.slice(4)]):[...progress.favorites,...progress.legacyFavorites.map(k=>'old:'+k)];
 const list=rows.filter(k=>flows[k]||k.startsWith('old:')&&legacy[k.slice(4)]);
 return box(t(kind),`${list.length?`<div class="list">${list.map(k=>goBtn('learn/'+k+(isCourse(k)?'/guide':''),`${progress.completed[k]||k.startsWith('old:')&&progress.legacyCompleted[k.slice(4)]?'✓ ':glyph(k)+' '}${h(titleFor(k))}`)).join('')}</div>`:note(t('empty'))}
 ${kind==='catalog'?`<details><summary>${h(t('legacy'))}</summary><label class="field">${h(tr('기존 학습 검색','Search original lessons'))}<input id="legacy-search" type="search" placeholder="${h(tr('예: 와이파이…','Example: Wi-Fi…'))}"></label><div class="list" id="legacy-list">${Object.keys(legacy).map(k=>goBtn('learn/old:'+k,h(legacy[k].title))).join('')}</div></details>`:''}<div class="row">${goBtn('backup',h(t('legacy')))}</div>`);
}
function settings(){
 return box(t('settings'),`<div class="panel"><label class="field">${h(t('device'))}<select name="device" data-pref>${options(['Galaxy','iPhone','Unknown'],prefs.device,deviceName)}</select></label><details><summary>${h(b('unknown'))}</summary><p>${h(tr('갤럭시는 설정 → 휴대전화 정보, 아이폰은 설정 → 일반 → 정보에서 모델을 확인할 수 있어요.','On Galaxy open Settings → About phone. On iPhone open Settings → General → About.'))}</p></details><label class="field">${h(b('model'))}<input name="model" maxlength="40" autocomplete="off" data-pref value="${h(prefs.model)}"></label><label class="field">${h(b('os'))}<input name="os" maxlength="24" autocomplete="off" data-pref value="${h(prefs.os)}"></label><label class="field">${h(t('font'))}<select name="size" data-pref>${options(Object.keys(skin),prefs.size)}</select></label><label class="check"><input type="checkbox" name="contrast" data-pref ${prefs.contrast?'checked':''}> ${h(b('contrast'))}</label><label class="check"><input type="checkbox" name="voice" data-pref ${prefs.voice?'checked':''}> ${h(t('voice'))}</label><label class="field">${h(t('speed'))}<select name="speed" data-pref>${options(['0.75','0.9','1'],String(prefs.speed),k=>k+'×')}</select></label></div>${goBtn('backup',h(t('legacy')))}`);
}
function fix(){
 if(diagnostic===null)return box(t('fix'),`<p>${h(t('problem_choice'))}</p>${prefs.lang!=='ko'&&prefs.lang!=='en'?note(b('languageLimit')):''}<div class="list">${diagnosticTopics.map(([icon,ko,en],i)=>action('diagnose:'+i,icon+' '+h(tr(ko,en)))).join('')}</div>`);
 const [icon,k,e,ks,es]=diagnosticTopics[diagnostic.key],p=diagnostic.at,str=tr(ks[p],es[p]);
 const advice=deviceAdvice(diagnostic.key);
 return box(tr(k,e),`<p class="steps">${h(t('step'))} ${p+1} / ${ks.length}</p><div class="step"><span aria-hidden="true">${icon}</span><h2>${h(str)}</h2></div>${voice(str,tr('ko','en'))}${advice?note(prefs.device+' · '+advice):''}<div class="row">${action('fix-prev',h(t('previous')))}${action('fix-next',h(t('next')),'',p+1===ks.length?'disabled':'')}${goBtn('help',h(t('help')))}${goBtn('home',h(t('fixed')),'primary')}</div>`);
}
function policy(){
 return box(tr('개인정보·이용 안내','Privacy & use'),`<div class="panel"><h2>${h(tr('이 브라우저에 남는 것','What stays in this browser'))}</h2><p>${h(tr('언어·접근성 설정과 학습 기록은 이 브라우저에 저장해요. 가족에게 자동으로 보내지 않아요. 브라우저 데이터를 지우면 기록과 가족 연결을 잃을 수 있어요. CSV 백업은 암호화되지 않아요.','Settings and learning progress stay in this browser and are not shared automatically. Clearing browser data may remove records and family access. CSV backups are not encrypted.'))}</p><h2>${h(b('family'))}</h2><p>${h(tr('가족 연결을 설정한 경우, 승인된 가족만 공간의 대화와 사진을 볼 수 있어요. 새로 승인된 가족도 이전 대화를 볼 수 있어요. 내 기기 연결을 끊어도 보낸 글은 남아요. 보낸 글을 직접 지우거나 관리자가 가족 공간을 삭제하면 대화 목록에서 없어져요. 종단간 암호화는 제공하지 않아요.','When enabled, only approved family members can see messages and photos, including earlier ones. Disconnecting a device does not delete its messages. Delete your message or have an admin delete the space to remove it from the conversation. This is not end-to-end encrypted.'))}</p><p>${h(tr('번역을 허용한 글만 받는 사람이 눌러 번역할 수 있어요. 지원 브라우저에서만 기기 번역을 시도하고 원문은 그대로 남아요. 앱을 닫은 동안 푸시 알림은 보내지 않아요.','Recipients can request translation only on messages whose author allowed it. Translation uses supported browsers’ on-device feature and leaves the original visible. There are no push notifications while the app is closed.'))}</p><h2>${h(t('safe'))}</h2><p>${h(t('privacy'))} ${h(tr('가상 실습은 실제 전화·문자·인증·금융 거래를 하지 않아요.','Practice never makes real calls, sends texts, verifies identity or moves money.'))}</p></div>`);
}
function phone(){
 const {key,mode,at,digits,bad,pasted}=sim,flow=stepsFor(key);let body='';
 if(!key){const apps=mode==='review'?progress.practiced:appKeys;body=`<h2>${h(t('sim'))}</h2><p class="muted">${h(t('free_hint'))}</p>${!apps.length?note(t('empty')):`<div class="two app-launchers">${apps.map(k=>action('sim-app:'+k,`<span aria-hidden="true">${k==='clock'?'🕒':glyph(k)}</span><span>${h(t(k))}</span>`)).join('')}</div>`}`;}
 else if(key==='clock')body=`<h2>🕒 ${h(t('clock'))}</h2><p class="value">${h(new Intl.DateTimeFormat(prefs.lang,{hour:'2-digit',minute:'2-digit'}).format(new Date()))}</p>`;
 else if(!flow||at>=flow.length)body=`${note('✓ '+t('done'),'good')}${action('sim-app:'+key,'↻ '+h(t('practice')),'wide')}`;
 else if(hasForm(key))body=practiceForm(key);
 else{
  const [,target,emoji]=flow[at];const code=key==='verify',copy=key==='copy';
  body=`<h2>${code&&[2,3].includes(at)?'💬 '+h(t('sms')):emoji+' '+h(t(key))}</h2>${bad?note(t('retry'),'warn'):''}`;
  if(code&&[2,3].includes(at))body+='<p class="value">246810</p>';
  if(code&&target==='code_input')body+=`<div class="value" role="status">${digits||'— — — — — —'}</div><div class="num">${[1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].map(n=>action('digit:'+n,h(n),'',n==='⌫'?`aria-label="${h(tr('한 자리 지우기','Delete one digit'))}"`:n==='✓'?`aria-label="${h(t('confirm'))}"`:'')).join('')}</div>`;
  else{
    if(copy&&at===0)body+=`<label class="field">${h(t('select'))}<input id="copy-sample" readonly value="5837" inputmode="none" autocomplete="off" spellcheck="false"></label>`;
   if(copy&&at>=2)body+=`<p class="value" role="status">${h(pasted||'▭')}</p>`;
   if(['gallery','camera'].includes(key)&&target==='sample_pic')body+=`<img src="${heroArt}" alt="${h(t('sample_pic'))}" width="220" height="125">`;
   if(target==='show'||key==='login'&&at===3)body+=`<p class="value">${target==='show'?'••••••••':'Sample#1'}</p>`;
   if(['sample_id','sample_num'].includes(target))body+=`<p class="value">${target==='sample_id'?'practice-user':'000-0000-0000'}</p>`;
    body+=action('sim-next',h(deviceLabel(target)),'wide primary')+`<div class="row">${action('sim-wrong',h(t(target==='settings'?'clock':'settings')),'wide')}</div>`;
  }
 }
 return box(t('sim'),`<p class="muted">${h(t('demo'))}</p><div class="row">${goBtn(isCourse(key)?'course/'+key:'courses',h(tr('새 실습 과정 열기','Open the new practice courses')),'primary')}</div><div class="device-choices">${deviceOptions()}</div>${mockVersion()?`<p class="muted">${h(mockVersion())} · ${h(deviceLabel('sample'))}</p>`:''}<div class="row">${['free','mission','review'].map(m=>action('mode:'+m,h(t(m)),'',`aria-pressed="${m===mode}"`)).join('')}</div>
  ${flow&&at<flow.length&&!hasForm(key)?`<p class="steps">${h(t('step'))} ${at+1} / ${flow.length}</p><p>${h(describe(flow[at]))}</p>${voice(describe(flow[at]))}`:''}
  <div class="phone ${prefs.device==='iPhone'?'iphone':prefs.device==='Galaxy'?'galaxy':''}"><div class="phone-status"><span>9:41</span><span aria-hidden="true">▮▮▮ &nbsp; ◓ &nbsp; ▰</span></div>${body}${key?`<div class="row">${action('sim-home',safeHome+h(t('home')),'wide')}</div>`:''}</div>`);
}
function routeFromURL(){
 let val=location.hash.slice(1)||'welcome';
 if(val==='main')val=route||'home';
 if(val==='safe')val='learn/safe';
 const oldEntry=/^learn\/([^/]+)$/.exec(val);
 if(oldEntry&&isCourse(oldEntry[1])){
  val='course/'+oldEntry[1];
  history.replaceState(history.state,'','#'+val);
 }
 const [next,key='',step='']=val.split('/');
 const target=next==='course'&&!isCourse(key)?'courses':['welcome','home','setup','course','courses','learn','catalog','fix','resume','favorites','settings','sim','backup','family','chat','help','notifications','profile','policy','legacy-family'].includes(next)?next:'welcome';
 if(route!==target||topic!==key){quizOpen=false;chosen=-1;if(target==='fix')diagnostic=null;if(target==='sim')sim=freshPhone(sim.mode,appKeys.includes(key)?key:'');}
 route=target;topic=key;sharedStep=route==='learn'&&/^(?:[1-9]|1[0-9]|20)$/.test(step)?Number(step)-1:null;
 if(route==='learn'&&sharedStep===null&&lessonExists(topic)){progress.recent=topic;local();}
 render(true);
}
export function go(to){if((location.hash.slice(1)||'welcome')===to){routeFromURL();return;}location.hash=to;}
function render(moveFocus=false,focusSelector=''){
 const sequence=++mountSequence,extended=['backup','family','chat','help','notifications','profile','legacy-family'].includes(route);
 document.documentElement.lang=prefs.lang==='tl'?'fil':prefs.lang;
 document.documentElement.style.setProperty('--scale',skin[prefs.size]||1);
 document.documentElement.dataset.contrast=String(prefs.contrast);
 document.title='폰잘알 | PONJALAL';document.querySelector('#skip').textContent=tr('본문으로 바로 가기','Skip to main content');
 const html=route==='welcome'?WelcomeScreen():route==='home'?home():route==='setup'?DeviceSetup():route==='courses'?courseIndex():route==='course'?'<div id="active-course"></div>':route==='learn'?learn():route==='sim'?phone():route==='settings'?settings():route==='fix'?fix():route==='policy'?policy():extended?`<div id="interactive">${box(route==='family'?b('family'):route==='notifications'?b('notice'):t(route==='backup'?'legacy':route==='chat'||route==='legacy-family'?'family':route),note(tr('불러오는 중…','Loading…')))}</div>`:catalogue(route);
 app.innerHTML=`<div class="wrap"><header><a href="#welcome" class="brand" translate="no"><img src="${logo}" alt="" width="48" height="48"><span><strong>폰잘알</strong><small>PONJALAL</small></span></a><div class="header-actions"><label class="lang"><span aria-hidden="true">🌐</span><select name="lang" aria-label="Language / 언어" data-pref>${options(Object.keys(names),prefs.lang,k=>names[k])}</select></label><a class="button" href="#notifications" data-go="notifications" aria-label="${h(b('notice'))}" title="${h(b('notice'))}">${line('bell',20)}</a><a class="button" href="#settings" data-go="settings" aria-label="${h(t('settings'))}" title="${h(t('settings'))}">${line('gear',20)}</a></div></header><main id="main" tabindex="-1">${['home','welcome','setup'].includes(route)?'':bar()}${html}</main><footer><div class="row">${prefs.voice?action('read-screen',h(b('read'))):''}<p class="notice warn" id="screen-voice" role="status"></p>${goBtn('policy',h(tr('개인정보·이용 안내','Privacy & terms')))}</div>폰잘알 · ${h(t('brand_d'))}</footer>${route==='welcome'?'':bottom(route)}</div>`;
 if(route==='course')mountCourse(app.querySelector('#active-course'),topic);
 if(moveFocus){window.scrollTo(0,0);if(route!=='home'&&(route!=='welcome'||location.hash))app.querySelector('h1')?.focus({preventScroll:true});}
 if(focusSelector)app.querySelector(focusSelector)?.focus({preventScroll:true});
  if(extended){const type=route;extraModule??=import('./connections.js');extraModule.then(async m=>{if(sequence!==mountSequence)return;const node=app.querySelector('#interactive');const focus=moveFocus&&node.contains(document.activeElement);await m.mount(node,type,go);if(focus&&node.isConnected&&document.activeElement===document.body)node.querySelector('h1')?.focus();}).catch(()=>{if(sequence===mountSequence)document.querySelector('#interactive').innerHTML=note(tr('화면을 열지 못했어요. 새로고침해 주세요.','Could not open this page. Reload to try again.'),'warn');});}else if(extraModule){extraModule.then(m=>{if(sequence===mountSequence)m.unmount();}).catch(()=>{});}
}
window.addEventListener('hashchange',()=>{window.speechSynthesis?.cancel();routeFromURL();});
window.addEventListener('guide:recover',()=>{if(route==='profile')render();});
window.addEventListener('pon:prefs',routeFromURL);
document.querySelector('#skip').addEventListener('click',e=>{e.preventDefault();document.querySelector('#main').focus();});
app.addEventListener('input',e=>{if(e.target.id==='legacy-search'){const key=e.target.value.trim().toLowerCase();app.querySelectorAll('#legacy-list a').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(key));}});
app.addEventListener('change',e=>{
 if(e.target.matches('[data-demo-show]')){app.querySelectorAll('#practice-fields input[name=pw],#practice-fields input[name=repeat]').forEach(input=>input.type=e.target.checked?'text':'password');return;}
 const item=e.target;if(!item.matches('[data-pref]'))return;
 prefs[item.name]=item.type==='checkbox'?item.checked:item.value;local();
 if(item.name==='device'){prefs.devicePicked=true;local();}
 if(item.name==='lang'){const url=new URL(location.href);url.searchParams.set('lang',prefs.lang);history.replaceState(null,'',url);}
  if(!['model','os'].includes(item.name))render(false,`[name="${item.name}"]`);
});
app.addEventListener('submit',e=>{
 if(e.target.id!=='practice-fields')return;e.preventDefault();
 if(!validPractice(sim.key,new FormData(e.target))){e.target.querySelector('#practice-feedback').textContent=tr('위 예시와 똑같이 입력했는지 확인해 주세요. 입력한 값은 전송되지 않아요.','Check that the values match the examples exactly. Nothing was sent.');return;}
 sim.at=stepsFor(sim.key).length;if(!progress.practiced.includes(sim.key))progress.practiced.push(sim.key);local();render(false,'h1');
});
app.addEventListener('click',e=>{
 const link=e.target.closest('a[data-go]');
 if(link&&e.button===0&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();go(link.dataset.go);return;}
 const btn=e.target.closest('button');if(!btn||btn.disabled)return;
 if(route==='courses'&&/^jump:[0-3]$/.test(btn.dataset.course||'')){app.querySelector(`#course-group-${btn.dataset.course.slice(-1)} h2`)?.focus();return;}
 if(btn.dataset.speak){app.querySelector('#voice-status').textContent=speak(btn.dataset.speak,btn.dataset.voiceLang)?'':t('no_voice');return;}
 const [id,val]=String(btn.dataset.action||'').split(':');if(!id)return;
 if(id==='read-screen'){const main=app.querySelector('main');const voice=[...main.querySelectorAll('h1,h2,p,label,button:not([data-speak]),a:not([data-go=home])')].filter(x=>x.getClientRects().length).map(x=>x.innerText.trim()).filter(Boolean).join('. ').slice(0,1100);app.querySelector('#screen-voice').textContent=speak(voice)?'':t('no_voice');return;}
 if(id==='device'){if(route==='sim'&&prefs.device!==val)sim=freshPhone(sim.mode,sim.key);prefs.device=val;prefs.devicePicked=true;local();if(route==='setup'){go('home');return;}render(false,'h1');return;}
 if(route==='learn'){
  if(!lessonExists(topic))return;
  const old=topic.startsWith('old:'),k=old?topic.slice(4):topic,steps=old?progress.legacySteps:progress.steps;
  const list=old?progress.legacyFavorites:progress.favorites,done=old?progress.legacyCompleted:progress.completed;
   if(sharedStep!==null&&['prev','next'].includes(id)){const n=Math.max(0,Math.min(sharedStep+(id==='next'?1:-1),(old?legacy[k].steps:stepsFor(k)).length-1));go('learn/'+topic+'/'+(n+1));return;}
   if(id==='prev')steps[k]=Math.max(0,(steps[k]||0)-1);
   if(id==='next')steps[k]=Math.min((steps[k]||0)+1,(old?legacy[k].steps:stepsFor(k)).length-1);
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
    const target=stepsFor(sim.key)[sim.at][1];
    if(sim.key==='copy'&&target==='select'){const input=app.querySelector('#copy-sample');if(input.selectionStart!==0||input.selectionEnd!==input.value.length){let status=app.querySelector('#copy-status');if(!status){input.parentElement.insertAdjacentHTML('afterend','<p id="copy-status" class="notice warn" role="status"></p>');status=app.querySelector('#copy-status');}status.textContent=tr('예시 숫자를 길게 눌러 전체를 선택해 보세요. 키보드에서는 Ctrl+A 또는 ⌘A를 사용할 수 있어요.','Press and hold the sample number to select all of it. With a keyboard, use Ctrl+A or ⌘A.');input.focus();return;}}
   if(sim.key==='copy'&&target==='copy_action')sim.clipboard='5837';
   if(sim.key==='copy'&&target==='paste')sim.pasted=sim.clipboard;
   sim.at++;sim.bad=false;
   }
  if(id==='digit'){
   if(val==='⌫')sim.digits=sim.digits.slice(0,-1);
    else if(val==='✓'){sim.bad=sim.digits!=='246810';sim.digits='';if(!sim.bad)sim.at++;}
   else if(sim.digits.length<6)sim.digits+=val;
  }
   if(stepsFor(sim.key)&&sim.at>=stepsFor(sim.key).length&&!progress.practiced.includes(sim.key)){progress.practiced.push(sim.key);local();}
  render(false,id==='digit'&&val!=='✓'?`[data-action="digit:${val}"]`:'h1');
 }
});
if(new URLSearchParams(location.search).has('code')&&!location.hash)history.replaceState(null,'','#profile');
routeFromURL();
