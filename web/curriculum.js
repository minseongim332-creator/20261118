import {t,tr,h,goBtn,prefs,speak} from './shared.js';
import {courses,categories,taskScenario} from './curriculum-data.js';
import {b,line} from './brand.js';
import {OfficialScreenshot} from './official-screens.js';
import sceneArt from '../assets/welcome-family.webp';
import {simulatorProfile,SimulatorKeyboard} from './simulator-profiles.js';

// Retain the numbers used by earlier browser records and CSV backups.
export const lessonState=Object.freeze({INTRODUCTION:0,CONCEPT:5,VISUAL_GUIDE:1,GUIDED_PRACTICE:2,INDEPENDENT_PRACTICE:3,ASSESSMENT:6,COMPLETED:4});
const phases={0:['생활 속 상황','Everyday situation'],5:['개념 이해','Concept'],1:['화면 안내','Screen guide'],2:['따라 하기','Guided practice'],3:['혼자 해보기','Independent practice'],6:['실습 확인','Assessment'],4:['학습 결과','Results']};

const key='ponjalal.courses.v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(key))||{};}catch{}
export const courseBackup=()=>structuredClone(saved);
export function mergeCourseBackup(incoming){
 if(!incoming||typeof incoming!=='object')return;
 for(const id of Object.keys(courses)){
  const record=incoming[id],previous=get(id),n=courses[id].tasks.length;
  if(!record||!Number.isInteger(record.phase)||!Object.hasOwn(phases,record.phase)||!Number.isInteger(record.index)||record.index<0||record.index>=n||!Number.isFinite(record.time)||record.time<=0||record.phase===4&&record.done!==true)continue;
  const missed=Array.isArray(record.missed)?[...new Set(record.missed.filter(i=>Number.isInteger(i)&&i>=0&&i<n))]:[];
  if(record.time>=(previous.time||0))put(id,{phase:record.phase,index:record.index,time:record.time,missed,done:previous.done===true||record.done===true});
  else if(record.done===true&&!previous.done)put(id,{...previous,done:true});
 }
}
const tx=p=>tr(...p), esc=p=>h(tx(p));
const text=(ko,en)=>h(tr(ko,en));
const languageNotice=()=>!['ko','en'].includes(prefs.lang)?`<p class="course-language">${h(b('languageLimit'))}</p>`:'';
const phaseOrder=Object.values(lessonState);
const get=id=>saved[id]||{phase:0,index:0,missed:[]};
const put=(id,s)=>{saved[id]=s;try{localStorage.setItem(key,JSON.stringify(saved));return true;}catch{return false;}};
const btn=(id,label,cls='')=>`<button type="button" class="${cls}" data-course="${id}">${label}</button>`;
const primary=(id,ko,en)=>btn(id,text(ko,en),'primary');
export const isCourse=id=>Object.hasOwn(courses,id);
export const courseName=id=>isCourse(id)?tx(courses[id].title):'';
export function courseSummary(){
 const list=Object.keys(courses),done=list.filter(id=>get(id).done).length;
 const active=list.filter(id=>!get(id).done&&get(id).time).sort((a,b)=>get(b).time-get(a).time)[0];
 const recent=active||list.filter(id=>get(id).time).sort((a,b)=>get(b).time-get(a).time)[0];
 return `<section class="course-summary"><div><h2>${text('내 실습 진도','My practice progress')}</h2><p>${text('완료한 과정','Courses completed')} <strong>${done} / ${list.length}</strong></p><progress value="${done}" max="${list.length}" aria-label="${text('완료한 과정','Courses completed')}"></progress></div><div class="row">${recent?goBtn('course/'+recent,h(courseName(recent))+' · '+text(active?'이어서 하기':'다시 보기',active?'Resume':'Review'),'primary'):goBtn('courses',text('첫 과정 고르기','Choose your first course'),'primary')}</div></section>`;
}
export function courseIndex(){return `<section class="course-index"><h1 tabindex="-1">${text('스마트폰 배우기','Learn to use your phone')}</h1><p>${text('한 가지씩 배우고, 직접 해보고, 혼자서 마무리해요.','Learn one skill at a time, try it, then finish on your own.')}</p>${courseSummary()}<nav class="course-jump" aria-label="${text('교육 분야','Course categories')}">${categories.map((c,i)=>btn('jump:'+i,esc(c))).join('')}</nav>${categories.map((c,i)=>`<section class="course-group" id="course-group-${i}"><h2 tabindex="-1">${esc(c)}</h2><ul>${Object.entries(courses).filter(([,v])=>v.category===i).map(([id,v])=>{const st=get(id);return `<li>${goBtn('course/'+id,`<span>${esc(v.title)}</span><small>${st.done?text('완료','Completed'):st.time?text('진행 중','In progress'):''}</small>${line('arrow',18)}`,'course-index-link')}</li>`;}).join('')}</ul></section>`).join('')}<div class="row">${goBtn('catalog',text('기존 학습과 다른 주제','Original lessons and more'))}${goBtn('fix',h(t('fix')))}</div></section>`;}
const smsName=()=>prefs.device==='Galaxy'?tr('삼성 메시지','Samsung Messages'):tr('메시지','Messages');
const platform=()=>prefs.device==='Galaxy'?'Samsung Galaxy · One UI':'Apple iPhone · iOS';
const targetText=(task,variant)=>task.fields?task.fields.map(f=>`${tx(f.label)}: ${f.values[variant]}`).join('\n'):task.options?tx(task.options[task.target[variant]]):task.note?task.values[variant]:'';
function phone(title,body){const profile=simulatorProfile(prefs.device);return `<figure class="course-figure"><div class="course-phone course-exercise ${profile.className}"><div class="course-appbar"><h3 id="mock-title" tabindex="-1">${h(title)}</h3></div><div class="course-app-body">${body}</div></div><figcaption>${h(platform())} · ${text('실습용 양식 · 실제 기기 화면이 아니에요','Practice controls · not a device screenshot')}</figcaption></figure>`;}
const taskLabel=(task)=>tx(task.deviceTitle?.[prefs.device]??task.title);
const submitLabel=()=>text('입력 확인','Check entries');
const inboxInstruction=(task)=>task.note?tx(task.title):smsName();
const fileMenu=()=>prefs.device==='Galaxy'?[['갤러리','Gallery'],['내 파일','My Files']]:[['사진 보관함','Photo Library'],['파일','Files']];
const qrIcon=`<svg aria-hidden="true" viewBox="0 0 72 72" width="100" height="100" fill="currentColor"><path fill-rule="evenodd" d="M4 4h24v24H4zm4 4v16h16V8zm36-4h24v24H44zm4 4v16h16V8zM4 44h24v24H4zm4 4v16h16V48z"/><path d="M12 12h8v8h-8zm40 0h8v8h-8zM12 52h8v8h-8zM32 12h6v20h-6zM8 34h22v5H8zm33 0h9v14h-9zm16-2h11v7H57zm-25 9h6v12h-6zm26 6h7v15h-7zm-20 7h15v6H38zm-6 9h7v5h-7zm15 1h8v5h-8z"/></svg>`;

