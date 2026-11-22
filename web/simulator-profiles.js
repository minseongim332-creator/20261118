import {h,tr} from './shared.js';

export const GalaxySimulator=Object.freeze({className:'one-ui',nav:'Ⅲ　 ○　 ‹',menu:['선택 메뉴','Selection toolbar'],keyboard:'galaxy'});
export const IPhoneSimulator=Object.freeze({className:'ios-ui',nav:'━━━━',menu:['편집 메뉴','Edit menu'],keyboard:'iphone'});
export const simulatorProfile=device=>device==='Galaxy'?GalaxySimulator:IPhoneSimulator;
export function SimulatorKeyboard(device){
 const profile=simulatorProfile(device);
 return `<details class="sim-keys ${profile.keyboard}"><summary>${h(tr('예시 숫자 키보드','Sample numeric keyboard'))}</summary><div class="sim-keygrid" role="group" aria-label="${h(tr('가상 숫자 키','Simulated number keys'))}">${[1,2,3,4,5,6,7,8,9,0].map(n=>`<button type="button" data-course="key:${n}">${n}</button>`).join('')}<button type="button" data-course="key:back">${h(tr('지우기','Delete'))}</button></div></details>`;
}
