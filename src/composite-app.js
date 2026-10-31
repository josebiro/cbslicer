import {defaultBars,laminatedMotif} from './laminated-diamond.js';
import {selectUnits,rotateUnits,hull} from './rotation-composer.js';
import {loadProjects,saveProject} from './projects.js';
import {designs,designConfig} from './designs.js';
import {woods} from './planner.js';
import {compositePlan,compositeSteps,compositeCsv,motifGeometry,number as n} from './composite.js';
const $=id=>document.getElementById(id),wood=id=>woods.find(w=>w.id===id), names={triangle:'Triangular pinwheel',cube:'Tumbling blocks',diamond:'Legacy shaped diamonds',laminated:'Laminated diamonds'};
const defaults={triangle:['maple','purpleheart','walnut','cherry'],cube:['maple','sapele','walnut'],diamond:[...Array(4).fill('purpleheart'),...Array(4).fill('maple'),...Array(4).fill('walnut'),'maple']};
const savedWoods=structuredClone(defaults),savedRotations={triangle:{},cube:{},diamond:{},laminated:{}};
const numeric=['width','length','thickness','size','stockLength','allowance','kerf','endTrim','border','border2','border3','border4'];
let current=null;
let laminatedBars=defaultBars(),quarterBars=['A','A','A','A'];
let diamondOuterRatio=.32,diamondInnerRatio=.32;
let selectionMode=false,selection=new Set(),orientationUndo=[],orientationRedo=[];
const options=(selected,empty=true)=>(empty?`<option value="" ${selected===null?'selected':''}>Unassigned</option>`:'')+woods.map(w=>`<option value="${w.id}" ${w.id===selected?'selected':''}>${w.name}</option>`).join('');
$('brush').innerHTML=options('walnut');
$('border-controls').innerHTML=Array.from({length:4},(_,i)=>{const suffix=i===0?'':i+1;return `<div class="fields border-fields"><label>Ring ${i+1} width (in)<input id="border${suffix}" type="number" value="${i===0?.5:0}" min="0" step="0.125"></label><label>Ring ${i+1} wood<select id="borderWood${suffix}">${options(['walnut','maple','purpleheart','walnut'][i],false)}</select></label></div>`;}).join('');
function getConfig(){return {...Object.fromEntries(numeric.map(id=>[id,Number($(id).value)])),kind:$('kind').value,laminatedBars,quarterBars,diamondOuterRatio,diamondInnerRatio,faceWoods:savedWoods[$('kind').value],rotations:savedRotations[$('kind').value],alternate:$('alternate').checked,...Object.fromEntries(['','2','3','4'].map(suffix=>[`borderWood${suffix}`,$(`borderWood${suffix}`).value]))};}
function svgDefs(){return '<defs><pattern id="empty-component" patternUnits="userSpaceOnUse" width="0.18" height="0.18"><rect width="0.18" height="0.18" fill="#f3f3ec"/><path d="M0 0L.18 .18M.18 0L0 .18" stroke="#c3c9b8" stroke-width=".01"/></pattern></defs>';}
function polygon(points,id,attrs=''){return `<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${id===null?'url(#empty-component)':wood(id).color}" ${attrs}/>`;}
function updateFamily(){
 const kind=$('kind').value;
 $('diamond-architect').hidden=kind!=='diamond';
 $('laminated-editor').hidden=kind!=='laminated';
 $('brush').closest('label').hidden=kind==='laminated';
 $('blank').hidden=$('reset').hidden=kind==='laminated';
 if(kind==='laminated'){ $('family-hint').textContent='Four square quarter slices from A/B laminated bars form each repeat. Edit the layer order and assign a bar to each quarter.';$('unit-size-label').textContent='Full diamond repeat side (in)';$('alternate').disabled=true;$('face-controls').innerHTML='';return;}
 $('unit-size-label').textContent=kind==='cube'?'Rhombus side (in)':'Square-unit side (in)';
 $('family-hint').textContent=kind==='cube'?'Three 60° rhombi form a hexagonal unit. Its height is twice the side length; units nest on a staggered lattice.':kind==='diamond'?'Four corner triangles, two diamond frames, and a square core form each square repeat. Frames need additional glue-up stages.':'Four 45° / 45° / 90° triangles meet at the center of a square unit.';
 $('alternate').disabled=kind!=='triangle';
 const groups=kind==='diamond'?[['Corner triangles',[0,1,2,3]],['Outer diamond frame',[4,5,6,7]],['Inner diamond frame',[8,9,10,11]],['Diamond core',[12]]]:savedWoods[kind].map((_,i)=>[`Face ${i+1}`,[i]]);
 $('face-controls').innerHTML=groups.map(([label,indexes])=>{const values=indexes.map(i=>savedWoods[kind][i]),mixed=new Set(values).size>1;return `<label>${label}<select data-faces="${indexes.join(',')}">${mixed?'<option selected value="mixed">Mixed — painted faces</option>':''}${options(mixed?'mixed':values[0])}</select></label>`;}).join('');
}
function render(){
 try{current=compositePlan(getConfig());}catch(e){current=null;$('status').textContent=e.message;$('status').className='invalid';$('composite-board').innerHTML='';$('motif').innerHTML='';$('plan-content').innerHTML='';$('dimension').textContent='';for(const id of ['count','trim-count','volume'])$(id).textContent='—';for(const id of ['print','download','svg-download'])$(id).disabled=true;return;}
 const p=current,{c,motif}=p,kind=c.kind;
 selection=new Set([...selection].filter(key=>p.units.some(u=>u.key===key)));
 updateComposer();
 updateDiamondArchitect();
 updateLaminatedEditor();
 for(const id of ['print','download','svg-download'])$(id).disabled=Boolean(p.unassigned);
 $('status').className=p.unassigned?'incomplete':'';
 $('status').textContent=p.unassigned?`Assign wood to ${p.unassigned} component${p.unassigned===1?'':'s'} to complete the blank and unlock the workshop plan.`:'';
 $('motif').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-motif.width*.05} ${-motif.height*.05} ${motif.width*1.1} ${motif.height*1.1}" role="group" aria-label="Composite blank reference end view">${svgDefs()}${motif.faces.map((points,i)=>{const x=points.reduce((s,p)=>s+p[0],0)/points.length,y=points.reduce((s,p)=>s+p[1],0)/points.length;return `<g ${kind==='laminated'?'role="img"':`data-face="${i}" tabindex="0" role="button"`} aria-label="Paint component ${i+1}: ${c.faceWoods[i]===null?'Unassigned':wood(c.faceWoods[i]).name}">${polygon(points,c.faceWoods[i])}<text x="${x}" y="${y}" font-size="${c.size*.09}" class="map-label">${i+1}</text></g>`;}).join('')}</svg><p class="hint">Reference end view · ${motif.angles}<br>Labels follow components through the cut list.</p>`;
 if(kind==='laminated'){
  const S=c.size,q=S/2;
  $('motif').innerHTML=`<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Four square quarter slices forming one diamond repeat">${motif.faces.map((points,i)=>polygon(points,c.faceWoods[i])).join('')}${[[q/2,q/2],[q*1.5,q/2],[q*1.5,q*1.5],[q/2,q*1.5]].map(([x,y],i)=>`<text class="map-label" x="${x}" y="${y}" font-size="${S*.065}">${quarterBars[i]} · ${i*90}°</text>`).join('')}</svg><p class="hint">Four shaped square slices, viewed end grain up. Letters identify the source bar; angles are clockwise from its diagonal-band reference view.</p>`;
 }
 const labels=$('numbers').checked;
 $('composite-board').innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.width} ${c.length}" role="group" aria-label="${names[kind]} end-grain board, ${n(c.width)} by ${n(c.length)} inches">${svgDefs()}<title>${names[kind]} — ${n(c.width)} × ${n(c.length)} inches</title>${p.frames.map(f=>`<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" fill="${wood(f.id).color}"/>`).join('')}${p.units.map(unit=>{const all=unit.faces.flatMap(f=>f.points),x=all.reduce((s,p)=>s+p[0],0)/all.length,y=all.reduce((s,p)=>s+p[1],0)/all.length;return `<g data-unit="${unit.key}" tabindex="0" role="button" aria-label="Unit ${unit.number}, ${unit.angle} degrees${unit.cropped?', perimeter trim':''}. ${selectionMode?'Toggle selection':'Rotate clockwise'}"><title>Unit ${unit.number} · ${unit.angle}°${unit.cropped?' · trim':''}</title>${unit.faces.map(face=>polygon(face.points,face.id)).join('')}${selectionMode&&selection.has(unit.key)?`<polygon class="selected-unit" points="${hull(unit.faces.flatMap(f=>f.points)).map(point=>point.join(',')).join(' ')}"/>`:''}${labels?`<text class="map-label" x="${x}" y="${y}" font-size="${c.size*.16}">${unit.number}</text>`:''}</g>`;}).join('')}<rect x="${p.margin}" y="${p.margin}" width="${p.centerWidth}" height="${p.centerHeight}" fill="none" stroke="#ffffff99" stroke-width=".02" stroke-dasharray=".12 .08"/></svg>`;
 $('rotation-hint').textContent=selectionMode?'Click slices to compose a selection':`Click a unit to rotate ${motif.rotationStep}° ↻`;
 $('dimension').textContent=`${n(c.width)}″ × ${n(c.length)}″ × ${n(c.thickness)}″`;
 $('count').textContent=p.units.length;$('trim-count').textContent=p.units.filter(u=>u.cropped).length;$('volume').textContent=p.unassigned?'Incomplete':`${p.volume.toFixed(2)} bd ft`;
 if(kind==='laminated'){renderLaminatedPlan(p);return;}
 if(p.unassigned){$('plan-content').innerHTML='<p class="notice">The reference motif is incomplete. Paint every component to generate the cut list and assembly instructions.</p>';return;}
 const rows=p.blanks.map(b=>`<tr><td>${b.batch}</td><td>${b.component}<br><small>${b.shape}</small></td><td>${wood(b.id).name}</td><td>${b.quantity}</td><td>${n(b.width)} × ${n(b.height)} × ${n(b.length)}</td><td>${b.slices}</td></tr>`).join('');
 const parts=motif.faces.map((points,i)=>{const part=motif.parts?.[i];const shape=part?.shape||(kind==='triangle'?'Right isosceles triangle':'Rhombus'),envelope=part?.envelope||motif.envelope;return `<tr><td>${i+1}</td><td>${wood(c.faceWoods[i]).name}</td><td>${shape}</td><td>${part?.angles||motif.angles}</td><td>${n(envelope[0])} × ${n(envelope[1])}${part?.outerBase?`<br>Outer base ${n(part.outerBase)}; inner ${n(part.innerBase)}`:kind==='triangle'?`<br>Legs ${n(motif.edge)}; hypotenuse ${n(c.size)}`:kind==='cube'?`<br>All sides ${n(c.size)}`:''}</td></tr>`;}).join('');
 $('plan-content').innerHTML=`<div class="instructions"><h3>1. Finished component cross-sections</h3><div class="reference-diagram">${$('motif').querySelector('svg').outerHTML.replaceAll('tabindex="0"','').replaceAll('role="button"','').replaceAll(/ data-face="\d+"/g,'')}</div><p>All measurements are inches, viewed perpendicular to the grain. Bounding envelopes are rectangular dimensions around a finished part in its milling orientation, before rotation into the reference end view. Display dimensions round to 0.001″; CSV preserves full precision. The SVG export is a proportioned layout, not a calibrated cutting template.</p><div class="table-wrap"><table><thead><tr><th>Face</th><th>Wood</th><th>Shape</th><th>Interior angles</th><th>Net envelope W × H<br>(before rotation)</th></tr></thead><tbody>${parts}</tbody></table></div></div><div class="instructions"><h3>2. Source blanks & crosscuts</h3><p>${p.schedule.length} composite blank batch${p.schedule.length===1?'':'es'} produce ${p.units.length} full motif slices. Crosscut each slice at <strong>${n(p.sliceThickness)}″</strong> along the grain, before flattening. ${n(p.trimArea)} square inches of motif cross-section lie outside the finished center; all full slices are budgeted.</p><p>M = motif blank; B = end-grain border stock. Each table row is one component prism’s rectangular source blank; rows in the same M batch glue together before crosscutting. A batch’s slice count applies to the composite, not additional slices per component.</p><div class="table-wrap"><table><thead><tr><th>Batch</th><th>Component</th><th>Wood</th><th>Qty</th><th>Rough W × H × grain length</th><th>Slices from batch</th></tr></thead><tbody>${rows}</tbody></table></div><p class="hint">One blank per prism; no optimized angled-rip yield assumed. Volume includes envelopes, specified allowance, crosscut kerf and end trim, but excludes defects, long rip losses and extra workholding stock.</p></div><div class="instructions"><h3>3. Glue-up & orientation</h3><ol>${compositeSteps(p).map(step=>`<li>${step}</li>`).join('')}</ol></div><details class="instructions" open><summary>Numbered slice placement map</summary><p>Origins are the full unit’s bounding-box top-left, measured from the finished board’s top-left. Negative origins are expected for trimmed perimeter units. Angles are clockwise from the reference end view. The dashed preview rectangle marks the finished center crop.</p><div class="table-wrap map-table"><table><thead><tr><th>Unit</th><th>Origin X</th><th>Origin Y</th><th>Rotation</th><th>Perimeter</th></tr></thead><tbody>${p.units.map(u=>`<tr><td>${u.number}</td><td>${n(u.x)}″</td><td>${n(u.y)}″</td><td>${u.angle}°</td><td>${u.cropped?'Trim after glue-up':'Full'}</td></tr>`).join('')}</tbody></table></div></details>`;
}
function paint(face){if(current?.c.kind==='laminated')return;savedWoods[$('kind').value][face]=$('brush').value||null;updateFamily();render();}
function rotate(key){if(!current)return;if(selectionMode){selection.has(key)?selection.delete(key):selection.add(key);render();return;}rememberOrientation();const unit=current.units.find(u=>u.key===key);savedRotations[current.c.kind][key]=(unit.turns+1)%current.motif.turns;render();}
function activate(container,attribute,callback){$(container).addEventListener('click',e=>{const target=e.target.closest(`[${attribute}]`);if(target)callback(target.getAttribute(attribute));});$(container).addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key))return;const target=e.target.closest(`[${attribute}]`);if(target){e.preventDefault();const value=target.getAttribute(attribute);callback(value);$(container).querySelector(`[${attribute}="${CSS.escape(value)}"]`)?.focus();}});}
activate('motif','data-face',face=>paint(Number(face)));activate('composite-board','data-unit',rotate);
$('kind').onchange=()=>{selection.clear();orientationUndo=[];orientationRedo=[];updateFamily();render();};
$('face-controls').onchange=e=>{if(!e.target.dataset.faces||e.target.value==='mixed')return;for(const index of e.target.dataset.faces.split(','))savedWoods[$('kind').value][Number(index)]=e.target.value||null;updateFamily();render();};
$('blank').onclick=()=>{savedWoods[$('kind').value].fill(null);updateFamily();render();};
$('reset').onclick=()=>{savedWoods[$('kind').value]=[...defaults[$('kind').value]];updateFamily();render();};
$('reset-rotations').onclick=()=>{rememberOrientation();savedRotations[$('kind').value]={};render();};
for(const id of numeric)$(id).addEventListener('input',()=>{if(id==='size'){orientationUndo=[];orientationRedo=[];selection.clear();savedRotations[$('kind').value]={};}render();});
for(const suffix of ['','2','3','4'])$(`borderWood${suffix}`).onchange=render;
$('alternate').onchange=()=>{orientationUndo=[];orientationRedo=[];savedRotations.triangle={};render();};$('numbers').onchange=render;
$('print').onclick=()=>{if(current&&!current.unassigned)window.print();};
function download(content,type,name){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('download').onclick=()=>{if(current&&!current.unassigned)download(compositeCsv(current),'text/csv','grain-composite-plan.csv');};
$('svg-download').onclick=()=>{if(!current||current.unassigned)return;const svg=$('composite-board').querySelector('svg').cloneNode(true);svg.querySelectorAll('.selected-unit').forEach(node=>node.remove());svg.querySelectorAll('.map-label').forEach(label=>{label.setAttribute('fill','#fff');label.setAttribute('stroke','#29372e');label.setAttribute('stroke-width','.025');label.setAttribute('paint-order','stroke');label.setAttribute('text-anchor','middle');label.setAttribute('dominant-baseline','central');});download(new XMLSerializer().serializeToString(svg),'image/svg+xml','grain-composite-layout.svg');};
const selectedDesign=designs.find(d=>d.id===new URLSearchParams(location.search).get('design'));
if(selectedDesign){
 const config=designConfig(selectedDesign);
 if(config.laminatedBars)laminatedBars=structuredClone(config.laminatedBars);if(config.quarterBars)quarterBars=[...config.quarterBars];
 $('kind').value=config.kind;
 for(const id of numeric)$(id).value=config[id];
 for(const suffix of ['','2','3','4'])$(`borderWood${suffix}`).value=config[`borderWood${suffix}`];
 if(config.kind!=='laminated')savedWoods[config.kind]=[...config.faceWoods];
 $('alternate').checked=config.alternate;
 document.title=`${selectedDesign.name} — Grain studio`;
 document.querySelector('.intro h1').textContent=selectedDesign.name;
 document.querySelector('.intro p:not(.eyebrow)').textContent='Your starting point. Change the woods, resize the board, and make it your own.';
}
let projectId=null;
const requestedProject=new URLSearchParams(location.search).get('project');
if(selectedDesign)$('project-name').value=selectedDesign.name;
if(requestedProject){
 try{
 const project=loadProjects().find(p=>p.id===requestedProject);
 if(!project)throw Error('This project is not saved in this browser. Import its project file from the workbench.');
 const config=project.config;
 diamondOuterRatio=config.diamondOuterRatio??.32;diamondInnerRatio=config.diamondInnerRatio??.32;
 $('kind').value=config.kind;
 for(const id of numeric)$(id).value=config[id]??0;
 for(const suffix of ['','2','3','4'])$(`borderWood${suffix}`).value=config[`borderWood${suffix}`]||'walnut';
 if(config.kind!=='laminated')savedWoods[config.kind]=[...config.faceWoods];laminatedBars=structuredClone(config.laminatedBars||defaultBars());quarterBars=[...(config.quarterBars||['A','A','A','A'])];savedRotations[config.kind]=structuredClone(config.rotations||{});
 $('alternate').checked=Boolean(config.alternate);
 $('project-name').value=project.name;projectId=project.id;
 $('project-status').textContent='Saved board opened';
 document.querySelector('.intro h1').textContent=project.name;
 }catch(error){$('project-status').textContent=error.message;}
}
function persist(asNew){
 try{
 if(!current)throw Error('Correct the board dimensions before saving.');
 const saved=saveProject({version:1,name:$('project-name').value,config:getConfig()},asNew?null:projectId);
 projectId=saved.id;$('project-name').value=saved.name;
 history.replaceState(null,'','?project='+encodeURIComponent(projectId));
 $('project-status').textContent='Saved to your workbench · '+new Date(saved.updated).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
 }catch(error){$('project-status').textContent='Could not save: '+error.message;}
}
$('save-project').onclick=()=>persist(false);$('copy-project').onclick=()=>persist(true);
$('export-project').onclick=()=>{if(!current){$('project-status').textContent='Correct the board dimensions before downloading.';return;}download(JSON.stringify({version:1,name:$('project-name').value,config:getConfig()},null,2),'application/json','grain-project.json');};
document.querySelector('main').addEventListener('input',e=>{if(e.target.closest('.project-toolbar')||e.target.closest('aside'))$('project-status').textContent='Changes not saved';});
document.querySelector('main').addEventListener('change',e=>{if(e.target.closest('aside'))$('project-status').textContent='Changes not saved';});
for(const container of ['motif','composite-board'])$(container).addEventListener('click',()=>{$('project-status').textContent='Changes not saved';});
updateFamily();render();

for(const event of ['click','keydown'])document.querySelector('aside').addEventListener(event,e=>{if(e.target.closest('button')||(event==='keydown'&&['Enter',' '].includes(e.key)&&e.target.closest('[data-face]')))$('project-status').textContent='Changes not saved';});
$('composite-board').addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key))$('project-status').textContent='Changes not saved';});

