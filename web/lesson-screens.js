import manifest from './lesson-screen-manifest.json';
import {h,tr,prefs} from './shared.js';

const reported=new Set();
export function resolveLessonContent(lessonId,deviceType,osVersion=''){
 const device={galaxy:'Galaxy',iphone:'iPhone',Galaxy:'Galaxy',iPhone:'iPhone'}[deviceType];
 if(!device||!Object.hasOwn(manifest,lessonId)||!Object.hasOwn(manifest[lessonId],device))return null;
 const langIndex=prefs.lang==='ko'?0:1;
 return {device,osVersion:String(osVersion),family:device==='Galaxy'?'Samsung Galaxy · One UI':'Apple iPhone · iOS',steps:manifest[lessonId][device].map(step=>({...step,url:`${import.meta.env.BASE_URL}lesson-screens/${step.paths[langIndex]}`}))};
}
export function reportMissingAsset(lesson,device,step){
 const key=`${lesson}/${device}/${step}`;
 if(!reported.has(key)){reported.add(key);console.warn(`[폰잘알] Missing lesson asset: ${key}`);}
}
export function verifyArtwork(step){
 if(!step?.url)return Promise.resolve(false);
 const img=new Image();img.src=step.url;
 return img.decode().then(()=>img.naturalWidth===step.width&&img.naturalHeight===step.height,()=>false);
}
export function DeviceScreenshotViewer(content,index,selection){
 const step=content?.steps[index];if(!step?.url)return '';
 const chosen=step.annotations[selection]||step.annotations[0], i=prefs.lang==='ko'?0:1;
 const position=`--mark-x:${chosen.x*100}%;--mark-y:${chosen.y*100}%;--mark-w:${chosen.width*100}%;--mark-h:${chosen.height*100}%`;
 const crop=[chosen.x*step.width-6,chosen.y*step.height-6,chosen.width*step.width+12,chosen.height*step.height+12];
 return `<figure class="course-figure lesson-visual" lang="${i===0?'ko':'en'}"><div class="lesson-image ${content.device==='Galaxy'?'one-ui':'ios-ui'}" style="${position}"><img data-lesson-art src="${h(step.url)}" alt="${h(step.title[i])}" width="${step.width}" height="${step.height}"><div class="mock-highlight lesson-rectangle" aria-hidden="true"><span>${selection+1}</span><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 1v15m-5-5l5 5 5-5"/></svg></div></div><figcaption>${h(content.family)} · ${h(tr('교육용 모의 화면 · 실제 모델·버전에 따라 달라요','Educational mock screen · real models and versions vary'))}</figcaption><div class="lesson-targets" role="group" aria-label="${h(tr('화면에서 볼 위치','Places to look on the screen'))}">${step.annotations.map((a,j)=>`<button type="button" data-course="mark:${j}" aria-pressed="${j===selection}">${j+1}. ${h(a.label[i])}</button>`).join('')}</div><p class="lesson-callout"><strong>${h(chosen.label[i])}</strong> · ${h(chosen.instruction[i])}</p><details><summary>${h(tr('표시된 부분 확대','Magnify the highlighted detail'))}</summary><svg class="lesson-zoom" role="img" aria-label="${h(chosen.label[i])}" viewBox="${crop.join(' ')}" width="${crop[2]}" height="${crop[3]}"><image href="${h(step.url)}" width="${step.width}" height="${step.height}"/></svg></details></figure>`;
}
