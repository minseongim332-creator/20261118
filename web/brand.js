import {prefs,t,tr,h,goBtn,ico,progress} from './shared.js';
import art from '../assets/family.svg';
import familyPortrait from '../assets/welcome-family.webp';
const langs=['ko','en','vi','ja','zh-CN','th','tl','mn'];
const words={
 family:['가족 공간','Family space','Không gian gia đình','家族スペース','家庭空间','พื้นที่ครอบครัว','Espasyo ng pamilya','Гэр бүлийн орон зай'],
 help:['스마트폰 도움','Phone help','Trợ giúp điện thoại','スマホの使い方','手机帮助','ความช่วยเหลือเรื่องมือถือ','Tulong sa telepono','Утасны тусламж'],
 me:['내 정보','My phone','Điện thoại của tôi','マイページ','我的手机','มือถือของฉัน','Aking telepono','Миний утас'],
 notice:['알림','Notifications','Thông báo','通知','通知','การแจ้งเตือน','Mga abiso','Мэдэгдэл'],
 title:['혼자 배워도, 가족과 함께','Learn on your own, with family nearby','Tự học, có gia đình bên cạnh','ひとりで学んでも、家族がそばに','自己学，家人在身边','เรียนรู้ด้วยตัวเอง โดยมีครอบครัวอยู่ข้าง ๆ','Matuto nang mag-isa, kasama ang pamilya','Өөрөө сурч, гэр бүлтэйгээ холбоотой байгаарай'],
 subtitle:['내 휴대폰으로 차근차근. 막히면 가족에게 물어봐요.','Follow along on your phone. Ask family when you get stuck.','Từng bước trên điện thoại của bạn. Hỏi gia đình khi gặp khó khăn.','自分のスマホで一歩ずつ。困ったら家族に聞きましょう。','用自己的手机一步一步学，遇到困难就问家人。','ค่อย ๆ ทำตามบนมือถือของคุณ หากติดขัดให้ถามครอบครัว','Sundan sa sarili mong telepono. Magtanong sa pamilya kung nahihirapan.','Өөрийн утсаар алхам алхмаар дагаарай. Гацвал гэр бүлээсээ асуугаарай.'],
 start:['배우기 시작','Start learning','Bắt đầu học','学習を始める','开始学习','เริ่มเรียนรู้','Magsimulang matuto','Сурч эхлэх'],
 today:['오늘은 무엇을 해볼까요?','What would you like to do?','Hôm nay bạn muốn làm gì?','今日は何をしますか？','今天想做什么？','วันนี้อยากทำอะไร','Ano ang gusto mong gawin?','Өнөөдөр юу хийх вэ?'],
 unknown:['잘 모르겠어요','Not sure','Chưa rõ','よくわからない','不太确定','ยังไม่แน่ใจ','Hindi sigurado','Сайн мэдэхгүй'],
 model:['세부 모델','Model','Mẫu máy','機種名','型号','รุ่นเครื่อง','Modelo','Загвар'],
 os:['운영체제 버전','System version','Phiên bản hệ điều hành','OSのバージョン','系统版本','เวอร์ชันระบบ','Bersyon ng system','Системийн хувилбар'],
 contrast:['높은 명암 대비','High contrast','Độ tương phản cao','高コントラスト','高对比度','ความคมชัดสูง','Mataas na contrast','Өндөр ялгарал'],
 read:['현재 화면 듣기','Read this screen','Đọc màn hình này','この画面を読み上げる','朗读此屏幕','อ่านหน้าจอนี้','Basahin ang screen','Энэ дэлгэцийг унших'],
 languageLimit:['일부 상세 안내는 한국어 또는 영어로 보여요.','Some detailed instructions are in Korean or English.','Một số hướng dẫn chi tiết hiển thị bằng tiếng Hàn hoặc tiếng Anh.','一部の詳しい案内は韓国語または英語で表示されます。','部分详细说明以韩文或英文显示。','คำแนะนำโดยละเอียดบางส่วนแสดงเป็นภาษาเกาหลีหรืออังกฤษ','Ang ilang detalyadong gabay ay nasa Korean o English.','Зарим дэлгэрэнгүй заавар солонгос эсвэл англи хэлээр харагдана.'],
};
export const b=k=>words[k]?.[langs.indexOf(prefs.lang)]??words[k]?.[1]??t(k);
const icons={home:'M3 11l9-8 9 8v9h-6v-6H9v6H3z',family:'M3 20v-2a4 4 0 0 1 4-4h7a4 4 0 0 1 4 4v2M21 20v-2a4 4 0 0 0-3-4M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6m6-6a3 3 0 0 1 0 6',help:'M6 3h12v18H6zM10 17h4m-4-9c0-3 5-3 5 0 0 2-3 2-3 4',me:'M4 21v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8',bell:'M4 17h16l-2-3V9A6 6 0 0 0 6 9v5zm6 3h4',gear:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2',arrow:'M5 12h14m-6-6 6 6-6 6'};
export const line=(id,size=23)=>`<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="${icons[id]}"/></svg>`;
export function bottom(route){const current=['home','setup'].includes(route)?'home':['family','chat','notifications'].includes(route)?'family':['profile','settings','backup','favorites','resume','policy'].includes(route)?'me':'help';return `<nav class="bottom-nav" aria-label="${h(t('home'))}">${[['home','home',t('home')],['family','family',b('family')],['help','courses',b('help')],['me','profile',b('me')]].map(([id,to,label])=>`<a href="#${to}" data-go="${to}" ${id===current?'aria-current="page"':''}>${line(id)}<span>${h(label)}</span></a>`).join('')}</nav>`;}
const tile=(to,title,body,icon,tone)=>goBtn(to,`<span class="tile-icon">${icon}</span><span><strong>${h(title)}</strong><small>${h(body)}</small></span>${line('arrow',18)}`,'start-row '+tone);
export {art as familyArt};
export function brandHome(summary){return `<section class="home-board"><div class="home-greeting"><h1 tabindex="-1">${h(tr('안녕하세요!','Hello!'))}</h1><p>${h(b('subtitle'))}</p></div>
${goBtn('family',`<span><small>${h(b('family'))}</small><strong>${h(tr('우리 가족','My family'))} ${line('arrow',19)}</strong></span><img src="${familyPortrait}" alt="" width="350" height="228">`,'home-family-banner')}
<section class="home-main-actions" aria-label="${h(b('today'))}"><div class="home-card-grid">${tile('courses',tr('스마트폰 배우기','Learn smartphone basics'),t('pick'),ico('book',30),'blue')}${tile('sim',tr('직접 연습하기','Try it yourself'),t('sim_d'),line('help',30),'mint')}${tile('chat',tr('가족 채팅','Family chat'),b('family'),line('family',30),'peach')}${tile('safe',tr('보안 가이드','Safety guide'),t('safe'),ico('shield',30),'sand')}</div></section>
<section class="home-shortcuts"><h2>${h(tr('이런 것도 있어요!','More things to try'))}</h2><div class="home-quick-grid">${[['course/verify',tr('인증번호 확인','Check a code'),'shield'],['course/photo_attach',tr('사진 첨부','Attach a photo'),'picture'],['fix',t('fix'),'settings'],['help',t('help'),'heart'],['resume',t('resume'),'book'],['favorites',t('favorites'),'star']].map(([to,label,id])=>goBtn(to,`<span>${ico(id,24)||line('help',24)}</span>${h(label)}`)).join('')}</div></section>
${progress.recent?`<div class="continue-strip">${ico('book',20)} ${h(t('resume'))} ${goBtn('learn/'+progress.recent,h(progress.recent.startsWith('old:')?t('legacy'):t(progress.recent))+line('arrow',18))}</div>`:''}${summary}</section>`;}