function updateComposer(){
 $('selection-count').textContent=`${selection.size} selected`;
 $('turn-left').disabled=$('turn-right').disabled=!selection.size;
 $('rotation-undo').disabled=!orientationUndo.length;
 $('rotation-redo').disabled=!orientationRedo.length;
}
function rememberOrientation(){orientationUndo.push(structuredClone(savedRotations[$('kind').value]));if(orientationUndo.length>50)orientationUndo.shift();orientationRedo=[];}
function orientationChanged(){render();$('project-status').textContent='Changes not saved';}
$('selection-mode').onclick=()=>{selectionMode=!selectionMode;$('selection-mode').setAttribute('aria-pressed',String(selectionMode));$('selection-mode').textContent=selectionMode?'Finish selection':'Select slices';$('selection-tools').hidden=!selectionMode;render();};
document.querySelector('.selection-presets').onclick=e=>{const button=e.target.closest('[data-select]');if(!button||!current)return;selection=new Set(selectUnits(current.units,button.dataset.select,[...selection]));render();};
function turnGroup(step){if(!current||!selection.size)return;rememberOrientation();savedRotations[current.c.kind]=rotateUnits(current.units,[...selection],step,current.motif.turns,savedRotations[current.c.kind]);orientationChanged();}
$('turn-left').onclick=()=>turnGroup(-1);$('turn-right').onclick=()=>turnGroup(1);
function travelOrientation(undo){const from=undo?orientationUndo:orientationRedo,to=undo?orientationRedo:orientationUndo;if(!from.length)return;to.push(structuredClone(savedRotations[$('kind').value]));savedRotations[$('kind').value]=from.pop();orientationChanged();}
$('rotation-undo').onclick=()=>travelOrientation(true);$('rotation-redo').onclick=()=>travelOrientation(false);

