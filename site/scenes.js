// 폰잘알이 직접 그린 모의 화면. 실제 제조사 화면 캡처가 아니라 단계를 이해하기 위한 그림이다.
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const R=(x,y,w,h,f='#fff',rx=8,st='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${st}/>`;
const T=(x,y,s,z=13,f='#1d2b24',a='start',w=500)=>`<text x="${x}" y="${y}" font-size="${z}" fill="${f}" text-anchor="${a}" font-weight="${w}">${esc(s)}</text>`;
const E=(x,y,s,z=20)=>`<text x="${x}" y="${y}" font-size="${z}" text-anchor="middle" dominant-baseline="central">${s}</text>`;
const HL=(x,y,w,h,n,hand=true)=>`<g class="hlg"><rect class="pulse" x="${x-4}" y="${y-4}" width="${w+8}" height="${h+8}" rx="12" fill="rgba(246,168,0,.16)" stroke="#f6a800" stroke-width="3"/><circle cx="${x-2}" cy="${y-2}" r="11" fill="#f6a800"/>${T(x-2,y+2.5,n,12,'#2a1d05','middle',800)}${hand?E(x+w-8,y+h+4,'👆',24):''}</g>`;
const BLUE='#2f6fed',GRAY='#f2f4f7',LINE='#e3e6ea';

function frame(inner,dev){
 const iph=dev==='i';
 return `<svg viewBox="0 0 240 440" role="img" class="scene-svg"><rect x="2" y="2" width="236" height="436" rx="30" fill="#25302b"/><rect x="10" y="10" width="220" height="420" rx="23" fill="#fff"/>
 <clipPath id="sc"><rect x="10" y="10" width="220" height="420" rx="23"/></clipPath><g clip-path="url(#sc)">${R(10,10,220,28,'#fff',0)}${iph?R(88,14,64,16,'#111',8):`<circle cx="120" cy="22" r="5" fill="#111"/>`}${T(26,28,'9:41',10,'#333','start',700)}${T(214,28,'● ▮',9,'#333','end')}${inner}
 ${iph?R(84,420,72,4,'#333',2):''}</g></svg>`;
}
const APPS={set:['⚙️','설정','Settings','#c9ced6'],msg:['💬','문자','Messages','#8fe3a1'],cam:['📷','카메라','Camera','#d4d9e0'],pho:['🖼️','사진','Photos','#ffe29a'],tel:['📞','전화','Phone','#8fe3a1'],web:['🌐','인터넷','Internet','#a8c8ff'],store:['🛍️','','Store','#a8c8ff'],note:['📝','메모','Notes','#ffe9a3'],clock:['⏰','시계','Clock','#ffd0c2'],map:['🗺️','지도','Maps','#c8e8c0'],game:['🎮','게임','Games','#e5d2ff'],bank:['🏦','은행','Bank','#cfe3ff'],mail:['✉️','메일','Mail','#ffd9a8'],ppl:['👤','연락처','Contacts','#ffd0c2']};
function home(keys,hl,dev,L,extra=''){
 const order=keys;let out='';
 order.forEach((k,i)=>{const a=APPS[k],cx=22+(i%4)*52,cy=56+Math.floor(i/4)*72;
  const name=k==='store'?(dev==='i'?'App Store':'Play 스토어'):L({ko:a[1],en:a[2]});
  out+=R(cx,cy,42,42,a[3],11)+E(cx+21,cy+22,k==='store'&&dev==='i'?'🅰️':a[0],22)+T(cx+21,cy+58,name.length>6?name.slice(0,6):name,9,'#222','middle');
  if(k===hl)out+=HL(cx,cy,42,42,1);});
 const dock=['tel','msg','cam'];let d=R(18,356,204,52,'rgba(0,0,0,.08)',18);
 dock.forEach((k,i)=>{const cx=34+i*66;d+=R(cx,362,40,40,APPS[k][3],11)+E(cx+20,cy0(k),APPS[k][0],20);if(k===hl)d+=HL(cx,362,40,40,1);});
 return `${R(10,38,220,392,'#dfe9f7',0)}${out}${d}${extra}`;
}
const cy0=()=>383;
function bar(title,dev,L,back){return R(10,38,220,40,'#fff',0)+(dev==='i'?T(18,63,'‹ '+(back||L({ko:'뒤로',en:'Back'})),12,BLUE)+T(150,63,title,13,'#111','middle',700):T(20,63,'←',16)+T(44,63,title,14,'#111','start',700))+R(10,78,220,1,LINE,0);}
function rows(items,hl,y0=84,n=1,sw){
 let o='';items.forEach((s,i)=>{const y=y0+i*46;o+=R(10,y,220,46,'#fff',0)+R(10,y+45,220,1,LINE,0)+T(22,y+28,s,13)+(sw&&i===sw?R(184,y+13,32,20,'#34c759',10)+`<circle cx="205" cy="${y+23}" r="8" fill="#fff"/>`:T(212,y+28,'›',18,'#9aa3ad','end'));if(i===hl)o+=HL(12,y+2,216,42,n,true);});return o;
}
function dialog(title,btns,hl,body=''){
 let o=R(10,38,220,392,'rgba(0,0,0,.45)',0)+R(28,150,184,150,'#fff',16)+T(120,180,title,12.5,'#111','middle',700)+(body?T(120,200,body,10.5,'#555','middle'):'');
 btns.forEach((b,i)=>{const y=222+i*32;o+=R(40,y,160,26,i===0&&btns.length>1&&hl===0?BLUE:GRAY,13)+T(120,y+17,b,11.5,hl===i&&i===0?'#fff':'#222','middle',700);if(i===hl)o+=HL(40,y,160,26,1);});
 return o;
}
function form(fields,btn,hlF,hlB,title,L,dev,extra=''){
 let o=R(10,38,220,392,'#fff',0)+T(120,86,title,16,'#111','middle',800);
 fields.forEach((f,i)=>{const y=108+i*54;o+=T(24,y,f[0],10.5,'#666')+R(22,y+6,196,32,'#f7f8fa',8,`stroke="${LINE}"`)+T(32,y+27,f[1],12,f[2]||'#999');if(f[3])o+=T(206,y+27,f[3],14,'#666','end');if(hlF===i)o+=HL(22,y+6,196,32,1);});
 const by=108+fields.length*54+8;
 o+=R(22,by,196,38,BLUE,10)+T(120,by+24,btn,13,'#fff','middle',700);if(hlB)o+=HL(22,by,196,38,1);return o+extra;
}
function chat(msgs,input,hlK,L,dev,title){
 let o=bar(title,dev,L)+R(10,79,220,300,'#f5f7fb',0);
 msgs.forEach((m,i)=>{const y=96+i*50,me=m.me;o+=R(me?100:20,y,me?120:130,38,me?'#cfe1ff':'#fff',14)+T(me?110:30,y+23,m.t,11.5)});
 o+=R(10,380,220,50,'#fff',0)+R(10,380,220,1,LINE,0);
 o+=R(18,388,34,34,'#eef1f5',17)+E(35,405,'📷',17)+R(58,388,118,34,'#f1f3f6',17)+T(70,410,input||L({ko:'메시지',en:'Message'}),11,'#999')+R(182,388,40,34,BLUE,17)+E(202,405,'➤',14);
 if(hlK==='cam')o+=HL(18,388,34,34,1);if(hlK==='send')o+=HL(182,388,40,34,1);
 return o;
}
function concept(emoji,title,sub,mark){
 return R(10,38,220,392,'#f4f9ec',0)+E(120,170,emoji,86)+T(120,262,title,16,'#1d3d31','middle',800)+sub.split('|').map((s,i)=>T(120,288+i*20,s,11.5,'#445','middle')).join('')+(mark?E(190,110,mark,44):'');
}

export function sceneSvg(id,i,dev,L){
 const d=dev==='iphone'?'i':'g',D=dev==='iphone'?'i':'g';
 const st=d==='i'?'App Store':'Play 스토어';
 const HOME=['set','msg','cam','pho','web','store','note','map'];
 const S={
 touch:[()=>home(HOME,'cam',d,L,T(120,330,L({ko:'손가락으로 톡 한 번',en:'One light tap'}),12,'#244b3d','middle',700)),
  ()=>home(HOME,null,d,L)+R(10,38,220,392,'rgba(0,0,0,.18)',0)+R(24,150,100,72,'#fff',12)+T(34,176,L({ko:'앱 삭제',en:'Remove'}),11.5)+T(34,200,L({ko:'홈에 추가',en:'Add to Home'}),11.5)+R(70,118,42,42,APPS.cam[3],11)+E(91,139,'📷',22)+HL(70,118,42,42,1)+T(120,330,L({ko:'1초쯤 꾹 누르면 메뉴가 나와요',en:'Hold ~1 second to see a menu'}),11.5,'#fff','middle',700),
  ()=>bar(L({ko:'목록',en:'List'}),d,L)+rows(['A','B','C','D','E','F','G'],-1)+`<g><path d="M205 330 L205 160" stroke="#f6a800" stroke-width="6" stroke-linecap="round"/><path d="M193 175 L205 156 L217 175" fill="none" stroke="#f6a800" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>${E(205,350,'👆',30)}`+T(110,410,L({ko:'위아래로 밀기',en:'Slide up or down'}),12,'#244b3d','middle',700)],
 back:[()=>d==='i'?bar(L({ko:'사진',en:'Photos'}),d,L)+rows(['앨범','최근 항목','즐겨찾기'],-1)+HL(14,48,70,26,1):bar(L({ko:'설정',en:'Settings'}),d,L)+rows(['Wi-Fi','소리','화면'],-1)+R(10,396,220,34,'#f1f3f6',0)+T(60,418,'‹',18,'#333','middle')+T(120,418,'○',16,'#333','middle')+T(180,418,'|||',12,'#333','middle')+HL(42,398,36,30,1),
  ()=>d==='i'?bar(L({ko:'설정',en:'Settings'}),d,L)+rows(['Wi-Fi','소리'],-1)+`<path d="M120 420 L120 330" stroke="#f6a800" stroke-width="6" stroke-linecap="round"/><path d="M108 345 L120 326 L132 345" fill="none" stroke="#f6a800" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`+E(120,405,'👆',26)+T(120,300,L({ko:'맨 아래에서 위로 쓸기',en:'Swipe up from the bottom'}),11.5,'#244b3d','middle',700):bar(L({ko:'설정',en:'Settings'}),d,L)+rows(['Wi-Fi','소리'],-1)+R(10,396,220,34,'#f1f3f6',0)+T(60,418,'‹',18,'#333','middle')+T(120,418,'○',16,'#333','middle')+T(180,418,'|||',12,'#333','middle')+HL(102,398,36,30,1)],
 textsize:[()=>home(HOME,'set',d,L),
  ()=>bar(L({ko:'설정',en:'Settings'}),d,L)+rows(d==='i'?['Wi-Fi','디스플레이 및 밝기','소리']:['연결','소리','디스플레이'],d==='i'?1:2),
  ()=>bar(d==='i'?'텍스트 크기':'글자 크기 및 스타일',d,L)+T(120,140,L({ko:'가나다 글씨 미리보기',en:'Sample text preview'}),16,'#111','middle',700)+R(34,250,172,8,'#dfe3e8',4)+R(34,250,120,8,BLUE,4)+`<circle cx="154" cy="254" r="14" fill="#fff" stroke="${BLUE}" stroke-width="4"/>`+T(34,285,'가',11,'#555')+T(206,288,'가',19,'#555','end')+HL(134,238,40,32,1)],
 wifi:[()=>d==='i'?home(HOME,'set',d,L):home(HOME,null,d,L)+R(10,38,220,120,'#2a2f36',0)+E(40,78,'📶',22)+E(90,78,'🔦',22)+E(140,78,'🔕',22)+E(200,78,'⚙️',24)+HL(184,62,32,32,1)+T(120,125,L({ko:'위에서 아래로 쓸기',en:'Swipe down from the top'}),11,'#fff','middle'),
  ()=>bar(L({ko:'설정',en:'Settings'}),d,L)+(d==='i'?rows(['Wi-Fi','블루투스','셀룰러'],0):rows(['연결','소리와 진동','알림'],0)),
  ()=>{const w=['집 Wi-Fi','Cafe_free','Guest_5G'];const top=d==='i'?bar('Wi-Fi',d,L):bar(L({ko:'Wi-Fi',en:'Wi-Fi'}),d,L);return top+(d==='i'?'':R(10,84,220,46,'#fff',0)+T(22,112,'Wi-Fi',13)+R(180,97,36,20,'#34c759',10)+`<circle cx="206" cy="107" r="8" fill="#fff"/>`+HL(176,92,44,30,1,false))+rows(w.map(x=>'📶  '+x),0,d==='i'?84:136,d==='i'?1:2);},
  ()=>bar('Wi-Fi',d,L)+rows(['✔  집 Wi-Fi','📶  Cafe_free','📶  Guest_5G'],-1)+R(10,84,220,46,'#fff',0)+T(22,112,'✔  집 Wi-Fi',13,BLUE,'start',800)+T(120,330,L({ko:'파란 체크 = 연결됨',en:'Blue check = connected'}),12,'#244b3d','middle',700)],
 account:[()=>concept('🪪',L({ko:'아이디',en:'ID'}),L({ko:'나를 부르는 이름|가입할 때 내가 정해요',en:'The name that calls you|You choose it when signing up'})),
  ()=>concept('🔑',L({ko:'비밀번호',en:'Password'}),L({ko:'나만 아는 열쇠|맞아야 문이 열려요',en:'Your own key|It must match to open the door'})),
  ()=>concept('🛡️',L({ko:'지켜 주세요',en:'Keep it safe'}),L({ko:'쉽게 짐작하지 못하게 정해요|알려 달라는 말에는 답하지 않아요',en:'Make it hard to guess|Never share it when asked'}),'🚫')],
 login:[()=>form([[L({ko:'아이디',en:'ID'}),'abc123'],[L({ko:'비밀번호',en:'Password'}),'••••••','#333','👁']],L({ko:'로그인',en:'Log in'}),-1,false,L({ko:'로그인',en:'Log in'}),L,d)+T(120,350,L({ko:'이미 만든 계정으로 들어가요',en:'Enter with an existing account'}),11,'#244b3d','middle',700),
  ()=>form([[L({ko:'아이디',en:'ID'}),L({ko:'여기를 눌러 쓰기',en:'Tap here to type'})],[L({ko:'비밀번호',en:'Password'}),'','#333','👁']],L({ko:'로그인',en:'Log in'}),0,false,L({ko:'로그인',en:'Log in'}),L,d),
  ()=>form([[L({ko:'아이디',en:'ID'}),'abc123','#333'],[L({ko:'비밀번호',en:'Password'}),'••••••','#333','👁']],L({ko:'로그인',en:'Log in'}),1,false,L({ko:'로그인',en:'Log in'}),L,d)+T(206,250,L({ko:'눈 모양: 글자 보기',en:'Eye: show text'}),9.5,'#244b3d','end'),
  ()=>form([[L({ko:'아이디',en:'ID'}),'abc123','#333'],[L({ko:'비밀번호',en:'Password'}),'••••••','#333','👁']],L({ko:'로그인',en:'Log in'}),-1,true,L({ko:'로그인',en:'Log in'}),L,d)],
 signup:[()=>R(10,38,220,392,'#fff',0)+R(26,70,188,36,GRAY,18)+R(30,74,88,28,'#fff',14)+T(74,92,L({ko:'로그인',en:'Log in'}),12,'#555','middle')+R(122,74,88,28,BLUE,14)+T(166,92,L({ko:'회원가입',en:'Sign up'}),12,'#fff','middle',700)+HL(122,74,88,28,1)+T(120,160,L({ko:'처음이라면 회원가입',en:'First time? Sign up'}),13,'#244b3d','middle',700),
  ()=>form([[L({ko:'아이디',en:'ID'}),'새 아이디'],[L({ko:'비밀번호',en:'Password'}),'••••••••','#333'],[L({ko:'비밀번호 확인',en:'Confirm'}),'••••••••','#333']],L({ko:'다음',en:'Next'}),0,false,L({ko:'가입 정보',en:'Account'}),L,d)+HL(22,208,196,32,2,false),
  ()=>R(10,38,220,392,'#fff',0)+T(120,86,L({ko:'약관 동의',en:'Terms'}),16,'#111','middle',800)+[['☑ '+L({ko:'(필수) 이용약관',en:'(Required) Terms'}),0],['☑ '+L({ko:'(필수) 개인정보',en:'(Required) Privacy'}),1],['☐ '+L({ko:'(선택) 광고 수신',en:'(Optional) Ads'}),2]].map(([s,k])=>R(22,110+k*50,196,40,'#f7f8fa',8)+T(34,135+k*50,s,12)).join('')+HL(22,110,196,90,1,false)+T(120,290,L({ko:'선택은 안 해도 돼요',en:'Optional can stay off'}),11,'#244b3d','middle',700),
  ()=>form([[L({ko:'인증번호',en:'Code'}),'1 2 3 4 5 6','#333']],L({ko:'확인',en:'Confirm'}),0,false,L({ko:'가입 확인',en:'Verify'}),L,d)+T(120,260,L({ko:'문자로 받은 숫자를 써요',en:'Type the number from the text'}),11,'#244b3d','middle',700)],
 recover:[()=>form([[L({ko:'아이디',en:'ID'}),'abc123','#333'],[L({ko:'비밀번호',en:'Password'}),'','#333']],L({ko:'로그인',en:'Log in'}),-1,false,L({ko:'로그인',en:'Log in'}),L,d,T(120,286,L({ko:'비밀번호 찾기',en:'Forgot password'}),12.5,BLUE,'middle',700)+HL(60,270,120,24,1)),
  ()=>R(10,38,220,392,'#fff',0)+T(120,86,L({ko:'본인 확인',en:'Verify it is you'}),16,'#111','middle',800)+R(24,110,192,50,'#f7f8fa',10)+T(40,140,'📱 '+L({ko:'전화번호로 받기',en:'By phone'}),12.5)+R(24,172,192,50,'#f7f8fa',10)+T(40,202,'✉️ '+L({ko:'이메일로 받기',en:'By email'}),12.5)+HL(24,110,192,50,1,false),
  ()=>form([[L({ko:'새 비밀번호',en:'New password'}),'••••••••','#333'],[L({ko:'한 번 더',en:'Again'}),'••••••••','#333']],L({ko:'바꾸기',en:'Change'}),-1,true,L({ko:'새 비밀번호',en:'New password'}),L,d)],
 sms:[()=>form([[L({ko:'전화번호',en:'Phone'}),'010-1234-5678','#333']],L({ko:'인증번호 받기',en:'Get code'}),-1,true,L({ko:'본인 확인',en:'Verify'}),L,d)+T(120,300,L({ko:'누르면 문자가 와요',en:'A text will arrive'}),11,'#244b3d','middle',700),
  ()=>bar(L({ko:'문자',en:'Messages'}),d,L)+['안내','가족','택배'].map((s,k)=>R(10,84+k*54,220,54,'#fff',0)+E(36,111+k*54,'💬',22)+T(60,106+k*54,s,13,'#111','start',700)+T(60,125+k*54,k===0?L({ko:'[인증] 123456 입니다',en:'[Code] 123456'}):'...',10.5,'#777')).join('')+HL(12,86,216,50,1,true),
  ()=>bar(L({ko:'안내',en:'Info'}),d,L)+R(10,79,220,350,'#f5f7fb',0)+R(20,100,170,60,'#fff',14)+T(30,124,L({ko:'[인증번호]',en:'[Code]'}),11,'#666')+T(30,148,'123456',22,'#111','start',800)+HL(28,128,92,28,1,false)+R(20,190,200,48,'#fff1f0',10,'stroke="#e5484d"')+T(30,211,'🚫 '+L({ko:'이 숫자는 아무에게도',en:'Never tell this number'}),11,'#b42318','start',700)+T(30,228,L({ko:'알려 주지 않아요',en:'to anyone'}),11,'#b42318','start',700),
  ()=>form([[L({ko:'인증번호',en:'Code'}),'1 2 3 4 5 6','#333']],L({ko:'확인',en:'Confirm'}),0,false,L({ko:'숫자 입력',en:'Enter code'}),L,d)],
 sendsms:[()=>bar(L({ko:'문자',en:'Messages'}),d,L)+rows(['가족','친구'],-1)+R(176,370,44,44,BLUE,22)+E(198,392,'✏️',20)+HL(176,370,44,44,1),
  ()=>R(10,38,220,392,'#fff',0)+T(120,64,L({ko:'새 메시지',en:'New message'}),14,'#111','middle',800)+T(22,100,L({ko:'받는 사람',en:'To'}),11,'#666')+R(22,106,196,34,'#f7f8fa',8)+T(32,128,'010-1234-5678',12.5,'#333')+HL(22,106,196,34,1,false)+T(120,170,L({ko:'번호를 한 번 더 확인해요',en:'Double-check the number'}),11,'#244b3d','middle',700),
  ()=>chat([{t:L({ko:'안녕하세요',en:'Hello'}),me:true}],L({ko:'내용 쓰기',en:'Write here'}),'send',L,d,L({ko:'가족',en:'Family'}))],
 sendphoto:[()=>chat([{t:L({ko:'안녕하세요',en:'Hello'})}],'', 'cam',L,d,L({ko:'가족',en:'Family'})),
  ()=>R(10,38,220,392,'#fff',0)+T(120,64,L({ko:'사진 고르기',en:'Pick a photo'}),14,'#111','middle',800)+[0,1,2,3,4,5].map(k=>R(18+(k%3)*68,84+Math.floor(k/3)*68,62,62,['#f9d6a5','#bfe3c0','#c4d7f5','#f5c4d8','#e5d9f2','#fde8a0'][k],8)+E(49+(k%3)*68,115+Math.floor(k/3)*68,['🌸','🍚','🏞️','👶','🐶','🌅'][k],26)).join('')+HL(18,84,62,62,1,true)+T(120,250,L({ko:'신분증·통장은 고르지 않아요',en:'Do not pick ID or bank photos'}),11,'#b42318','middle',700),
  ()=>chat([{t:L({ko:'🌸  (사진)',en:'🌸 (photo)'}),me:true}],'','send',L,d,L({ko:'가족',en:'Family'}))],
 copypaste:[()=>R(10,38,220,392,'#fff',0)+T(24,100,L({ko:'오늘 모임은',en:'Today we meet at'}),14)+R(24,112,110,26,'#b9d3ff',4)+T(30,131,L({ko:'서울역 3번 출구',en:'Seoul Stn Exit 3'}),13)+T(140,131,L({ko:'에서',en:''}),14)+HL(24,112,110,26,1),
  ()=>R(10,38,220,392,'#fff',0)+T(24,100,L({ko:'오늘 모임은',en:'Today we meet at'}),14)+R(24,112,110,26,'#b9d3ff',4)+T(30,131,L({ko:'서울역 3번 출구',en:'Seoul Stn Exit 3'}),13)+`<circle cx="24" cy="146" r="5" fill="${BLUE}"/><circle cx="134" cy="146" r="5" fill="${BLUE}"/>`+R(40,160,150,34,'#2b2f36',10)+T(80,182,L({ko:'복사',en:'Copy'}),12.5,'#fff','middle',700)+T(150,182,L({ko:'전체 선택',en:'Select all'}),10.5,'#bbb','middle')+HL(52,160,56,34,1),
  ()=>R(10,38,220,392,'#fff',0)+T(24,100,L({ko:'메모',en:'Note'}),12,'#666')+R(22,108,196,60,'#f7f8fa',8)+R(40,176,150,34,'#2b2f36',10)+T(80,198,L({ko:'붙여넣기',en:'Paste'}),12.5,'#fff','middle',700)+T(150,198,L({ko:'취소',en:'Cancel'}),10.5,'#bbb','middle')+HL(52,176,60,34,1)],
 cert:[()=>concept('🪪',L({ko:'공동인증서',en:'Digital certificate'}),L({ko:'인터넷에서 나를 증명하는|전자 신분증이에요',en:'An electronic ID that proves|who you are online'})),
  ()=>R(10,38,220,392,'#fff',0)+T(120,100,L({ko:'은행 앱',en:'Bank app'}),16,'#111','middle',800)+R(24,150,192,44,BLUE,12)+T(120,178,L({ko:'인증서로 로그인',en:'Log in with certificate'}),13,'#fff','middle',700)+HL(24,150,192,44,1),
  ()=>concept('🔒',L({ko:'비밀번호는 비밀',en:'Keep it secret'}),L({ko:'누구에게도 알려 주지 않고|이 앱에도 입력하지 않아요',en:'Tell no one|and never type it into this app'}),'🚫')],
 install:[()=>home(HOME,'store',d,L),
  ()=>R(10,38,220,392,'#fff',0)+R(22,56,196,38,'#f1f3f6',19)+T(40,80,'🔍 '+L({ko:'앱 이름 검색',en:'Search app name'}),12,'#555')+HL(22,56,196,38,1,false)+R(22,120,196,56,'#f7f8fa',12)+E(50,148,'🧩',26)+T(80,142,L({ko:'찾는 앱',en:'The app'}),13,'#111','start',700)+T(80,160,L({ko:'앱 이름을 쓰면 나와요',en:'It shows up'}),10.5,'#777')+(d==='i'?R(10,396,220,34,'#f6f6f8',0)+T(120,418,'오늘   게임   앱   검색',10.5,'#555','middle'):''),
  ()=>R(10,38,220,392,'#fff',0)+E(48,92,'🧩',36)+T(84,86,L({ko:'찾는 앱',en:'The app'}),15,'#111','start',800)+T(84,106,L({ko:'무료',en:'Free'}),11,'#777')+R(150,130,68,30,BLUE,15)+T(184,150,d==='i'?L({ko:'받기',en:'Get'}):L({ko:'설치',en:'Install'}),12.5,'#fff','middle',700)+HL(150,130,68,30,1)+T(120,210,L({ko:'가격이 적힌 앱은 돈이 들 수 있어요',en:'Priced apps may cost money'}),10.5,'#b42318','middle',700)],
 remove:[()=>home(HOME,'game'==='x'?null:'web',d,L)+R(10,38,220,392,'rgba(0,0,0,.12)',0)+R(76,104,42,42,APPS.web[3],11)+E(97,125,'🌐',22)+HL(76,104,42,42,1)+T(120,330,L({ko:'지울 앱을 꾹 누르기',en:'Hold the app to remove'}),12,'#fff','middle',700),
  ()=>R(10,38,220,392,'#dfe9f7',0)+R(76,104,42,42,APPS.web[3],11)+E(97,125,'🌐',22)+R(60,156,120,66,'#fff',12)+T(72,182,d==='i'?L({ko:'앱 제거',en:'Remove App'}):L({ko:'설정',en:'Settings'}),12)+T(72,208,d==='i'?L({ko:'앱 삭제',en:'Delete App'}):L({ko:'삭제',en:'Remove'}),12,'#d92d20','start',700)+HL(62,190,116,26,1),
  ()=>dialog(L({ko:'이 앱을 삭제할까요?',en:'Delete this app?'}),[L({ko:'삭제',en:'Delete'}),L({ko:'취소',en:'Cancel'})],0,L({ko:'앱 안의 기록도 사라질 수 있어요',en:'Its data may be lost'}))],
 permission:[()=>dialog(L({ko:'카메라를 사용해도 될까요?',en:'Allow Camera access?'}),[L({ko:'허용',en:'Allow'}),L({ko:'허용 안 함',en:"Don't allow"})],-1,L({ko:'이것이 권한 요청이에요',en:'This is a permission request'})),
  ()=>dialog(L({ko:'카메라를 사용해도 될까요?',en:'Allow Camera access?'}),[L({ko:'허용',en:'Allow'}),L({ko:'허용 안 함',en:"Don't allow"})],0,L({ko:'꼭 필요할 때만 허용해요',en:'Only when really needed'})),
  ()=>dialog(L({ko:'위치를 알려 줄까요?',en:'Share your location?'}),[L({ko:'허용',en:'Allow'}),L({ko:'허용 안 함',en:"Don't allow"})],1,L({ko:'이유를 모르면 허용 안 함',en:'Unsure why? Choose Do not allow'}))],
 scam:[()=>R(10,38,220,392,'#f5f7fb',0)+R(20,110,196,92,'#fff',14)+T(30,134,L({ko:'[택배] 주소 확인 필요',en:'[Parcel] Address needed'}),11.5)+T(30,158,'http://abc.xyz/1',12,'#2f6fed')+E(190,150,'🚫',26)+T(120,250,L({ko:'모르는 링크는 누르지 않아요',en:'Do not tap unknown links'}),12,'#b42318','middle',700),
  ()=>concept('🔢',L({ko:'인증번호는 비밀',en:'Codes are secret'}),L({ko:'은행·공공기관도 문자로|인증번호를 묻지 않아요',en:'Banks and agencies never ask|for codes by text'}),'🚫'),
  ()=>concept('📞',L({ko:'직접 찾은 번호로',en:'Use an official number'}),L({ko:'문자 속 번호가 아니라|공식 번호로 전화해 확인해요',en:'Not the number in the text|Call an official number'}))],
 gov:[()=>R(10,38,220,392,'#fff',0)+R(22,56,196,38,'#f1f3f6',19)+T(40,80,'🔍 '+L({ko:'서비스 이름',en:'Service name'}),12,'#555')+R(22,116,196,58,'#f7f8fa',10)+T(32,140,L({ko:'○○ 신청 안내',en:'Service guide'}),12.5,'#111','start',700)+T(32,160,'www.example.go.kr',11,'#1a7f37','start',700)+HL(22,116,196,58,1,false)+T(120,210,L({ko:'주소 끝이 go.kr 인지 확인',en:'Check the address ends in go.kr'}),10.5,'#244b3d','middle',700),
  ()=>bar(L({ko:'신청 안내',en:'How to apply'}),d,L)+rows([L({ko:'① 신청 자격',en:'1 Eligibility'}),L({ko:'② 필요 서류',en:'2 Documents'}),L({ko:'③ 신청 기간',en:'3 Period'})],-1)+HL(12,86,216,42,1,false),
  ()=>bar(L({ko:'내 신청',en:'My applications'}),d,L)+rows([L({ko:'처리 상태',en:'Status'}),L({ko:'신청 내역',en:'History'})],0)],
 form:[()=>form([[L({ko:'이름 *',en:'Name *'}),L({ko:'꼭 써야 해요',en:'Required'})],[L({ko:'전화번호 *',en:'Phone *'}),'010-0000-0000'],[L({ko:'메모',en:'Note'}),L({ko:'선택',en:'Optional'})]],L({ko:'제출',en:'Submit'}),-1,false,L({ko:'신청서',en:'Form'}),L,d)+HL(22,114,196,32,1,false),
  ()=>form([[L({ko:'이름 *',en:'Name *'}),L({ko:'예: 김가짜',en:'e.g. Sample'})],[L({ko:'전화번호 *',en:'Phone *'}),'010-0000-0000'],[L({ko:'메모',en:'Note'}),'']],L({ko:'제출',en:'Submit'}),1,false,L({ko:'신청서',en:'Form'}),L,d),
  ()=>form([[L({ko:'이름 *',en:'Name *'}),'김가짜','#333'],[L({ko:'전화번호 *',en:'Phone *'}),'010-0000-0000','#333'],[L({ko:'메모',en:'Note'}),'','#333']],L({ko:'제출',en:'Submit'}),-1,true,L({ko:'신청서',en:'Form'}),L,d)+T(120,350,L({ko:'누르기 전에 한 번 훑어봐요',en:'Review before pressing'}),11,'#244b3d','middle',700)]
 };
 const f=S[id]?.[i];if(!f)return '';
 try{return frame(f(),d);}catch(e){return '';}
}
