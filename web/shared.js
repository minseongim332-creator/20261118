import content from './content.json';

export const {words,names,flows,legacy,checks,cards,paths}=content;
const key='smartphone-guide.web.v1';
const known=Object.keys(names);
function get(key){try{return JSON.parse(localStorage.getItem(key))}catch{return null}}
const data=get(key)||{};
const urlLang=new URLSearchParams(location.search).get('lang');
export const prefs={lang:'ko',size:'normal',device:'Galaxy',voice:true,speed:.9,...data.prefs};
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
export const instruction=([kind,target])=>{
  const noun=t(target);
  if(prefs.lang==='ko'&&['open','tap','look'].includes(kind)){
    const last=noun.charCodeAt(noun.length-1);const end=last>=0xac00&&last<=0xd7a3&&(last-0xac00)%28;
    return `「${noun}」${end?'을':'를'} ${{open:'열어요',tap:'눌러요',look:'확인해요'}[kind]}.`;
  }
  return t(kind).replace('{x}',noun);
};
export function speak(text,lang=prefs.lang){
  const player=window.speechSynthesis;
  if(!player)return false;
  const voices=player.getVoices(),family=lang.split('-')[0].toLowerCase();
  const voice=voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().split('-')[0]===family&&(lang!=='zh-CN'||/zh-(cn|hans|sg)/i.test(v.lang)));
  if(!voice)return false;
  const line=new SpeechSynthesisUtterance(text);line.voice=voice;line.lang=voice.lang;line.rate=Number(prefs.speed)||.9;player.cancel();player.speak(line);return true;
}
