import {readFileSync} from 'node:fs';
import {courses} from '../web/curriculum-data.js';

const registry=JSON.parse(readFileSync(new URL('../official-lesson-assets.json',import.meta.url),'utf8'));
const cite=(device,id,step)=>registry.assets.find(a=>a.device_family===device&&a.lesson_id===id&&a.step_id===step);
console.log('# BAZE screenshot coverage\n\nOne row per device and exercise step. A linked original is not an embedded screenshot.\n\n| Device | Course | Step | Task | State | Source / next action |\n|---|---|---|---|---|---|');
for(const device of ['galaxy','iphone'])for(const [id,{tasks}] of Object.entries(courses))tasks.forEach((task,index)=>{
 const step=registry.web_steps[id]?.[index];
 const asset=cite(device,id,step);
 const source=registry.sources[asset?.source_key??registry.reference_source_keys[device][id]];
 const state=asset?(asset.license_status==='verified'?'Inline eligible':'Original link only — embedding permission pending'):'Missing exact screenshot';
 const next=asset?(asset.license_status==='verified'?'Confirm rendering and overlays':'Confirm reuse permission or source an authorized capture'):source?'Check official guide and device manual for a matching capture':'Research exact device, operation and publisher/manual';
 console.log(`| ${device} | ${id} | ${step??index+1} | ${task.title[1].replaceAll('|','\\|')} | ${state} | ${source?`[${source.publisher}](${source.page}) · `:''}${next} |`);
});
