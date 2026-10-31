import {designs,designConfig} from './designs.js';
import {compositePlan} from './composite.js';
import {woods} from './planner.js';
const wood=id=>woods.find(w=>w.id===id),family={triangle:'Triangular pinwheel',cube:'Tumbling blocks',diamond:'Nested diamonds'};
const pointString=points=>points.map(p=>p.join(',')).join(' ');
function card(d){
 const p=compositePlan(designConfig(d));
 const svg=`<svg viewBox="0 0 ${d.width} ${d.length}" aria-hidden="true">${p.frames.map(f=>`<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" fill="${wood(f.id).color}"/>`).join('')}${p.units.flatMap(u=>u.faces.map(f=>`<polygon points="${pointString(f.points)}" fill="${wood(f.id).color}"/>`)).join('')}</svg>`;
 return `<a class="design-card" data-family="${d.kind}" href="/composite.html?design=${d.id}" aria-label="Customize ${d.name}: ${family[d.kind]}"><div class="design-scene scene-${d.kind}"><span class="card-family">${family[d.kind]}</span><div class="collection-board">${svg}</div><span class="card-invitation">Make it yours <span aria-hidden="true">↗</span></span></div><div class="design-description"><div><h3>${d.name}</h3><span>${d.width} × ${d.length} inches</span></div><p>${d.caption}</p><div class="design-woods">${[...new Set(d.faceWoods)].map(id=>`<i style="background:${wood(id).color}" title="${wood(id).name}"></i>`).join('')}<span>${new Set(d.faceWoods).size} wood species</span></div></div></a>`;
}
document.getElementById('design-collection').innerHTML=designs.map(card).join('');
const filters=document.getElementById('collection-filters');
filters.onclick=e=>{const button=e.target.closest('[data-filter]');if(!button)return;filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('.design-card').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.family!==button.dataset.filter);};
