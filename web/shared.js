import content from './content.json';

export const {words,names,legacy,checks,cards,paths}=content;
export const flows={...content.flows,notifications:[['open','settings','⚙️'],['tap','notifications','🔔'],['tap','sample_notice','🔔']],install_app:[['open','store','▦'],['tap','search','⌕'],['tap','install_app','↓']],share_photo:[['open','gallery','▧'],['tap','sample_pic','▧'],['tap','share_photo','↗']],remove_app:[['hold','select','▦'],['tap','remove_app','−'],['tap','confirm','✓']]};
Object.assign(words,{
 notifications:['알림 설정','Notifications','Thông báo','通知','通知','การแจ้งเตือน','Mga abiso','Мэдэгдэл'],
 sample_notice:['연습 앱의 알림','Practice app notifications','Thông báo ứng dụng mẫu','練習アプリの通知','练习应用通知','การแจ้งเตือนแอปฝึกหัด','Mga abiso ng pagsasanay','Дадлагын аппын мэдэгдэл'],
 store:['앱 스토어','App store','Cửa hàng ứng dụng','アプリストア','应用商店','ร้านแอป','Tindahan ng app','Аппын дэлгүүр'],
 install_app:['앱 설치','Install an app','Cài ứng dụng','アプリを入れる','安装应用','ติดตั้งแอป','Mag-install ng app','Апп суулгах'],
 remove_app:['앱 삭제','Remove an app','Xóa ứng dụng','アプリを削除','移除应用','ลบแอป','Mag-alis ng app','Апп устгах'],
 share_photo:['사진 공유','Share a photo','Chia sẻ ảnh','写真を共有','分享照片','แชร์รูปภาพ','Magbahagi ng larawan','Зураг хуваалцах'],
});
const key='smartphone-guide.web.v1';
const known=Object.keys(names);
function get(key){try{return JSON.parse(localStorage.getItem(key))}catch{return null}}
const data=get(key)||{};
const urlLang=new URLSearchParams(location.search).get('lang');
export const prefs={lang:'ko',size:'normal',device:'Unknown',devicePicked:false,model:'',os:'',contrast:false,voice:true,speed:.9,...data.prefs};
prefs.lang=known.includes(urlLang)?urlLang:known.includes(prefs.lang)?prefs.lang:'ko';
export const progress={steps:{},completed:{},favorites:[],recent:'',practiced:[],legacySteps:{},legacyCompleted:{},legacyFavorites:[],legacyQuiz:{},...data.progress};
export const local=()=>{try{localStorage.setItem(key,JSON.stringify({prefs,progress}));return true}catch{return false}};
export const t=(key)=>words[key]?.[known.indexOf(prefs.lang)]??key;
export const tr=(ko,en)=>prefs.lang==='ko'?ko:en;
export const h=(v='')=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
export const glyph=(key)=>flows[key]?.[0][2]||'📚';
export const ico=(key,size=24)=>paths[key]?`<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[key]}"/></svg>`:'';
export const goBtn=(route,label,cls='')=>`<a href="#${h(route)}" class="button ${cls}" data-go="${h(route)}">${label}</a>`;
export const action=(id,label,cls='',attrs='')=>`<button type="button" class="${cls}" data-action="${h(id)}" ${attrs}>${label}</button>`;
export const note=(text,tone='')=>`<p class="notice ${tone}" role="status">${h(text)}</p>`;
export const field=(name,label,type='text',attrs='')=>`<label class="field"><span>${h(label)}</span><input name="${name}" type="${type}" ${attrs}></label>`;
export const box=(title,inner)=>`<section class="section"><h1 tabindex="-1">${h(title)}</h1>${inner}</section>`;
export const date=(value)=>{try{return new Intl.DateTimeFormat(prefs.lang,{dateStyle:'short',timeStyle:'short'}).format(new Date(value))}catch{return ''}};
export const instruction=([kind,target],label=t)=>{
  const noun=label(target);
  if(prefs.lang==='ko'&&['open','tap','look'].includes(kind)){
    const last=noun.charCodeAt(noun.length-1);const end=last>=0xac00&&last<=0xd7a3&&(last-0xac00)%28;
    return `「${noun}」${end?'을':'를'} ${{open:'열어요',tap:'눌러요',look:'확인해요'}[kind]}.`;
  }
  return t(kind).replace('{x}',noun);
};
export function speak(text,lang=prefs.lang){
  if(lang==='tl')lang='fil';
  const player=window.speechSynthesis;
  if(!player)return false;
  const voices=player.getVoices().filter(v=>v.localService),family=lang.split('-')[0].toLowerCase();
  const voice=voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().split('-')[0]===family&&(lang!=='zh-CN'||/zh-(cn|hans|sg)/i.test(v.lang)));
  if(!voice)return false;
  const line=new SpeechSynthesisUtterance(text);line.voice=voice;line.lang=voice.lang;line.rate=Number(prefs.speed)||.9;player.cancel();player.speak(line);return true;
}