document.documentElement.dataset.editorReady='true';
$('editor-startup').hidden=true;

function updateDiamondArchitect(){
 if(!current||current.c.kind!=='diamond')return;
 const s=current.c.size,radial=s/(2*Math.SQRT2),coreFraction=1-diamondOuterRatio-diamondInnerRatio;
 $('diamond-outer').value=Math.round(diamondOuterRatio*100);$('diamond-inner').value=Math.round(diamondInnerRatio*100);
 $('diamond-outer').max=Math.floor((.95-diamondInnerRatio)*100+1e-7);$('diamond-inner').max=Math.floor((.95-diamondOuterRatio)*100+1e-7);
 $('outer-width').textContent=`${n(radial*diamondOuterRatio)}″ milled`;
 $('inner-width').textContent=`${n(radial*diamondInnerRatio)}″ milled`;
 $('core-size').textContent=`${n(s/Math.SQRT2*coreFraction)}″`;
 const names=['Outer frame','Inner frame','Core'],values=[diamondOuterRatio,diamondInnerRatio,coreFraction],colors=[wood(savedWoods.diamond[4])?.color||'#b2b99e',wood(savedWoods.diamond[8])?.color||'#b2b99e',wood(savedWoods.diamond[12])?.color||'#b2b99e'];
 $('diamond-budget').innerHTML=values.map((v,i)=>`<span style="flex:${v};background:${colors[i]}" title="${names[i]}: ${Math.round(v*100)}% of radial span"><span>${names[i]} ${Math.round(v*100)}%</span></span>`).join('');
 document.querySelectorAll('[data-proportion]').forEach(button=>{const pair={fine:[.12,.12],balanced:[.32,.32],bold:[.52,.18]}[button.dataset.proportion];button.setAttribute('aria-pressed',String(Math.abs(diamondOuterRatio-pair[0])<.001&&Math.abs(diamondInnerRatio-pair[1])<.001));});
}
$('diamond-outer').oninput=()=>{diamondOuterRatio=Number($('diamond-outer').value)/100;render();$('project-status').textContent='Changes not saved';};
$('diamond-inner').oninput=()=>{diamondInnerRatio=Number($('diamond-inner').value)/100;render();$('project-status').textContent='Changes not saved';};
document.querySelector('.architect-presets').onclick=e=>{const button=e.target.closest('[data-proportion]');if(!button)return;[diamondOuterRatio,diamondInnerRatio]={fine:[.12,.12],balanced:[.32,.32],bold:[.52,.18]}[button.dataset.proportion];render();$('project-status').textContent='Changes not saved';};

