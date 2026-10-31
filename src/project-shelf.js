import {loadProjects,removeProject,saveProject,validateProject} from './projects.js';
import {compositePlan} from './composite.js';
import {woods} from './planner.js';
const shelf=document.getElementById('project-shelf'),status=document.getElementById('shelf-status');
function show(){
 shelf.replaceChildren();
 try{
 const projects=loadProjects();
 if(!projects.length){const empty=document.createElement('p');empty.className='shelf-empty';empty.textContent='Your next heirloom starts here. Open a collection design, make it yours, then save it to your workbench.';shelf.append(empty);return;}
 for(const project of projects){
  const p=compositePlan(project.config),article=document.createElement('article');article.className='saved-board';
  const link=document.createElement('a');link.href='/composite.html?project='+encodeURIComponent(project.id);
  const preview=document.createElement('div');preview.className='saved-preview';
  preview.innerHTML=`<svg viewBox="0 0 ${p.c.width} ${p.c.length}" aria-hidden="true">${p.frames.map(f=>`<rect x="${f.x}" y="${f.y}" width="${f.width}" height="${f.height}" fill="${woods.find(w=>w.id===f.id).color}"/>`).join('')}${p.units.flatMap(u=>u.faces.map(f=>`<polygon points="${f.points.map(point=>point.join(',')).join(' ')}" fill="${woods.find(w=>w.id===f.id)?.color||'#d5d9cd'}"/>`)).join('')}</svg>`;
  const name=document.createElement('h3');name.textContent=project.name;
  const detail=document.createElement('p');detail.textContent=`${p.c.width} × ${p.c.length}″ · ${p.unassigned?'Design in progress':'Ready to edit'}`;
  link.append(preview,name,detail);
  const remove=document.createElement('button');remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+project.name);remove.onclick=()=>{if(!confirm(`Remove “${project.name}” from this browser? Download the project first if you want to keep a copy.`))return;try{removeProject(project.id);show();status.textContent='Project removed.';}catch{status.textContent='Could not remove the project. Browser storage may be unavailable.';}};
  article.append(link,remove);shelf.append(article);
 }
 }catch{status.textContent='Your saved boards could not be read. Browser storage may be unavailable. Existing data has not been changed.';}
}
document.getElementById('import-project').onchange=async e=>{
 try{const file=e.target.files[0];if(!file)return;if(file.size>250000)throw Error('Project files must be smaller than 250 KB.');const project=validateProject(JSON.parse(await file.text()));saveProject(project);show();status.textContent=`Imported “${project.name}”. Open it from your workbench.`;}catch(error){status.textContent='Import failed: '+error.message;}finally{e.target.value='';}
};show();
window.addEventListener('pageshow',show);
