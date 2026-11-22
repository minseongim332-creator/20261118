import {box,date,field,flows,goBtn,h,note,prefs,progress,t,tr,names,local} from './shared.js';
import {b,line,familyArt} from './brand.js';
import {deviceFlow} from './device.js';
import {picture} from './backup.js';
let active='',revision=0,cleanup=()=>{};
const text=(ko,en)=>h(tr(ko,en));
const button=(id,label,cls='')=>`<button type="button" data-family="${h(id)}" class="${cls}">${h(label)}</button>`;
const title=p=>p==='family'?b('family'):p==='notifications'?b('notice'):t(p==='chat'?'family':'help');
const ok=r=>{if(r.error)throw r.error;return r.data;};
const failure=err=>({last_admin:tr('마지막 관리자는 먼저 다른 가족에게 관리 역할을 넘겨야 해요.','Make another member an admin first.'),no_recipient:tr('가족이 승인되어 들어오면 보낼 수 있어요.','You can send when another family member joins.'),photo_limit:tr('사진 보관 한도에 도달했어요.','This family has reached its photo limit.'),request_unavailable:tr('요청이 만료됐거나 이미 처리됐어요. 목록을 새로 확인해 주세요.','This request expired or was already reviewed. Refresh the list.'),send_limit:tr('잠시 기다린 뒤 다시 보내 주세요. 작성한 내용은 그대로 남아 있어요.','Wait a moment and try again. Your draft is still here.')})[err?.message]||tr('연결을 확인하고 다시 시도해 주세요.','Check your connection and try again.');
const payload=fields=>({lang:prefs.lang,device:prefs.device,...fields});
const select=(id,label,choices,current)=>`<label class="field">${h(label)}<select name="${id}">${choices.map(([value,name])=>`<option value="${h(value)}" ${value===current?'selected':''}>${h(name)}</option>`).join('')}</select></label>`;
const deviceList=[['Galaxy','Galaxy'],['iPhone','iPhone'],['Unknown',null]];
const deviceName=x=>x==='Unknown'?b('unknown'):x;
const safeLesson=k=>Object.hasOwn(flows,k)&&['calls','contacts','sms','camera','gallery','internet','wifi','font','copy','safe'].includes(k);
const formatCode=x=>x?.match(/.{1,4}/g)?.join('–')||'';
const validPhoto=v=>typeof v==='string'&&v.length<=650000&&/^\/9j\/[A-Za-z0-9+/]+={0,2}$/.test(v);
const photoHtml=v=>validPhoto(v)?`<img width="384" height="240" loading="lazy" src="data:image/jpeg;base64,${v}" alt="${text('가족이 보낸 사진','Photo from family')}">`:'';
const dismiss=()=>{revision++;cleanup();cleanup=()=>{};};
export const stopSpace=dismiss;
export async function space(node,page,db){
 dismiss();const at=revision;
 const dispatch=(op,fid,arg)=>db.rpc('pon_action',{op,fid,arg:payload(arg)}).then(ok);
 const live=()=>at===revision&&node.isConnected;
 const status=(s)=>{const n=node.querySelector('#family-status');if(live()&&n)n.textContent=s;};
 const reload=()=>space(node,page,db);
 const safe=(s,go)=>{const el=node.querySelector(s);if(el)el.onclick=async e=>{if(el.disabled)return;el.disabled=true;try{await go(e)}catch(error){status(failure(error));}finally{el.disabled=false;}};};
 const form=(s,go)=>{const el=node.querySelector(s);if(el)el.onsubmit=async e=>{e.preventDefault();if(el.dataset.busy)return;el.dataset.busy='yes';const trigger=e.submitter;if(trigger)trigger.disabled=true;try{await go(new FormData(el),el)}catch(err){status(failure(err));}finally{delete el.dataset.busy;if(trigger)trigger.disabled=false;}};};
 const actions=(id)=>`<div id="${id}"></div>`;
 try{
  let session=ok(await db.auth.getSession()).session;if(!live())return;
  const statusHtml=(prefs.lang==='ko'||prefs.lang==='en'?'':`<p class="muted">${h(b('languageLimit'))}</p>`)+'<p class="notice" id="family-status" role="status"></p>';
  const copy=async value=>{await navigator.clipboard.writeText(value);status(tr('복사했어요.','Copied.'));};
  if(!session){node.innerHTML=box(title(page),`<section class="panel family-intro">${line('family',27)}<h2>${text('가족끼리만 연결해요','Connect privately with family')}</h2><p>${text('이메일 없이 현재 브라우저를 가족 공간에 연결해요. 브라우저 데이터를 지우면 이 기기의 연결을 잃을 수 있어요.','Connect this browser without an email. Clearing browser data can remove your access.')}</p>${button('start',tr('이 기기로 시작','Start on this device'),'primary')}</section>${statusHtml}${goBtn('profile',h(t('profile')))}`);safe('[data-family=start]',async()=>{ok(await db.auth.signInAnonymously());await reload();});return;}
  const me=session.user.id;
  const [families,pending]=await Promise.all([db.from('pon_families').select('id,title').order('created_at').limit(24).then(ok),db.from('pon_requests').select('family,created_at').eq('actor',me).gt('created_at',new Date(Date.now()-7*86400000).toISOString()).limit(8).then(ok)]);
  if(!live())return;
  if(!families.some(f=>f.id===active))active=families[0]?.id||'';
  const family=families.find(f=>f.id===active),fid=family?.id;
  const nickname=field('nick',tr('내 이름 또는 별명','Your display name'),'text','required maxlength="32" autocomplete="nickname"');
  const pendingUI=pending.length?`<section class="panel"><h2>${text('승인 기다리는 중','Waiting for approval')}</h2><p>${text('가족 관리자가 승인하면 입장할 수 있어요.','You can enter after the family admin approves.')}</p>${pending.map(r=>`<div class="row"><span>${h(date(r.created_at))}</span>${button('cancel:'+r.family,tr('참여 요청 취소','Cancel request'))}</div>`).join('')}${button('refresh',tr('승인 상태 확인','Check approval'))}</section>`:'';
  const invitePrefill=location.hash.match(/^#family\/([0-9a-f]{12})$/i)?.[1]||'';
  const profileFields=()=>select('lang','언어 / Language',Object.entries(names),prefs.lang)+select('device',t('device'),deviceList.map(([x])=>[x,deviceName(x)]),prefs.device);
  const connection=`${pendingUI}<details ${invitePrefill||(!fid&&!pending.length)?'open':''}><summary>${text('가족 공간 만들기 또는 참여','Create or join a family')}</summary><div class="two family-forms"><form class="panel" id="create-family"><h2>${text('가족 공간 만들기','Create family space')}</h2>${field('title',tr('가족 이름','Family name'),'text','required maxlength="60" autocomplete="off"')}${nickname}<button class="primary">${text('가족 공간 만들기','Create family space')}</button></form><form class="panel" id="join-family"><h2>${text('가족 코드로 참여','Join with a family code')}</h2>${field('code',tr('받은 가족 코드','Family invite code'),'text',`required maxlength="24" spellcheck="false" autocomplete="off" value="${h(invitePrefill)}"`)}${nickname}${profileFields()}<p class="join-review" id="join-review" role="status"></p><button>${text('가족 이름 확인','Check family name')}</button></form></div></details>`;
  function wireConnections(){
   safe('[data-family=refresh]',reload);
   for(const r of pending)safe(`[data-family="cancel:${r.family}"]`,async()=>{if(!confirm(tr('참여 요청을 취소할까요?','Cancel this join request?')))return;await dispatch('cancel_request',r.family,{});await reload();});
   form('#create-family',async d=>{const r=await dispatch('create',null,{title:d.get('title'),nick:d.get('nick')});active=r.id;await reload();});
   let reviewed='';
   const join=node.querySelector('#join-family'),review=join?.querySelector('#join-review'),submit=join?.querySelector('button');
   const nameLabel=tr('가족 이름 확인','Check family name');
   join?.elements.code.addEventListener('input',()=>{reviewed='';review.textContent='';submit.textContent=nameLabel;});
   form('#join-family',async d=>{const code=d.get('code').replace(/[\s\-–]/g,'').toUpperCase();if(!/^[0-9A-F]{12}$/.test(code)){review.textContent=tr('가족에게 받은 12자리 코드를 확인해 주세요.','Check the 12-character code from your family.');return;}
    const r=await dispatch(reviewed===code?'join':'inspect_invite',null,{code,nick:d.get('nick'),lang:d.get('lang'),device:d.get('device')});
    if(r.status==='ok'){if(join.elements.code.value.replace(/[\s\-–]/g,'').toUpperCase()!==code)return;reviewed=code;review.textContent=tr('참여할 가족: ','Family to join: ')+r.title;submit.textContent=tr('참여 요청 보내기','Request to join');return;}
    if(!['pending','member'].includes(r.status)){reviewed='';submit.textContent=nameLabel;review.textContent=r.status==='limited'?tr('잠시 후 다시 시도해 주세요.','Wait a few minutes and try again.'):tr('쓸 수 없는 코드예요. 가족에게 새 코드를 받아 주세요.','This code is unavailable. Ask your family for a new code.');return;}
    prefs.lang=d.get('lang');prefs.device=d.get('device');prefs.devicePicked=true;local();
    if(r.id)active=r.id;
    const url=new URL(location.href);url.searchParams.set('lang',prefs.lang);if(invitePrefill)url.hash='family';history.replaceState(null,'',url);window.dispatchEvent(new Event('pon:prefs'));
   });
  }
  if(!family){node.innerHTML=box(title(page),`${statusHtml}${connection}${page!=='family'?goBtn('family',h(b('family'))):''}`);wireConnections();if(pending.length){const timer=setInterval(()=>{if(!node.isConnected){clearInterval(timer);return;}if(node.querySelector('form :focus'))return;db.from('pon_families').select('id',{count:'exact',head:true}).then(r=>{if(live()&&r.count)reload();});},8000);cleanup=()=>clearInterval(timer);}return;}
  const people=await db.from('pon_members').select('actor,nick,admin,read_at').eq('family',fid).order('nick').then(ok);if(!live())return;
  const self=people.find(x=>x.actor===me);if(!self)throw Error('not_a_member');
  const admin=self.admin;
  const devices=admin&&page==='family'?await dispatch('member_devices',fid,{}):[];if(!live())return;
  const [invite,requests]=admin&&page==='family'?await Promise.all([db.from('pon_invites').select('code,expires,remaining').eq('family',fid).maybeSingle().then(ok),db.from('pon_requests').select('actor,nick,created_at').eq('family',fid).gt('created_at',new Date(Date.now()-7*86400000).toISOString()).order('created_at').limit(24).then(ok)]):[null,[]];if(!live())return;
  const code=invite?.remaining>0&&Date.parse(invite.expires)>Date.now()?formatCode(invite.code):'';
  const joinLink=()=>{const u=new URL(location.origin+location.pathname);u.hash='family/'+invite.code;return u.href;};
  const picker=`<label class="field family-picker">${h(b('family'))}<select id="family-picker">${families.map(x=>`<option value="${h(x.id)}" ${x.id===fid?'selected':''}>${h(x.title)}</option>`).join('')}</select></label>`;
  const inviteBlock=admin?`<section class="panel"><h2>${text('가족 초대','Invite family')}</h2>${code?`<p class="invite-code" translate="no">${h(code)}</p><p>${h(date(invite.expires))} · ${text(`남은 사용 ${invite.remaining}회`,`${invite.remaining} uses left`)}</p><div class="row">${button('copy-code',tr('코드 복사','Copy code'))}${button('copy-link',tr('링크 복사','Copy link'))}${button('share',tr('가족에게 공유','Share with family'))}</div>`:note(tr('사용할 수 있는 코드가 없어요.','There is no active code.'))}<div class="row">${button('invite',code?tr('코드 재발급','Replace code'):tr('코드 발급','Create code'))}${code?button('revoke',tr('초대 취소','Revoke invite')):''}</div></section>`:'';
  const approvals=admin?`<section class="panel"><h2>${text('참여 요청','Join requests')}</h2>${requests.length?requests.map(r=>`<article class="member-row"><strong>${h(r.nick)}</strong><div class="row">${button('approve:'+r.actor,tr('승인','Approve'))}${button('reject:'+r.actor,tr('거절','Decline'))}</div></article>`).join(''):note(tr('아직 참여 요청이 없어요.','No pending join requests.'))}${button('refresh',tr('참여 요청 새로 보기','Refresh requests'))}</section>`:'';
  const members=`<section class="panel"><h2>${text('가족 구성원','Family members')}</h2>${people.map(m=>{const details=devices.find(x=>x.actor===m.actor);return `<article class="member-row"><span><strong>${h(m.nick)}</strong> <small>${m.admin?text('관리자','Admin'):text('구성원','Member')}${m.actor===me?text(' · 내 기기',' · this device'):''}</small>${details?`<br><small>${h(names[details.lang])} · ${h(deviceName(details.device))}</small>`:''}</span>${admin&&m.actor!==me?`<div class="row">${button('role:'+m.actor,m.admin?tr('구성원으로 변경','Make member'):tr('관리자로 변경','Make admin'))}${button('remove:'+m.actor,tr('이 기기 연결 해제','Revoke device access'))}</div>`:''}</article>`;}).join('')}<form id="my-family-device"><h3>${text('가족에 표시할 내 언어와 기종','My language and device for this family')}</h3><div class="two">${profileFields()}</div><button>${h(t('save'))}</button></form></section>`;
  const management=`<details><summary>${text('가족 공간 설정','Family settings')}</summary><div class="panel">${admin?`<form id="rename-family">${field('title',tr('가족 이름','Family name'),'text',`required maxlength="60" value="${h(family.title)}"`)}<button>${text('이름 저장','Save name')}</button></form>`:''}<div class="row">${button('leave',tr('내 기기 연결 해제','Disconnect my device'))}${admin?button('delete',tr('가족 공간 삭제','Delete family space')):''}</div></div></details>`;
  const helpParts=location.hash.split('/');const requested=page==='help'&&helpParts.length>1?helpParts[1]:null;
  const candidate=requested??progress.recent;
  const recent=safeLesson(candidate)?candidate:'';
  const recentStep=recent?Math.max(1,Math.min(Number(requested?helpParts[2]:(progress.steps[recent]||0)+1)||1,deviceFlow(recent,flows).length)):null;
  const lessonLabel=(lesson,step)=>`${t(lesson)}${step?' · '+t('step')+' '+step:''}`;
  const help=page==='help',chat=page==='chat'||help;
  const compose=people.length<2?note(tr('다른 가족이 승인되어 들어오면 보낼 수 있어요.','You can send when another family member joins.')):`<form class="panel" id="pon-compose"><p class="muted">${h(t('privacy'))}</p><label class="field">${text(help?'무엇이 어려운가요?':'가족에게 보낼 말',help?'What do you need help with?':'Message to your family')}<textarea name="body" maxlength="1200"></textarea></label>${help&&recent?`<label class="check"><input type="checkbox" name="lesson"> ${text('배우는 단계 링크도 보내기','Include a link to this step')}: ${h(lessonLabel(recent,recentStep))}</label>`:''}<label class="field">${text('사진 1장 (선택)','One photo (optional)')}<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="check"><input type="checkbox" name="translate"> ${text('가족이 이 글을 번역해도 돼요','Allow family to translate this text')}</label><div class="row"><button class="primary">${h(t('preview'))}</button>${!help&&recent?`<button name="intent" value="lesson">${text('학습 내용 공유','Share learning')}</button>`:''}</div></form><section id="compose-preview" class="panel" hidden></section>`;
  const familyActivity=`<section class="panel family-activity"><h2>${text('우리 가족 소식','Family activity')}</h2><div class="row">${goBtn('notifications',h(b('notice')))}${goBtn('help',h(t('help')))}</div><h3>${text('최근 도움 요청','Recent help requests')}</h3><div id="family-help-feed"></div><h3>${text('직접 공유한 학습','Shared learning')}</h3><div id="family-lesson-feed"></div></section>`;
  node.innerHTML=box(title(page),`${picker}${statusHtml}<section class="family-intro ${page==='family'?'family-welcome':''}"><div><h2>${h(family.title)}</h2><p>${text(`${people.length}명 연결됨`,`${people.length} connected`)}</p><div class="row">${goBtn('family',h(b('family')))}${goBtn('chat',h(t('family')))}${goBtn('help',h(t('help')))}</div></div>${page==='family'?`<img src="${familyArt}" alt="" width="510" height="330">`:''}</section>${page==='family'?`${familyActivity}${connection}${inviteBlock}${approvals}${members}${management}<h2>${text('최근 대화','Recent messages')}</h2>`:page==='notifications'?`<h2>${text('읽지 않은 소식','Unread activity')}</h2>`:`<div class="row"><p id="realtime-status" class="muted" role="status"></p>${button('latest',tr('최신 메시지 확인','Check latest messages'))}</div>`}${actions('pon-messages')}${chat?`<div class="row">${button('older',tr('이전 메시지','Older messages'))}</div>${compose}`:''}`);
  node.querySelector('#family-picker').onchange=e=>{active=e.target.value;reload();};
  if(page==='family')wireConnections();
  safe('[data-family=copy-code]',()=>copy(code.replaceAll('–','-')));safe('[data-family=copy-link]',()=>copy(joinLink()));
  safe('[data-family=share]',async()=>{if(navigator.share){try{await navigator.share({title:'폰잘알',url:joinLink()});}catch(e){if(e.name!=='AbortError')throw e;}}else await copy(joinLink());});
  for(const [sel,msg] of [['invite',code?tr('이전 코드를 폐기하고 새 코드를 만들까요?','Replace the old code?'):''],['revoke',tr('이 코드를 더 이상 쓰지 못하게 할까요?','Revoke this invite code?')],['leave',tr('이 기기의 가족 공간 접근을 끊을까요?','Disconnect this device?')],['delete',tr('모든 가족의 대화와 사진이 삭제됩니다. 가족 공간을 삭제할까요?','Delete the space, including messages and photos, for all members?')]])safe(`[data-family=${sel}]`,async()=>{if(msg&&!confirm(msg))return;await dispatch(sel,fid,{});await reload();});
  form('#rename-family',async d=>{await dispatch('rename',fid,{title:d.get('title')});await reload();});
  form('#my-family-device',async d=>{await dispatch('my_device',fid,{lang:d.get('lang'),device:d.get('device')});await reload();const out=node.querySelector('#family-status');if(out)out.textContent=tr('이 가족에 표시할 정보를 저장했어요.','Your information for this family was saved.');});
  for(const r of requests)for(const op of ['approve','reject'])safe(`[data-family="${op}:${r.actor}"]`,async()=>{await dispatch(op,fid,{actor:r.actor});await reload();});
  if(admin)for(const m of people.filter(x=>x.actor!==me))for(const op of ['role','remove'])safe(`[data-family="${op}:${m.actor}"]`,async()=>{if(!confirm(tr(op==='remove'?'이 가족의 현재 기기 접근을 끊을까요?':'이 가족의 역할을 바꿀까요?',op==='remove'?'Revoke this family member’s device access?':'Change this family member’s role?')))return;await dispatch(op,fid,{actor:m.actor,admin:!m.admin});await reload();});
  const list=node.querySelector('#pon-messages');list.className=chat?'thread pon-thread':'pon-feed';
  let batch=20,fetching=false,again=false,signature='',marked=self.read_at,cached=[];
  async function refresh(){
   if(!live())return;if(fetching){again=true;return;}fetching=true;
   try{
    const order='id,actor,nick,body,kind,lesson,photo,created_at,translate_ok,source_lang,lesson_step';
    const lessonLink=m=>safeLesson(m.lesson)?goBtn('learn/'+m.lesson+(m.lesson_step?'/'+m.lesson_step:''),h(lessonLabel(m.lesson,m.lesson_step))):'';
    let q=db.from('pon_messages').select(order).eq('family',fid).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(chat?batch:8);
    if(help)q=q.eq('kind','help');if(page==='notifications')q=q.or(`actor.neq.${me},actor.is.null`).gt('created_at',self.read_at);
    const peopleNow=db.from('pon_members').select('actor,read_at').eq('family',fid).then(ok);
    const recentActivity=page==='family'?Promise.all(['help','lesson'].map(kind=>{const req=db.from('pon_messages').select(order).eq('family',fid).order('created_at',{ascending:false}).limit(3);return (kind==='help'?req.eq('kind','help'):req.not('lesson','is',null)).then(ok);})):null;
    const [rows,readers,activity]=await Promise.all([q.then(ok),peopleNow,recentActivity]);if(!live())return;
    if(!readers.some(p=>p.actor===me)){await reload();return;}cached=rows;
    const latest=rows[0]?.created_at;
    const readCount=m=>readers.filter(p=>p.actor!==me&&p.read_at>=m.created_at).length;
    const sig=JSON.stringify([rows.map(m=>m.id),rows.map(m=>m.actor===me?readCount(m):0),activity?.map(xs=>xs.map(m=>m.id))]);
    if(signature!==sig){signature=sig;const stick=list.scrollHeight-list.scrollTop-list.clientHeight<80||!list.childElementCount;
     list.innerHTML=(chat?[...rows].reverse():rows).map(m=>`<article class="message ${m.actor===me?'mine':''}"><div class="msg-meta"><strong>${h(m.nick)}</strong><time datetime="${h(m.created_at)}">${h(date(m.created_at))}</time>${m.kind==='help'?`<span>${h(t('help'))}</span>`:''}</div>${m.body?`<p>${h(m.body)}</p>`:''}${lessonLink(m)}<div class="row">${m.photo?button('photo:'+m.id,tr('사진 열기','Open photo')):''}${m.body&&m.translate_ok&&m.source_lang!==prefs.lang?button('translate:'+m.id,tr('이 기기에서 번역','Translate on this device')):''}${m.actor===me?`<small>${text(`읽은 가족 ${readCount(m)}명`,`${readCount(m)} have read`)}</small>${button('delete-msg:'+m.id,tr('삭제','Delete'))}`:''}</div><div id="attachment-${h(m.id)}"></div><p id="translation-${h(m.id)}" class="notice" role="status"></p></article>`).join('')||note(tr('아직 표시할 소식이 없어요.','There is no activity to show yet.'));
     if(activity)for(const [i,id] of ['#family-help-feed','#family-lesson-feed'].entries())node.querySelector(id).innerHTML=activity[i].map(m=>`<article class="message"><div class="msg-meta"><strong>${h(m.nick)}</strong><time datetime="${h(m.created_at)}">${h(date(m.created_at))}</time></div>${m.body?`<p>${h(m.body.slice(0,160))}${m.body.length>160?'…':''}</p>`:''}${lessonLink(m)}</article>`).join('')||note(t('empty'));
     if(stick&&chat)list.scrollTop=list.scrollHeight;
    }
    if(page==='chat'&&latest&&latest>marked&&!document.hidden&&rows.some(x=>x.actor!==me)){marked=latest;try{await dispatch('read',fid,{through:latest});}catch{marked=self.read_at;}}
    const older=node.querySelector('[data-family=older]');if(older)older.hidden=rows.length<batch||batch>=100;
   }catch(err){if(live())status(failure(err));}finally{fetching=false;if(again){again=false;refresh();}}
  }
  list.onclick=async e=>{
   const trigger=e.target.closest('button[data-family]');if(!trigger||trigger.disabled)return;const [op,id]=trigger.dataset.family.split(':');const msg=cached.find(m=>m.id===id);if(!msg)return;trigger.disabled=true;
   try{
    if(op==='photo'){const p=await db.from('pon_photos').select('jpg').eq('id',id).single().then(ok);const el=node.querySelector('#attachment-'+id);if(el)el.innerHTML=photoHtml(p.jpg)||note(tr('사진을 열지 못했어요.','Photo unavailable.'));}
    if(op==='delete-msg'&&confirm(tr('보낸 메시지와 사진을 가족 대화에서 삭제할까요?','Remove this message and photo from the family conversation?'))){await dispatch('delete_message',fid,{id});await refresh();}
    if(op==='translate'){
     const out=node.querySelector('#translation-'+id);if(!out)return;
     const unavailable=tr('이 브라우저나 언어에서는 번역할 수 없어요. 원문은 그대로 볼 수 있어요.','Translation is unavailable in this browser or language. The original remains visible.');
     if(!globalThis.Translator){out.textContent=unavailable;return;}
     const pair={sourceLanguage:msg.source_lang==='zh-CN'?'zh':msg.source_lang,targetLanguage:prefs.lang==='zh-CN'?'zh':prefs.lang};
     const pendingTranslator=globalThis.Translator.create(pair);out.textContent=tr('번역 준비 중…','Preparing translation…');
     try{const translator=await pendingTranslator;try{out.textContent=tr('번역: ','Translation: ')+await translator.translate(msg.body);}finally{translator.destroy();}}catch{out.textContent=unavailable;}
    }
   }catch(error){status(failure(error));}finally{trigger.disabled=false;}
  };
  safe('[data-family=latest]',async()=>{batch=20;signature='';await refresh();if(live())list.scrollTop=list.scrollHeight;});safe('[data-family=older]',async()=>{batch=Math.min(batch+20,100);await refresh();});
  const composer=node.querySelector('#pon-compose'),preview=node.querySelector('#compose-preview');
  if(composer)composer.addEventListener('submit',e=>{composer.dataset.intent=e.submitter?.value||'';});
  form('#pon-compose',async(d,f)=>{const share=f.dataset.intent==='lesson';f.dataset.intent='';const body=d.get('body').trim(),file=d.get('photo');
   const lesson=recent&&(share||d.has('lesson'))?recent:'';const jpg=file?.size?await picture(file):'';
   if(jpg&&!validPhoto(jpg)){status(tr('사진이 너무 커요. 더 작은 사진을 선택해 주세요.','Choose a smaller photo.'));return;}
   if(!body&&!jpg&&!lesson){status(tr('메시지, 사진 또는 배운 내용을 골라 주세요.','Add a message, photo or a lesson.'));return;}
   const packet={body,jpg,lesson,lessonStep:lesson?recentStep:null,kind:help?'help':share?'lesson':'chat',translate:d.has('translate')};
   preview.hidden=false;f.hidden=true;preview.innerHTML=`<h2>${h(t('preview'))}</h2><p>${h(body)}</p>${photoHtml(jpg)}${lesson?`<p>${h(lessonLabel(lesson,recentStep))}</p>`:''}<div class="row">${button('cancel-send',t('cancel'))}${button('send',t('send'),'primary')}</div><p class="notice" id="send-status" role="status"></p>`;
   const close=()=>{preview.hidden=true;preview.replaceChildren();f.hidden=false;f.querySelector('textarea').focus();};safe('[data-family=cancel-send]',close);safe('[data-family=send]',async()=>{try{await dispatch('send',fid,packet);}catch(err){preview.querySelector('#send-status').textContent=failure(err);return;}f.reset();close();status(tr('가족에게 보냈어요.','Sent to your family.'));await refresh();});preview.querySelector('button').focus();
  });
  const rt=node.querySelector('#realtime-status');
  const channel=db.channel('pon:'+fid+':'+crypto.randomUUID()).on('postgres_changes',{event:'INSERT',schema:'public',table:'pon_messages',filter:'family=eq.'+fid},refresh).subscribe(s=>{if(!live())return;if(rt)rt.textContent=s==='SUBSCRIBED'?tr('실시간 연결됨','Live connection'):tr('연결 확인 중 · 최신 메시지를 직접 확인할 수 있어요.','Checking connection · you can check for new messages.');if(s==='SUBSCRIBED')refresh();});
  // Refresh read markers, deletions, and a reconnect gap through the same membership-filtered query.
  const timer=setInterval(()=>{if(!node.isConnected){clearInterval(timer);db.removeChannel(channel);return;}if(!document.hidden)refresh();},10000);
  const online=()=>refresh();window.addEventListener('online',online);document.addEventListener('visibilitychange',online);
  cleanup=()=>{clearInterval(timer);window.removeEventListener('online',online);document.removeEventListener('visibilitychange',online);db.removeChannel(channel);};
  await refresh();
 }catch(e){if(live()){node.innerHTML=box(title(page),`${note(tr('가족 공간에 연결하지 못했어요. 현재 설정과 인터넷 연결을 확인해 주세요.','Family space is unavailable. Check its setup and your connection.'),'warn')}${button('retry',tr('다시 열기','Try again'))}${goBtn('catalog',h(b('help')))}`);safe('[data-family=retry]',reload);}}
}