export function LessonEngine(node,id){
 const course=courses[id];if(!course)return;
 node.insertAdjacentHTML('beforebegin',languageNotice());
 node.lang=prefs.lang==='ko'?'ko':'en';
 const known=get(id);let state={phase:0,index:0,missed:[],...known};
 let transient={}, shown=0,canStore=true;
 const draw=()=>{node.innerHTML=view();const image=node.querySelector('[data-official-image]');if(image){const unavailable=()=>{image.parentElement.hidden=true;node.querySelector('[data-official-error]').hidden=false;};image.addEventListener('error',unavailable,{once:true});if(image.complete&&!image.naturalWidth)unavailable();}};
 const redraw=(focus='#course-stage')=>{draw();node.querySelector(focus)?.focus();};
 const commit=()=>{state.time=Date.now();canStore=put(id,{...state,missed:[...state.missed]});};
 const move=(phase,index=0)=>{state.phase=phase;state.index=index;transient={};commit();redraw();};
 const current=()=>course.tasks[state.index];
 const fail=(message,field)=>{if(!state.missed.includes(state.index)){state.missed.push(state.index);commit();}node.querySelector('#course-status').textContent=state.phase===3?tr('아직 과제와 맞지 않아요. 다시 시도해 보세요. 복습할 부분은 결과에서 알려드려요.','This does not match the task yet. Try again. Your results will show what to review.'):message;if(field){field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby','course-status');field.focus();}};
 const pass=()=>{if(state.index+1<course.tasks.length){move(state.phase,state.index+1);return;}move(state.phase===2?3:6);};
 const tell=(label,body)=>`<section class="course-explain"><h3>${label}</h3><p>${body}</p></section>`;
 const hintPanel=(task,variant)=>{
  const scenario=taskScenario(id,state.index,variant), sample=task.kind==='form'?targetText(task,variant):'';
  return `<section class="course-explain"><h3>${text('이번에 할 일','Your task')}</h3><p>${scenario?esc(scenario):esc(task.title)}</p>${sample?`<p class="course-sample" translate="no">${h(sample)}</p>`:''}${!scenario&&task.options&&task.target?`<p>${h(targetText(task,variant))}</p>`:''}${state.phase===2?`<p>${esc(task.tip)}</p>`:''}</section>`;
 };
 const options=(task,items=task.options.map((o,i)=>[o,i]))=>`<div class="course-controls">${items.map(([o,i])=>btn('pick:'+i,esc(o))).join('')}</div>`;
 const errorElement=()=>`<p id="course-status" role="status" class="course-error"></p>`;
 const codeFor=(task,variant)=>{const original=task.values[variant];return transient.retry&&/^\d+$/.test(original)?String((Number(original)+transient.retry*173)%10**original.length).padStart(original.length,'0'):original;};
 function practiceBody(task,variant){
  const launcher=state.index===0&&!transient.launched;
  const title=launcher?tr('연습 휴대폰 홈','Practice phone home'):(task.kind==='sms'||task.kind==='copy')&&!task.note?(transient.opened&&!transient.returned?inboxInstruction(task):tr('가상 번호 확인','Sample code check')):taskLabel(task);
  return phone(title,interactive(task,variant)+errorElement()+(!launcher&&state.index===0?btn('sim-home',esc(prefs.device==='Galaxy'?['휴대폰 홈으로','Phone home']:['홈 화면','Home screen']),'course-phone-home'):''));
 }
 function interactive(task,variant){
  if(state.index===0&&!transient.launched)return `<div class="course-launchers">${btn('launch',`<span aria-hidden="true">${line('help',26)}</span>${text('연습 앱','Practice app')}`)}${btn('wrong-app',`<span aria-hidden="true">${line('gear',26)}</span>${text('설정','Settings')}`)}</div>`;
  if(task.kind==='form')return `<form id="course-form" autocomplete="off" novalidate><div class="course-controls">${task.fields.map((f,i)=>`<label class="field">${esc(f.label)}<input type="${f.type}" id="answer-${i}" maxlength="40" autocomplete="off" spellcheck="false" autocapitalize="none" ${f.type==='password'?'data-course-password':''}></label>`).join('')}${task.fields.some(f=>f.type==='password')?`<label class="check"><input type="checkbox" data-course-show> ${h(t('show'))}</label>`:''}${task.options?.map((o,i)=>`<label class="check"><input type="checkbox" id="term-${i}"> ${esc(o)}</label>`).join('')??''}<button class="primary" type="submit">${submitLabel()}</button></div></form>`;
  if(task.kind==='range')return `<form id="course-form"><label class="field">${esc(task.title)}<input id="course-range" type="range" min="0" max="2" value="0" aria-valuetext="${text('기본','Default')}"></label><p class="range-preview">${text('이 문장이 읽기 편한가요?','Is this sentence easy to read?')}</p><button class="primary" type="submit">${text('이 크기 적용','Apply text size')}</button></form>`;
  if(task.kind==='select')return options(task);
  if(task.kind==='qr')return transient.scanned?options(task):`<div class="qr-aperture">${qrIcon}</div>${primary('scan','예시 코드 비추기','Align with the sample code')}`;
  if(task.kind==='attach')return transient.attached!==undefined?`<div class="course-sample">${esc(task.options[transient.attached])}</div>${primary('confirm-attachment','첨부 목록 확인','Confirm attachment')}${btn('remove-attachment',text('첨부 제거','Remove attachment'))}`:transient.picker===undefined?`<div class="course-controls">${fileMenu().map((x,i)=>btn('picker:'+i,esc(x))).join('')}</div>`:`${options(task,task.options.map((o,i)=>[o,i]).filter(([,i])=>transient.picker===0?i===0:i!==0))}${btn('back-picker',text('다른 위치 보기','Look in another location'))}`;
  const copy=task.kind==='copy',code=codeFor(task,variant),galaxy=prefs.device==='Galaxy';
  if(!task.note&&!transient.requested)return primary('request','예시 문자 요청','Request a demo text');
  if(task.note&&!transient.returned||transient.opened&&!transient.returned){
   return copy?`<label class="field">${task.note?text('예시 장소','Demo place'):text('예시 문자 내용','Demo text')}<input readonly id="course-copy-source" value="${h(code)}" inputmode="none" autocomplete="off" translate="no"></label><details class="sim-selection"><summary>${esc(simulatorProfile(prefs.device).menu)}</summary><div class="sim-menu-buttons">${galaxy?btn('select-all',text('전체 선택','Select all'))+btn('copy-value',h(t('copy_action'))):btn('copy-value',h(t('copy_action')))+btn('select-all',text('전체 선택','Select all'))}</div></details>${primary('return',task.note?'검색 화면 열기':'원래 화면으로 돌아가기',task.note?'Open the search screen':'Return to the original screen')}`:`<p class="course-sample" translate="no">${h(code)}</p>${primary('return','번호를 확인했어요 · 돌아가기','I checked the code · go back')}`;
  }
  if(!transient.returned)return `<div class="course-controls">${primary('open-inbox','가장 최근 예시 문자 열기','Open newest demo text')}${btn('old-inbox',text('이전 문자 열기','Open an older text'))}</div>`;
  return `<form id="course-form" autocomplete="off" novalidate><div class="course-controls"><label class="field">${task.note?text('연습 검색창','Sample search box'):text('예시 인증번호','Demo code')}<input id="course-code" value="${h(transient.draft||'')}" ${task.note?'':'inputmode="numeric"'} maxlength="25" autocomplete="off" spellcheck="false" ${copy?'readonly':''}></label>${copy?btn('paste-value',h(t('paste'))):SimulatorKeyboard(prefs.device)}<button class="primary" type="submit">${submitLabel()}</button>${btn('check-message',task.note?text('메모 다시 열기','Reopen note'):text('문자 다시 열기','Reopen text'))}${!task.note?btn('resend',text('예시 번호 다시 요청','Request another demo code')):''}</div></form>`;
 }
 node.oninput=e=>{e.target.removeAttribute('aria-invalid');if(e.target.id==='course-range'){const n=Number(e.target.value);e.target.setAttribute('aria-valuetext',[tr('기본','Default'),tr('크게','Large'),tr('아주 크게','Extra large')][n]);node.querySelector('.range-preview').style.fontSize=`${1+n*.3}em`;}};
 function view(){
  const stage=state.phase, supported=['Galaxy','iPhone'].includes(prefs.device), variant=stage===3?1:0;
  let phaseContent='';
  if(stage===0)phaseContent=`${tell(text('이런 때 쓰여요','When you use it'),esc(course.scene))}${id==='signup'?`<img class="lesson-scenario-art" src="${sceneArt}" alt="" width="350" height="228">`:''}<div class="row">${primary('concept','어떤 뜻인지 알아보기','Learn what it means')}</div>`;
  else if(stage===5)phaseContent=`${tell(text('쉽게 이해하기','Understand the idea'),esc(course.meaning))}${id==='signup'?tell(text('가입과 로그인은 달라요','Registration is not sign-in'),text('가입은 계정을 처음 만드는 일, 로그인은 이미 만든 계정을 여는 일이에요. 앱마다 요구하는 정보가 달라요.','Registration creates an account for the first time. Sign-in opens an existing account. Different apps ask for different information.')):''}<div class="row">${btn('intro',h(t('previous')))}${primary('observe','공식 화면 안내 보기','Open the official screen guide')}</div>`;
  else if(stage===4||stage===6){
   const checked=stage===4;
   phaseContent=`<div class="course-result"><h3>${checked?text('혼자서 해냈어요','You completed it on your own'):text('연습 과제를 모두 통과했어요','You passed all the practice tasks')}</h3><p>${checked?text('이 기기의 학습 기록에 완료로 남겼어요.','Completion is saved in this browser.'):text('결과를 확인하고 학습 기록에 남겨요.','Review your results and record completion.')}</p>${state.missed.length?`<h3>${text('다시 보면 좋은 부분','Good to review')}</h3><ul>${state.missed.map(i=>course.tasks[i]?`<li><strong>${h(taskLabel(course.tasks[i]))}</strong> · ${esc(course.tasks[i].tip)}</li>`:'').join('')}</ul>`:`<p>${text('입력이나 조작을 다시 시도한 단계가 없어요.','You did not need to retry any step.')}</p>`}<div class="row">${checked?goBtn('courses',text('다른 과정 고르기','Choose another course'),'primary')+btn('review',text('처음부터 복습','Review from the beginning')):primary('finish-assessment','완료 기록 저장하기','Save completion')}</div></div>`;
  }
  else if(stage===1)phaseContent=`${course.tasks.length>1?`<div class="course-controls course-guide-steps" role="group" aria-label="${text('참고 화면 고르기','Choose a reference screen')}">${course.tasks.map((m,i)=>`<button type="button" data-course="show:${i}" aria-pressed="${i===shown}" class="${i===shown?'primary':''}">${i+1}. ${h(taskLabel(m))}</button>`).join('')}</div>`:''}<div class="course-workbench course-guide"><div class="course-guide-art">${OfficialScreenshot(prefs.device,id,shown)}</div><div class="course-guide-notes"><h3 class="course-step-title"><span aria-hidden="true">${shown+1}</span>${h(taskLabel(course.tasks[shown]))}</h3>${tell(text('연습 순서','Practice steps'),esc(course.order))}${tell(text('실수했을 때','If something goes wrong'),esc(course.tip))}</div></div><div class="row course-guide-actions">${btn('concept',text('개념 다시 보기','Review the concept'))}${primary('guided','직접 따라 하기','Start guided practice')}</div>`;
  else phaseContent=`<div class="course-workbench course-practice"><div class="course-practice-instructions">${hintPanel(current(),variant)}<p class="course-privacy">${text('예시만 입력하세요. 실습 값은 저장하거나 보내지 않아요.','Use only the examples. Entries are not saved or sent.')}</p>${btn('review-screen',text('화면 안내 보기','Review the screen guide'))}</div>${practiceBody(current(),variant)}${stage===2?`<div class="course-practice-reference">${OfficialScreenshot(prefs.device,id,state.index)}</div>`:''}</div>`;
  return `<section class="course-detail"><p class="course-category">${esc(categories[course.category])}</p><h1 tabindex="-1">${esc(course.title)}</h1>${prefs.lang==='ko'||prefs.lang==='en'?'':`<p class="course-language" lang="en">This course is currently available in Korean and English.</p>`}<ol class="course-rail" aria-label="${text('학습 순서','Learning stages')}">${phaseOrder.map((p,i)=>`<li ${p===stage?'aria-current="step"':''}><span>${i+1}</span><p>${esc(phases[p])}</p></li>`).join('')}</ol>${!supported?`<div class="course-explain"><h2 id="course-stage" tabindex="-1">${text('어떤 휴대폰으로 배울까요?','Which phone would you like to learn?')}</h2><div class="row"><button type="button" data-action="device:Galaxy">Samsung Galaxy</button><button type="button" data-action="device:iPhone">Apple iPhone</button>${goBtn('setup',text('기종 확인 방법','How to find your model'))}</div></div>`:`<h2 id="course-stage" tabindex="-1">${esc(phases[stage])}${stage===2||stage===3?` <small>${state.index+1} / ${course.tasks.length}</small>`:''}</h2>${prefs.voice&&[0,5,1,2,3].includes(stage)?`${btn('listen',h(t('listen')))}<p id="course-voice" role="status"></p>`:''}${phaseContent}`}${canStore?'':`<p role="status">${text('이 브라우저에 기록을 저장할 수 없어요.','This browser could not save your progress.')}</p>`}<div class="row course-links">${goBtn('courses',text('전체 과정','All courses'))}${goBtn('help',h(t('help')))}${goBtn('settings',h(t('device')))}</div></section>`;
 }
 node.onclick=e=>{
  const trigger=e.target.closest('[data-course]');if(!trigger||!node.contains(trigger))return;
  const [cmd,arg]=trigger.dataset.course.split(':'),task=current(),variant=state.phase===3?1:0;
  if(cmd==='intro'){move(0);return;}
  if(cmd==='concept'&&(state.phase===0||state.phase===1)){move(5);return;}
  if(cmd==='observe'&&state.phase===5){move(1);return;}
  if(cmd==='show'&&state.phase===1&&course.tasks[Number(arg)]){shown=Number(arg);redraw(`[data-course="show:${arg}"]`);return;}
  if(cmd==='guided'&&state.phase===1){move(2);return;}
  if(cmd==='finish-assessment'&&state.phase===6){state.done=true;move(4);return;}
  if(cmd==='review'){state.missed=[];move(0);return;}
  if(cmd==='review-screen'){shown=state.index;move(1);return;}
  if(cmd==='listen'){const parts=state.phase===0?[course.scene]:state.phase===5?[course.meaning]:state.phase===1?[course.tasks[shown].title,course.order,course.tip]:[taskScenario(id,state.index,variant)||task.title,...(state.phase===2?[task.tip]:[])];const sample=task?.fields?.length&&[2,3].includes(state.phase)?targetText(task,variant):'';node.querySelector('#course-voice').textContent=speak([...parts.map(tx),sample].join(' '),prefs.lang==='ko'?'ko':'en')?'':t('no_voice');return;}
  if(state.phase!==2&&state.phase!==3)return;
  if(cmd==='launch'||cmd==='sim-home'){transient={launched:cmd==='launch'};redraw('#mock-title');return;}
  if(cmd==='wrong-app'){fail(tr('이 과제는 설정이 아니라 연습 앱에서 시작해요.','Start this task in Practice app, not Settings.'));return;}
  if(cmd==='request'||cmd==='resend'){const previous=codeFor(task,variant);transient={launched:true,requested:true,retry:cmd==='resend'?(transient.retry||0)+1:0,previous};redraw('#mock-title');return;}
  if(cmd==='old-inbox'){fail(tr('이전 문자는 만료됐어요. 가장 최근 예시 문자를 여세요.','That text has expired. Open the newest demo text.'));return;}
  if(cmd==='open-inbox'||cmd==='check-message'){const form=node.querySelector('#course-code');if(form)transient.draft=form.value;transient.opened=true;transient.returned=false;redraw('#mock-title');return;}
  if(cmd==='key'){const input=node.querySelector('#course-code');if(!input||input.readOnly)return;input.value=arg==='back'?input.value.slice(0,-1):(input.value+arg).slice(0,8);input.removeAttribute('aria-invalid');return;}
  if(cmd==='select-all'){const input=node.querySelector('#course-copy-source');input.focus();input.select();return;}
  if(cmd==='copy-value'){const input=node.querySelector('#course-copy-source');if(input.selectionStart!==0||input.selectionEnd!==input.value.length){fail(tr('예시 전체를 선택한 뒤 복사하세요.','Select the entire example before copying.'),input);return;}transient.clip=input.value;node.querySelector('#course-status').textContent=tr('연습용으로 복사했어요.','Copied inside practice.');return;}
  if(cmd==='return'){if(task.kind==='copy'&&!transient.clip){fail(tx(task.tip));return;}transient.returned=true;redraw('#course-code');return;}
  if(cmd==='paste-value'){if(!transient.clip){fail(tx(task.tip));return;}node.querySelector('#course-code').value=transient.clip;return;}
  if(cmd==='scan'){transient.scanned=true;redraw('#mock-title');return;}
  if(cmd==='picker'){transient.picker=Number(arg);redraw('#mock-title');return;}
  if(cmd==='back-picker'){delete transient.picker;redraw('#mock-title');return;}
  if(cmd==='remove-attachment'){delete transient.attached;delete transient.picker;redraw('#mock-title');return;}
  if(cmd==='pick'){if(task.kind==='attach'){transient.attached=Number(arg);redraw('#mock-title');return;}if(Number(arg)===task.target[variant])pass();else fail(tx(task.tip));return;}
  if(cmd==='confirm-attachment'){if(transient.attached===task.target[variant])pass();else fail(tx(task.tip));}
 };
 node.onchange=e=>{if(e.target.hasAttribute('data-course-show'))node.querySelectorAll('[data-course-password]').forEach(input=>input.type=e.target.checked?'text':'password');};
 node.onsubmit=e=>{
  if(e.target.id!=='course-form')return;e.preventDefault();
  const task=current(),variant=state.phase===3?1:0;
  if(task.kind==='range'){
   const input=node.querySelector('#course-range');if(Number(input.value)!==task.target[variant]+1){fail(tx(task.tip),input);return;}
  }else if(task.kind==='form'){
   for(const [i,f] of task.fields.entries()){const input=node.querySelector('#answer-'+i);if(input.value!==f.values[variant]){fail(`${tx(f.label)}: ${tx(task.tip)}`,input);return;}}
   if(task.options&&!node.querySelector('#term-0').checked){fail(tx(task.tip),node.querySelector('#term-0'));return;}
  }else{
   const input=node.querySelector('#course-code');if(!input.value.trim()){fail(tr('입력칸이 비었어요. 예시 문자나 메모를 확인한 뒤 넣어요.','The field is empty. Check the sample text or note, then enter it.'),input);return;}if(input.value!==codeFor(task,variant)){fail(input.value===transient.previous&&transient.retry?tr('이 번호는 만료됐어요. 새로 요청한 문자에 있는 번호를 넣어요.','This code has expired. Enter the code from the newest text.'):task.note?tx(task.tip):tr('번호가 일치하지 않아요. 가장 최근 예시 문자와 비교하세요.','The code does not match. Compare it with the newest demo text.'),input);return;}
  }
  pass();
 };
 draw();
}
export const mountCourse=LessonEngine;
