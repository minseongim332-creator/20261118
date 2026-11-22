import {t,tr,h,box,goBtn,note,field,prefs,progress,local,flows,legacy,date,names} from './shared.js';
import {mountBackup,picture} from './backup.js';

let clientPromise,recovery=false,activeRoom='',timer;
const visible=selector=>document.querySelector(selector);
const ok=(result)=>{if(result.error)throw result.error;return result.data;};
const err=()=>tr('연결하지 못했어요. 입력을 확인하고 다시 시도해 주세요.','Could not complete this action. Check your information and retry.');
const label=(ko,en)=>h(tr(ko,en));
const action=(id,name,css='')=>`<button type="button" id="${id}" class="${css}">${h(name)}</button>`;
const heading=page=>t(page==='backup'?'legacy':page);
const roomKey=v=>typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v);
const plain=val=>val&&typeof val==='object'&&!Array.isArray(val);
const sameOrigin=()=>new URL('/',location.origin).href;

function publicKey(key){
 if(typeof key!=='string')return false;
 if(/^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(key))return true;
 try{const parts=key.split('.');if(parts.length!==3)return false;return JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/'))).role==='anon';}catch{return false;}
}
async function client(){
 if(!clientPromise)clientPromise=(async()=>{
  const rsp=await fetch('/guide-config.json',{cache:'no-store'});if(!rsp.ok)throw Error('config');
  const config=await rsp.json();if(!config.supabaseUrl&&!config.supabasePublishableKey)return null;
  const url=new URL(config.supabaseUrl);if(url.protocol!=='https:'||url.username||url.password||!publicKey(config.supabasePublishableKey))throw Error('config');
  const {createClient}=await import('@supabase/supabase-js');
  const db=createClient(url.origin,config.supabasePublishableKey,{auth:{flowType:'pkce',persistSession:true,detectSessionInUrl:true}});
  db.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'){recovery=true;setTimeout(()=>{if((location.hash.slice(1)||'home')==='profile')window.dispatchEvent(new Event('guide:recover'));else location.hash='profile';},0);}});
  return db;
 })().catch(e=>{clientPromise=null;throw e});
 return clientPromise;
}
if(new URLSearchParams(location.search).has('code'))client().catch(()=>{});

function controls(node){
 const find=id=>node.querySelector(id),status=(id,text)=>{const e=find(id);if(e)e.textContent=text;};
 function event(id,method,work,result='#result'){
  const el=find(id);if(!el)return;
  el[method]=async e=>{e.preventDefault();const trigger=method==='onsubmit'?e.submitter||el.querySelector('button'):el;if(trigger?.disabled)return;if(trigger)trigger.disabled=true;
   status(result,'');try{await work(el,e)}catch{status(result,err());}finally{if(trigger)trigger.disabled=false;}};
 }
 return {find,status,form:(id,work,result)=>event(id,'onsubmit',work,result),on:(id,work,result)=>event(id,'onclick',work,result)};
}

async function profile(node,db,session,go){
 if(recovery){node.innerHTML=box(heading('profile'),`<form class="panel" id="reset">${field('password',tr('새 비밀번호','New password'),'password','minlength="10" required autocomplete="new-password"')}<button class="primary">${label('새 비밀번호 저장','Save new password')}</button></form><p class="notice" role="status" id="result"></p>`);
 const {form,status}=controls(node);form('#reset',async f=>{ok(await db.auth.updateUser({password:f.password.value}));recovery=false;f.reset();status('#result',tr('바꿨어요.','Password updated.'));setTimeout(()=>{if(node.isConnected)mount(node,'profile',go);},650);});return;}
 if(!session){node.innerHTML=box(heading('profile'),`<form class="panel" id="account-form">${field('email',tr('이메일','Email'),'email','required autocomplete="email" spellcheck="false"')}${field('password',tr('비밀번호','Password'),'password','autocomplete="current-password" maxlength="128"')}<div class="row"><button class="primary" name="intent" value="login">${label('로그인','Sign in')}</button><button name="intent" value="signup">${label('가입 확인 메일 받기','Get sign-up email')}</button><button name="intent" value="recover">${label('비밀번호 바꾸는 메일 받기','Get a password-reset email')}</button></div><p class="notice" role="status" id="result"></p></form>`);
  const {form,status}=controls(node);form('#account-form',async (f,e)=>{
   const email=f.email.value.trim(),password=f.password.value,intent=e.submitter?.value||'login';
   if(intent==='recover'){ok(await db.auth.resetPasswordForEmail(email,{redirectTo:sameOrigin()}));status('#result',tr('가입한 주소라면 재설정 메일이 와요.','If the address is registered, a reset email will arrive.'));return;}
   if(!password||intent==='signup'&&password.length<10){status('#result',tr('비밀번호를 입력해 주세요. 새 비밀번호는 10자 이상이에요.','Enter a password. New passwords need at least 10 characters.'));f.password.focus();return;}
   if(intent==='signup'){ok(await db.auth.signUp({email,password,options:{emailRedirectTo:sameOrigin()}}));status('#result',tr('가입 확인 메일을 열어 주세요.','Open the confirmation email.'));f.password.value='';return;}
   ok(await db.auth.signInWithPassword({email,password}));await mount(node,'profile',go);
  });return;
 }
 node.innerHTML=box(heading('profile'),`<p class="notice">${h(session.user.email||'')}</p>${goBtn('family',h(t('family')),'primary')}<section class="panel"><h2>${label('내 학습 기록','My learning records')}</h2><p>${label('이 브라우저와 내 계정 기록을 합칩니다. 가족에게 공개되지 않아요.','Merge records on this browser and your account. They stay private.')}</p>${action('sync',tr('내 기록 합치기','Merge my records'))}</section><div class="row">${action('logout',tr('로그아웃','Sign out'))}</div><details><summary>${label('계정 삭제','Delete account')}</summary><form id="delete-account"><label class="check"><input type="checkbox" required> ${label('계정과 내가 쓴 메시지, 내가 만든 채팅방이 삭제됨을 확인했어요.','I understand that my account, messages, and chats I created will be deleted.')}</label><button>${label('내 계정 삭제','Delete my account')}</button></form></details><p id="result" role="status" class="notice"></p>`);
 const {on,form,status}=controls(node);
 on('#logout',async()=>{ok(await db.auth.signOut());activeRoom='';await mount(node,'profile',go);});
 form('#delete-account',async()=>{ok(await db.rpc('guide_delete_self'));await db.auth.signOut({scope:'local'});activeRoom='';await mount(node,'profile',go);});
 on('#sync',async()=>{
  const row=ok(await db.from('learning_state').select('payload').eq('user_id',session.user.id).maybeSingle());const saved=plain(row?.payload)?row.payload:{};
  const maps=[['steps','guide_steps',flows,false],['legacySteps','steps',legacy,true]];
  for(const [mine,remote,dict,old] of maps)for(const [k,v] of Object.entries(plain(saved[remote])?saved[remote]:{}))if(Object.hasOwn(dict,k)&&Number.isInteger(v)&&v>=0&&v<(old?dict[k].steps:dict[k]).length)progress[mine][k]=Math.max(progress[mine][k]||0,v);
  for(const [mine,remote,dict] of [['completed','guide_completed',flows],['legacyCompleted','completed',legacy]])for(const [k,v] of Object.entries(plain(saved[remote])?saved[remote]:{}))if(Object.hasOwn(dict,k)&&typeof v==='string'&&Number.isFinite(Date.parse(v))&&v>(progress[mine][k]||''))progress[mine][k]=v;
  for(const [mine,remote,dict] of [['favorites','guide_stars',flows],['legacyFavorites','favorites',legacy],['practiced','guide_practiced',flows]])if(Array.isArray(saved[remote]))progress[mine]=[...new Set([...progress[mine],...saved[remote].filter(k=>Object.hasOwn(dict,k))])];
  local();ok(await db.from('learning_state').upsert({user_id:session.user.id,payload:{...saved,steps:progress.legacySteps,completed:progress.legacyCompleted,favorites:progress.legacyFavorites,guide_steps:progress.steps,guide_completed:progress.completed,guide_stars:progress.favorites,guide_practiced:progress.practiced}},{onConflict:'user_id'}));status('#result',tr('내 기록을 합쳤어요.','Your records were merged.'));
 });
}

const rpc=(db,name,args={})=>db.rpc('guide_'+name,args).then(ok);
const b64=v=>typeof v==='string'&&v.length<=1_200_000&&/^[A-Za-z0-9+/]+={0,2}$/.test(v);
function attachment(m){if(!b64(m.media))return '';
 if(m.media_type==='image/jpeg'&&m.media.startsWith('/9j/'))return `<img width="360" height="220" loading="lazy" src="data:image/jpeg;base64,${m.media}" alt="${label('가족이 보낸 사진','Photo from family')}">`;
 if(m.media_type==='audio/wav'&&m.media.startsWith('UklGR'))return `<audio controls preload="none" aria-label="${label('가족이 보낸 음성 메시지','Voice message from family')}" src="data:audio/wav;base64,${m.media}"></audio>`;
 return '';
}
async function encodeMedia(file){if(!file?.size)return [null,null];
 if(file.type.startsWith('image/')){const data=await picture(file);if(!b64(data))throw Error();return ['image/jpeg',data];}
 if(file.size>900000)throw Error();const bytes=new Uint8Array(await file.arrayBuffer()),raw=Array.from(bytes.subarray(0,12),v=>String.fromCharCode(v)).join('');if(!raw.startsWith('RIFF')||raw.slice(8)!=='WAVE')throw Error();let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return ['audio/wav',btoa(text)];
}
async function family(node,page,db,session,go){
 const me=session.user.id,help=page==='help',rooms=ok(await db.from('guide_rooms').select('id,owner_id,title,kind').order('title').limit(50));
 if(!node.isConnected)return;
 if(!rooms.some(r=>r.id===activeRoom))activeRoom=rooms[0]?.id||'';
 const selected=rooms.find(r=>r.id===activeRoom),id=selected?.id,member=id?ok(await db.from('guide_members').select('user_id,display_name,lang,read_at').eq('room_id',id)):[];
 if(!node.isConnected)return;
 const owner=selected?.owner_id===me;
 const who=field('nick',tr('가족에게 보일 이름','Name shown to family'),'text','required maxlength="30" autocomplete="nickname"');
 const stage=progress.recent&&Object.hasOwn(flows,progress.recent)&&!['login','signup','verify','cert','simple'].includes(progress.recent)?`${t(progress.recent)} · ${t('step')} ${(progress.steps[progress.recent]||0)+1}/${flows[progress.recent].length}`:'';
 node.innerHTML=box(heading(page),`${help?note(tr('다른 앱은 캡처하지 않아요. 질문이나 현재 학습 단계만 보내요.','Other apps are not captured. Send a question or the current lesson step.')):
 `<details ${!id?'open':''}><summary>${label('가족 연결 · 대화 만들기','Connect family or create a chat')}</summary><div class="panel"><form id="join">${who}${field('code',tr('받은 초대 코드','Invite code'),'text','required maxlength="36" autocomplete="off" spellcheck="false"')}<button>${label('초대 수락','Accept invite')}</button></form><form id="create">${who}${field('title',tr('새 채팅방 이름','Chat name'),'text','required maxlength="50"')}<label class="field">${label('채팅 유형','Chat type')}<select name="kind"><option value="direct">${label('1:1 채팅','One to one')}</option><option value="group">${label('가족 단체 채팅','Family group')}</option></select></label><button>${label('채팅방 만들기','Create chat')}</button></form></div></details>`}
 <p class="notice" id="result" role="status"></p>${!id?`${note(t('empty'))}${help?goBtn('family',h(t('family'))):''}`:`<label class="field">${label('채팅방','Chat room')}<select id="room">${rooms.map(r=>`<option value="${h(r.id)}" ${id===r.id?'selected':''}>${h(r.title)}</option>`).join('')}</select></label>
 ${!help?`<details><summary>${label('가족 구성원과 초대','Members and invites')}</summary><div class="panel">${member.map(x=>`<p>${h(x.display_name)} · ${h(names[x.lang]||x.lang)}</p>`).join('')}${owner?`${action('invite',tr('한 번 쓸 초대 코드 만들기','Create one-use invite'))}<p class="notice" id="invite-result" role="status"></p>${member.some(x=>x.user_id!==me)?`<form id="remove"><label class="field">${label('연결 해제할 가족','Family member to remove')}<select name="member" required><option value="">—</option>${member.filter(x=>x.user_id!==me).map(x=>`<option value="${h(x.user_id)}">${h(x.display_name)}</option>`).join('')}</select></label><label class="check"><input type="checkbox" required> ${label('선택한 가족의 이 방 접근을 끊어요.','Remove access for the selected family member.')}</label><button>${label('연결 해제','Remove access')}</button></form>`:''}`:''}<form id="leave"><label class="check"><input type="checkbox" required> ${owner?label('방을 닫으면 모두의 대화가 삭제돼요.','Closing removes the chat for everyone.'):label('나가면 이 방에 접근할 수 없어요.','If you leave, you lose access to this chat.')}</label><button>${owner?label('채팅방 닫기','Close chat'):label('채팅방 나가기','Leave chat')}</button></form></div></details><label class="check"><input type="checkbox" id="help-only"> ${label('도움 요청만 보기','Show only help requests')}</label>`:''}
 <div class="thread" id="thread" aria-live="polite"></div><div class="row">${action('older',tr('이전 메시지','Older messages'))}${action('latest',tr('최신 메시지','Latest messages'))}</div>
 ${member.length<2?note(tr('가족이 연결되면 메시지를 보낼 수 있어요.','You can send messages after family joins.')):`<form class="panel" id="compose"><p class="muted">${h(t('privacy'))}</p><label class="field">${h(t(help?'question':'sms'))}<textarea name="message" maxlength="1200"></textarea></label>${help?(stage?`<label class="check"><input name="stage" type="checkbox"> ${label('현재 학습 단계도 보내기','Include current lesson step')}</label>`:''):`<label class="field">${label('사진 또는 WAV 음성 파일 한 개','One photo or WAV audio file')}<input type="file" name="attachment" accept="image/jpeg,image/png,image/webp,.wav"></label>`}<button class="primary">${h(t('preview'))}</button></form><section class="panel" id="send-preview" hidden></section>`}
 <p class="muted">${label('대화는 언어 자동 번역 없이 원문으로 표시돼요.','Messages are shown in their original language.')}</p>`}`);
 const {find,form,on,status}=controls(node);const mountRoom=()=>mount(node,page,go);
 form('#join',async f=>{if(!roomKey(f.code.value.trim())||!f.nick.value.trim())throw Error();activeRoom=await rpc(db,'accept',{code:f.code.value.trim(),nick:f.nick.value,locale:prefs.lang});await mountRoom();});
 form('#create',async f=>{if(!f.nick.value.trim()||!f.title.value.trim())throw Error();activeRoom=await rpc(db,'create_room',{label:f.title.value,room_kind:f.kind.value,nick:f.nick.value,locale:prefs.lang});await mountRoom();});
 if(!id)return;
 find('#room').onchange=async e=>{activeRoom=e.target.value;await mountRoom();};
 on('#invite',async()=>{const code=await rpc(db,'invite',{rid:id});status('#invite-result',code+' · '+tr('24시간 안에 한 사람만 쓸 수 있어요.','One person can use it within 24 hours.'));});
 form('#leave',async()=>{await rpc(db,'leave',{rid:id});activeRoom='';await mountRoom();});
 form('#remove',async f=>{await rpc(db,'leave',{rid:id,member:f.member.value});await mountRoom();});
 let before=null,nextBefore=null,fetching=false,hasMore=false,seen='';
 const people=new Map(member.map(x=>[x.user_id,x.display_name]));
 async function refresh(){
  if(!node.isConnected||find('#thread')!==thread||fetching)return;fetching=true;
  try{
   let q=db.from('guide_messages').select('id,sender_id,body,kind,lang,media_type,created_at').eq('room_id',id).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(21);
   if(before)q=q.lt('created_at',before);if(help||find('#help-only')?.checked)q=q.eq('kind','help');
   const msgs=ok(await q);if(!thread.isConnected)return;
   hasMore=msgs.length>20;nextBefore=msgs[19]?.created_at;find('#older').disabled=!hasMore;find('#latest').disabled=!before;
   const signature=JSON.stringify(msgs.map(m=>m.id));
   if(thread.dataset.signature!==signature){thread.dataset.signature=signature;thread.innerHTML=msgs.slice(0,20).reverse().map(m=>`<article class="message"><strong>${h(people.get(m.sender_id)||tr('이전 구성원','Former member'))}</strong><p class="muted">${h(date(m.created_at))} · ${h(names[m.lang]||m.lang)}${m.kind==='help'?' · '+h(t('help')):''}</p><p>${h(m.body)}</p>${m.media_type?`<button type="button" data-media="${h(m.id)}">${label('첨부 열기','Open attachment')}</button><div></div>`:''}</article>`).join('')||note(t('empty'));}
   if(!before&&msgs[0]?.created_at&&msgs[0].created_at!==seen){seen=msgs[0].created_at;await rpc(db,'read',{rid:id,seen});}
  }catch{if(thread.isConnected){thread.dataset.signature='';thread.innerHTML=note(err(),'warn');}}finally{fetching=false;}
 }
 const thread=find('#thread');
 thread.onclick=async e=>{const b=e.target.closest('button[data-media]');if(!b)return;b.disabled=true;try{const row=ok(await db.from('guide_messages').select('media,media_type').eq('room_id',id).eq('id',b.dataset.media).single());b.nextElementSibling.innerHTML=attachment(row)||note(tr('첨부를 보여 줄 수 없어요.','Attachment unavailable.'));}catch{b.nextElementSibling.innerHTML=note(err(),'warn');}finally{b.disabled=false;}};
 on('#older',async()=>{if(hasMore){before=nextBefore;await refresh();}});on('#latest',async()=>{before=null;await refresh();});
 if(find('#help-only'))find('#help-only').onchange=()=>{before=null;refresh();};
 form('#compose',async f=>{
  const text=[f.stage?.checked?stage:'',f.message.value.trim()].filter(Boolean).join('\n');const [mime,media]=await encodeMedia(f.attachment?.files[0]);if(!text&&!media){status('#result',tr('보낼 내용을 적어 주세요.','Enter a message to send.'));f.message.focus();return;}
  const preview=find('#send-preview');preview.hidden=false;preview.innerHTML=`<h2>${h(t('preview'))}</h2><p>${h(text)}</p>${media?attachment({media,media_type:mime}):''}<div class="row">${action('cancel-send',t('cancel'))}${action('send',t('send'),'primary')}</div>`;f.hidden=true;
  const cancel=()=>{preview.hidden=true;preview.innerHTML='';f.hidden=false;f.message.focus();};on('#cancel-send',cancel);on('#send',async()=>{await rpc(db,'send',{rid:id,message:text,msg_kind:help?'help':'message',locale:prefs.lang,translate_ok:false,mime,attachment:media});f.reset();cancel();status('#result',tr('가족에게 보냈어요.','Sent to your family.'));before=null;await refresh();});
 });
 await refresh();
 if(thread.isConnected)timer=setInterval(()=>{if(thread.isConnected)refresh();else{clearInterval(timer);timer=undefined;}},12000);
}

export async function mount(node,page,go){
 clearInterval(timer);timer=undefined;
 if(!node?.isConnected)return;
 if(page==='backup'){mountBackup(node);return;}
 try{
  const db=await client();if(!node.isConnected)return;
  if(!db){node.innerHTML=box(heading(page),`${note(t('not_ready'))}${goBtn('backup',h(t('legacy')))}`);return;}
  const {session}=ok(await db.auth.getSession());if(!node.isConnected)return;
  if(page==='profile'){await profile(node,db,session,go);return;}
  if(!session){node.innerHTML=box(heading(page),`${note(tr('가족과 연결하려면 내 계정으로 들어가 주세요.','Sign in to connect to family.'))}${goBtn('profile',h(t('profile')),'primary')}`);return;}
  await family(node,page,db,session,go);
 }catch{if(node.isConnected){node.innerHTML=box(heading(page),`${note(err(),'warn')}${action('try-again',tr('다시 열기','Try again'))}${goBtn('backup',h(t('legacy')))}`);node.querySelector('#try-again').onclick=()=>mount(node,page,go);}}
}
