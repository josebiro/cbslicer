import {compositePlan} from './composite.js';
const KEY='grain.projects.v1';
const fields=['kind','width','length','thickness','size','allowance','kerf','endTrim','stockLength','border','border2','border3','border4','borderWood','borderWood2','borderWood3','borderWood4','faceWoods','rotations','alternate'];
export function validateProject(value){
 if(!value||value.version!==1||typeof value.name!=='string'||!value.config)throw Error('Choose a Grain project file (version 1).');
 const config=Object.fromEntries(fields.filter(k=>Object.hasOwn(value.config,k)).map(k=>[k,structuredClone(value.config[k])]));
 if(config.rotations&&(!Object.keys(config.rotations).every(k=>/^-?\d+,-?\d+$/.test(k))||Object.keys(config.rotations).length>1800))throw Error('Invalid unit rotation map.');
 compositePlan(config);
 return {version:1,name:value.name.trim().slice(0,80)||'Untitled board',config};
}
export function loadProjects(storage=localStorage){
 const raw=storage.getItem(KEY);if(!raw)return [];
 const list=JSON.parse(raw);if(!Array.isArray(list)||list.length>24)throw Error('The saved project shelf could not be read. Download a project before clearing browser storage.');
 return list.map(item=>({...validateProject(item),id:item.id,updated:item.updated}));
}
export function saveProject(project,id,storage=localStorage){
 const clean=validateProject(project),list=loadProjects(storage),index=list.findIndex(p=>p.id===id);
 if(index<0&&list.length>=24)throw Error('Your shelf holds 24 boards. Download and remove one before adding another.');
 const saved={...clean,id:index<0?crypto.randomUUID():id,updated:new Date().toISOString()};
 if(index<0)list.unshift(saved);else list[index]=saved;
 storage.setItem(KEY,JSON.stringify(list));return saved;
}
export function removeProject(id,storage=localStorage){storage.setItem(KEY,JSON.stringify(loadProjects(storage).filter(p=>p.id!==id)));}
