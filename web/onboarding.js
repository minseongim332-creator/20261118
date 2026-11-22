import {h,goBtn,prefs,t} from './shared.js';
import {line,b} from './brand.js';
import logo from '../assets/welcome-brand.webp';
import art from '../assets/welcome-family.webp';

const copy={
 ko:['어려웠던 스마트폰 사용법, 이제 하나씩 쉽게 배워보세요.','앱 시작하기','어떤 휴대폰을 쓰세요?','내 휴대폰과 같은 화면으로 연습해요.','기종 확인 방법','설정 → 휴대전화 정보','설정 → 일반 → 정보'],
 en:['Learn to use your smartphone, one step at a time.','Get started','Which phone do you use?','Practice with screens for your phone.','How to identify your phone','Settings → About phone','Settings → General → About'],
 vi:['Học cách dùng điện thoại thông minh, từng bước một.','Bắt đầu','Bạn dùng điện thoại nào?','Luyện tập trên màn hình giống điện thoại của bạn.','Cách nhận biết điện thoại','Cài đặt → Thông tin điện thoại','Cài đặt → Cài đặt chung → Giới thiệu'],
 ja:['むずかしかったスマホの使い方を、一つずつ学びましょう。','アプリを始める','どのスマホを使っていますか？','お使いの機種に合わせた画面で練習します。','機種の確認方法','設定 → 端末情報','設定 → 一般 → 情報'],
 'zh-CN':['一步一步，轻松学会使用智能手机。','开始使用','您用的是哪种手机？','在与您的手机相对应的界面上练习。','如何查看机型','设置 → 关于手机','设置 → 通用 → 关于本机'],
 th:['เรียนรู้การใช้สมาร์ตโฟนทีละขั้น','เริ่มใช้งาน','คุณใช้โทรศัพท์รุ่นไหน','ฝึกด้วยหน้าจอที่ตรงกับโทรศัพท์ของคุณ','วิธีตรวจสอบรุ่น','การตั้งค่า → เกี่ยวกับโทรศัพท์','การตั้งค่า → ทั่วไป → เกี่ยวกับ'],
 tl:['Matutong gumamit ng smartphone, isang hakbang sa bawat pagkakataon.','Magsimula','Anong telepono ang gamit mo?','Magsanay sa screen na akma sa telepono mo.','Paano alamin ang modelo','Mga Setting → Tungkol sa telepono','Mga Setting → Pangkalahatan → Tungkol dito'],
 mn:['Ухаалаг утсаа алхам алхмаар ашиглаж сураарай.','Эхлэх','Та ямар утас хэрэглэдэг вэ?','Өөрийн утсанд тохирсон дэлгэц дээр дадлага хийнэ.','Загвараа хэрхэн мэдэх вэ','Тохиргоо → Утасны тухай','Тохиргоо → Ерөнхий → Тухай'],
};
const words=()=>copy[prefs.lang]||copy.ko;
const devicePicture=(apple=false)=>`<svg aria-hidden="true" width="50" height="72" viewBox="0 0 50 72"><rect x="5" y="1" width="40" height="70" rx="${apple?11:6}" fill="#253935"/><rect x="8" y="4" width="34" height="64" rx="${apple?8:4}" fill="${apple?'#f1e9ff':'#e4f0fc'}"/>${apple?'<rect x="19" y="7" width="12" height="4" rx="2"/><path d="M20 64h10" stroke="#253935" stroke-width="2"/>':'<circle cx="25" cy="8" r="2"/><path d="M16 64h3m4 0h3m5 0h3" stroke="#253935" stroke-width="2"/>'}<path d="M14 23h22M14 32h22M14 41h16" stroke="${apple?'#7b6b9f':'#547b9e'}" stroke-width="2" stroke-linecap="round"/></svg>`;
export function WelcomeScreen(){const [desc,start]=words();return `<section class="entry-welcome"><h1 tabindex="-1" translate="no"><img class="entry-mark" src="${logo}" alt="폰잘알" width="221" height="221"></h1><p class="entry-tagline">${h(prefs.lang==='ko'?'스마트폰, 이제 어렵지 않아요!':desc)}</p><div class="entry-scene"><img class="entry-art" src="${art}" alt="" width="350" height="228" fetchpriority="high"></div><div class="entry-action">${goBtn(prefs.devicePicked?'home':'setup',h(start)+line('arrow',22),'primary entry-start')}</div></section>`;}
export function DeviceSetup(){const [, ,title,desc,identify,galaxy,iphone]=words();return `<section class="entry-setup"><h1 tabindex="-1">${h(title)}</h1><p>${h(desc)}</p><div class="entry-device-choices">${[['Galaxy','Samsung Galaxy',false],['iPhone','Apple iPhone',true]].map(([id,label,isApple])=>`<button type="button" data-action="device:${id}">${devicePicture(isApple)}<strong>${label}</strong></button>`).join('')}</div><details><summary>${h(b('unknown'))} · ${h(identify)}</summary><dl class="entry-identify"><div>${devicePicture()}<dt>Samsung Galaxy</dt><dd>${h(galaxy)}</dd></div><div>${devicePicture(true)}<dt>Apple iPhone</dt><dd>${h(iphone)}</dd></div></dl></details><div class="row"><button type="button" data-action="device:Unknown">${h(b('unknown'))}</button>${goBtn('welcome',h(t('previous')))}</div></section>`;}
