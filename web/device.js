import {h,prefs,t,tr} from './shared.js';

const labels={
 display:['디스플레이','Display','Màn hình','ディスプレイ','显示','จอภาพ','Display','Дэлгэц'],
 brightness:['디스플레이 및 밝기','Display & Brightness','Màn hình & Độ sáng','画面表示と明るさ','显示与亮度','จอภาพและความสว่าง','Display at Brightness','Дэлгэц ба гэрэлтэлт'],
 fontSize:['글자 크기와 스타일','Font size and style','Cỡ font và kiểu font','文字サイズとフォントスタイル','字体大小和样式','ขนาดและรูปแบบตัวอักษร','Laki at estilo ng font','Үсгийн хэмжээ ба загвар'],
 textSize:['텍스트 크기','Text Size','Cỡ chữ','テキストサイズ','文字大小','ขนาดข้อความ','Laki ng Teksto','Бичвэрийн хэмжээ'],
 connections:['연결','Connections','Kết nối','接続','连接','การเชื่อมต่อ','Mga koneksyon','Холболтууд'],
 sample:['모의 화면 · 실제 위치나 이름은 버전에 따라 다를 수 있어요.','Sample screen · labels and locations may vary by version.','Màn hình mẫu · vị trí và tên có thể khác tùy phiên bản.','模擬画面 · バージョンにより位置や名前は異なります。','模拟画面 · 位置和名称可能因版本而异。','หน้าจอจำลอง · ตำแหน่งและชื่ออาจต่างกันตามเวอร์ชัน','Halimbawang screen · maaaring mag-iba ang pangalan at lokasyon ayon sa bersyon.','Жишээ дэлгэц · Нэр, байршил хувилбараас шалтгаалж өөр байж болно.'],
};
const specific=(k,apple)=>({store:apple?'App Store':'Google Play',gallery:apple?tr('사진','Photos'):tr('갤러리','Gallery'),share_photo:apple?tr('공유 버튼','Share button'):tr('공유','Share'),remove_app:apple?tr('앱 제거','Remove App'):tr('설치 삭제','Uninstall'),install_app:apple?tr('받기','Get'):tr('설치','Install')})[k];
export const deviceLabel=k=>labels[k]?.[['ko','en','vi','ja','zh-CN','th','tl','mn'].indexOf(prefs.lang)]??(prefs.device!=='Unknown'&&(['ko','en'].includes(prefs.lang)||k==='store')?specific(k,prefs.device==='iPhone'):null)??t(k);
export const deviceFlow=(k,flows)=>{
 if(prefs.device==='Unknown'||!['wifi','font'].includes(k))return flows[k];
 const apple=prefs.device==='iPhone';
 return k==='wifi'?(apple?flows.wifi:[flows.wifi[0],['tap','connections','⚙️'],...flows.wifi.slice(1)]):[flows.font[0],['tap',apple?'brightness':'display','☀️'],['tap',apple?'textSize':'fontSize','🔠'],flows.font[2]];
};
export const mockVersion=()=>prefs.device==='iPhone'?'iPhone · iOS 18':prefs.device==='Galaxy'?'Galaxy · One UI (Android)':'';
export function sampleScreen(name,idx,steps){
 if(prefs.device==='Unknown'||!['wifi','font','calls','camera','gallery','notifications','install_app','remove_app','share_photo','copy','login','signup','verify','cert'].includes(name))return '';
 const step=steps[idx],parent=idx?deviceLabel(steps[idx-1][1]):t('home');
 const apple=prefs.device==='iPhone',grid=idx===0&&['calls','camera','gallery','install_app','share_photo'].includes(name);
 const neighbors=grid?['camera','sms']:apple?['voice','settings']:['display','connections'];
 return `<figure class="lesson-figure"><div class="sample-screen ${apple?'iphone':'galaxy'}" aria-hidden="true"><div class="mock-top"><span>9:41</span><span>● ▰</span></div><strong>${h(parent)}</strong><div class="panel ${grid?'mock-grid':''}"><small class="mock-soft">${h(deviceLabel(neighbors[0]))}</small><div class="highlight"><span>➜</span> ${step[2]} ${h(deviceLabel(step[1]))}</div><small class="mock-soft">${h(deviceLabel(neighbors[1]))}</small></div><div class="mock-dock">${apple?'━':'‹　○　Ⅲ'}</div></div><figcaption>${h(mockVersion())} · ${h(deviceLabel('sample'))}</figcaption></figure>`;
}
export const deviceAdvice=k=>{
 if(prefs.device==='Unknown')return '';
 const apple=prefs.device==='iPhone';
 if(k===0||k===1)return [t('settings'),...(!apple?[deviceLabel('connections')]:[]),t('wifi')].join(' → ');
 if(k===3||k===4)return [t('settings'),deviceLabel(apple?'brightness':'display'),...(k===4?[deviceLabel(apple?'textSize':'fontSize')]:[])].join(' → ');
 if(k===7)return apple?tr('설정 → 일반 → iPhone 저장 공간','Settings → General → iPhone Storage'):tr('설정에서 ‘저장공간’을 검색해 보세요.','Search for “Storage” in Settings.');
 if(k===13)return [t('settings'),tr('알림','Notifications')].join(' → ');
 return '';
};