function updateLaminatedEditor(){
 if(current?.c.kind!=='laminated')return;
 const p=current;
 $('bar-editors').innerHTML=['A','B'].map(key=>`<section class="bar-editor"><h3>Bar ${key} · layer 1 → last layer</h3>${laminatedBars[key].map((layer,i)=>`<div class="lamination-row"><span>${i+1}</span><select aria-label="Bar ${key} layer ${i+1} wood" data-bar="${key}" data-layer="${i}" data-field="wood">${options(layer.wood,false)}</select><label>Relative thickness<input aria-label="Bar ${key} layer ${i+1} relative thickness" data-bar="${key}" data-layer="${i}" data-field="weight" type="number" min="1" value="${layer.weight}"></label><strong>${n(p.motif.stacks[key].strips[i].thickness)}″ milled</strong><button data-move="-1" data-bar="${key}" data-layer="${i}" ${i===0?'disabled':''} aria-label="Move bar ${key} layer ${i+1} up">↑</button><button data-move="1" data-bar="${key}" data-layer="${i}" ${i===laminatedBars[key].length-1?'disabled':''} aria-label="Move bar ${key} layer ${i+1} down">↓</button><button data-remove="1" data-bar="${key}" data-layer="${i}" ${laminatedBars[key].length<=2?'disabled':''}>Remove</button></div>`).join('')}<button data-add="${key}" ${laminatedBars[key].length>=4?'disabled':''}>Add lamination</button></section>`).join('');
 $('quarter-assignments').innerHTML=['Top left · 0°','Top right · 90°','Bottom right · 180°','Bottom left · 270°'].map((name,i)=>`<label>${name}<select data-quarter="${i}"><option ${quarterBars[i]==='A'?'selected':''}>A</option><option ${quarterBars[i]==='B'?'selected':''}>B</option></select></label>`).join('');
 $('bar-process').innerHTML=['A','B'].map(key=>{const stack=p.motif.stacks[key],H=p.motif.barSpan,q=p.motif.quarterSide,m=laminatedMotif(p.c.size,laminatedBars,[key,key,key,key]);return `<div><h3>Bar ${key}: straight glue-up → four bevels → diagonal-band square</h3><div class="bar-diagrams"><svg viewBox="0 0 ${H} ${H}" aria-label="Bar ${key} straight lamination stack">${stack.strips.map(layer=>`<rect x="0" y="${layer.offset}" width="${H}" height="${layer.thickness}" fill="${wood(layer.wood).color}"/>`).join('')}<polygon points="${H/2},0 ${H},${H/2} ${H/2},${H} 0,${H/2}" fill="none" stroke="white" stroke-width=".025" stroke-dasharray=".08 .04"/></svg><span>→</span><svg viewBox="0 0 ${q} ${q}" aria-label="Bar ${key} shaped square end view">${m.faces.filter((_,i)=>m.meta[i].quarter===0).map((points,i)=>polygon(points,m.ids[i])).join('')}</svg></div><p>${n(H)}″ × ${n(H)}″ milled stack → ${n(q)}″ square quarter. Diagram is an end view; grain runs into the page. Layer 1 starts at the upper-left corner of the square.</p></div>`;}).join('');
 $('count').textContent=`${p.units.length} repeats / ${p.units.length*4} quarters`;
}
$('bar-editors').onchange=e=>{const t=e.target;if(!t.dataset.field)return;const layer=laminatedBars[t.dataset.bar][Number(t.dataset.layer)];if(t.dataset.field==='weight'&&(!Number.isFinite(Number(t.value))||Number(t.value)<=0)){t.setCustomValidity('Use a positive relative thickness.');t.reportValidity();return;}t.setCustomValidity('');layer[t.dataset.field]=t.dataset.field==='weight'?Number(t.value):t.value;render();$('project-status').textContent='Changes not saved';};
$('bar-editors').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.add)laminatedBars[b.dataset.add].push({wood:'maple',weight:20});else{const layers=laminatedBars[b.dataset.bar],i=Number(b.dataset.layer);if(b.dataset.remove)layers.splice(i,1);else{const j=i+Number(b.dataset.move);[layers[i],layers[j]]=[layers[j],layers[i]];}}render();$('project-status').textContent='Changes not saved';};
$('reverse-bar-b').onclick=()=>{laminatedBars.B=structuredClone(laminatedBars.A).reverse();render();$('project-status').textContent='Changes not saved';};
$('quarter-assignments').onchange=e=>{if(e.target.dataset.quarter===undefined)return;quarterBars[Number(e.target.dataset.quarter)]=e.target.value;render();$('project-status').textContent='Changes not saved';};
function renderLaminatedPlan(p){
 $('plan-content').innerHTML=`<section class="instructions"><h3>1. Straight laminations before beveling</h3><p>The colored regions in the finished repeat are sections of laminated bars. Make rectangular layers, not separate triangles or mitered frames. A and B can have different orders and relative thicknesses. Relative thicknesses scale to a ${n(p.motif.barSpan)}″ finished stack height.</p>${$('bar-process').innerHTML}<h3>2. Rectangular stock & quarter-slice schedule</h3><p>${p.units.length*4} full quarter slices for ${p.units.length} repeats. Each batch is one laminated bar; its slice count applies once to that bar, not once per layer. Shape the centered square before crosscutting at ${n(p.sliceThickness)}″. The bevel process removes 50% of the milled stack area; this loss is already included in the rectangular stock quantities. Add working length for your fixtures.</p><div class="table-wrap"><table><thead><tr><th>Batch</th><th>Lamination</th><th>Wood</th><th>Rough W × layer T × grain length</th><th>Quarter slices</th></tr></thead><tbody>${p.blanks.map(b=>`<tr><td>${b.batch}</td><td>${b.component}</td><td>${wood(b.id).name}</td><td>${n(b.width)} × ${n(b.height)} × ${n(b.length)}</td><td>${b.slices}</td></tr>`).join('')}</tbody></table></div><h3>3. Quarter assignment & assembly</h3><p>Reference repeat: top-left ${quarterBars[0]} at 0°; top-right ${quarterBars[1]} at 90°; bottom-right ${quarterBars[2]} at 180°; bottom-left ${quarterBars[3]} at 270°. Start each square slice in its diagonal-band reference orientation shown above, then rotate clockwise. Numbered map rotations apply to the entire four-quarter repeat.</p><div class="reference-diagram">${$('motif').querySelector('svg').outerHTML}</div><ol>${compositeSteps(p).map(step=>`<li>${step}</li>`).join('')}</ol><div class="table-wrap map-table"><table><thead><tr><th>Repeat</th><th>Origin X</th><th>Origin Y</th><th>Whole-repeat turn</th></tr></thead><tbody>${p.units.map(u=>`<tr><td>${u.number}</td><td>${n(u.x)}</td><td>${n(u.y)}</td><td>${u.angle}°</td></tr>`).join('')}</tbody></table></div></section>`;
}
