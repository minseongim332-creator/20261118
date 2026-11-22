import {h,tr} from './shared.js';
import manifest from '../official-lesson-assets.json';

const families={Galaxy:'galaxy',iPhone:'iphone'};
const records=new Map(manifest.assets.map(a=>[[a.device_family,a.lesson_id,a.step_id].join('/'),a]));
export function OfficialScreenshot(device,lesson,index){
 const family=families[device];
 const step=manifest.web_steps[lesson]?.[index];
 const record=records.get(`${family}/${lesson}/${step}`);
 const asset=record?.verification_status==='verified'?record:null;
 const source=manifest.sources[asset?.source_key??manifest.reference_source_keys[family]?.[lesson]];
 const heading=h(tr('공식 스크린샷','Official screenshot'));
 const external=(url,label)=>`<a class="button" href="${h(url)}" target="_blank" rel="noopener noreferrer">${h(label)}</a>`;
 const help=source?external(source.page,tr('제조사 공식 도움말 (새 탭)','Manufacturer guide (new tab)')):'';
 if(!asset)return `<section class="official-screen official-screen-empty"><h3>${heading}</h3><p>${h(tr('이 기종의 이 단계에 맞는 원본 화면을 아직 확인하지 못했어요.','A matching original screenshot has not been verified for this device and step.'))}</p>${help}</section>`;
 const label=tr(...asset.label);
 const original=external(asset.original_image_url,tr('제조사 원본 화면 열기 (새 탭)','Open original screenshot (new tab)'));
 const meta=`<p class="official-meta">${h(source.publisher)} · ${h(source.lang==='en'?tr('영어 화면','English screenshot'):tr('한국어 화면','Korean screenshot'))}</p>`;
 if(asset.license_status!=='verified')return `<section class="official-screen" data-official-source-only><h3>${heading}</h3>${meta}<p><strong>${h(label)}</strong></p><p>${h(tr('앱 안에서 표시할 권한이 확인되지 않아 제조사 원본 링크로 제공해요.','Open the manufacturer’s original. Permission to embed it has not been confirmed.'))}</p><div class="row">${original}${help}</div></section>`;
 const coords=asset.target?.map(x=>`${x*100}%`);
 const annotation=coords?`<span class="source-highlight" aria-hidden="true" style="left:${coords[0]};top:${coords[1]};width:${coords[2]};height:${coords[3]}"><b>${index+1} ↓</b></span>`:'';
 return `<figure class="official-screen"><h3>${heading}</h3>${meta}<div class="source-frame" style="--source-width:${Math.min(480,496*asset.width/asset.height)}px"><img data-official-image src="${h(asset.original_image_url)}" width="${asset.width}" height="${asset.height}" alt="${h(label)}" referrerpolicy="no-referrer">${annotation}</div><p data-official-error hidden role="status">${h(tr('원본 이미지를 불러오지 못했어요. 제조사 링크에서 확인해 주세요.','The image could not be loaded. Open the manufacturer link below.'))}</p><figcaption><strong>${h(label)}</strong><div class="row">${original}${help}</div></figcaption></figure>`;
}
