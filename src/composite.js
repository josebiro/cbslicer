import {woods} from './planner.js';
const EPS=1e-9;
export const area=points=>Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
export function clipRect(points,width,height){
 let result=points;
 for(const [axis,bound,sign] of [[0,0,1],[0,width,-1],[1,0,1],[1,height,-1]]){
  const next=[];
  for(let i=0;i<result.length;i++){
   const a=result[i],b=result[(i+1)%result.length];
   const insideA=sign*(a[axis]-bound)>=-EPS,insideB=sign*(b[axis]-bound)>=-EPS;
   if(insideA)next.push(a);
   if(insideA!==insideB){const t=(bound-a[axis])/(b[axis]-a[axis]);next.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
  }
  result=next;if(!result.length)break;
 }
 return result;
}
export function motifGeometry(kind,size){
 if(kind==='diamond'){
  const center=[size/2,size/2],corners=[[0,0],[size,0],[size,size],[0,size]],outer=[[size/2,0],[size,size/2],[size/2,size],[0,size/2]];
  const faces=corners.map((corner,i)=>[corner,outer[i],outer[(i+3)%4]]),parts=faces.map(()=>({shape:'Right triangle',angles:'45° / 45° / 90°',envelope:[size/2,size/2]}));
  const radii=[size/2,size*.34,size*.18];
  for(let ring=0;ring<2;ring++){
   const points=radius=>[[size/2,size/2-radius],[size/2+radius,size/2],[size/2,size/2+radius],[size/2-radius,size/2]];
   const a=points(radii[ring]),b=points(radii[ring+1]);
   for(let i=0;i<4;i++){faces.push([a[i],a[(i+1)%4],b[(i+1)%4],b[i]]);parts.push({shape:'Mitered trapezoid',angles:'45° / 135°',envelope:[radii[ring]*Math.SQRT2,(radii[ring]-radii[ring+1])/Math.SQRT2],outerBase:radii[ring]*Math.SQRT2,innerBase:radii[ring+1]*Math.SQRT2});}
  }
  const r=radii[2];faces.push([[center[0],center[1]-r],[center[0]+r,center[1]],[center[0],center[1]+r],[center[0]-r,center[1]]]);
  parts.push({shape:'Square core',angles:'90°',envelope:[r*Math.SQRT2,r*Math.SQRT2]});
  return {width:size,height:size,faces,parts,angles:'45° triangles; 45°/135° ring segments; square core',rotationStep:90,turns:4};
 }
 if(kind==='triangle'){
  const corners=[[0,0],[size,0],[size,size],[0,size]],center=[size/2,size/2];
  return {width:size,height:size,faces:corners.map((p,i)=>[center,p,corners[(i+1)%4]]),angles:'45° / 45° / 90°',rotationStep:90,turns:4,
   edge:size/Math.SQRT2,envelope:[size/Math.SQRT2,size/Math.SQRT2]};
 }
 const h=Math.sqrt(3)*size/2,vertices=[[0,-size],[h,-size/2],[h,size/2],[0,size],[-h,size/2],[-h,-size/2]];
 const move=points=>points.map(([x,y])=>[x+h,y+size]);
 return {width:h*2,height:size*2,faces:[[[0,0],vertices[5],vertices[0],vertices[1]],[[0,0],vertices[1],vertices[2],vertices[3]],[[0,0],vertices[3],vertices[4],vertices[5]]].map(move),angles:'60° / 120°',rotationStep:120,turns:3,
  edge:size,envelope:[size*1.5,h]};
}
function batches(quantity,c){
 const slice=c.thickness+c.allowance,pitch=slice+c.kerf,capacity=Math.floor((c.stockLength-2*c.endTrim+EPS)/pitch);
 if(capacity<1)throw Error('Stock length must fit a slice, its kerf, and both end trims.');
 const result=[];
 for(let remaining=quantity;remaining>0;){const count=Math.min(capacity,remaining);result.push({slices:count,length:count*pitch+2*c.endTrim});remaining-=count;}
 return result;
}
export function compositePlan(input){
 const c={border3:0,border4:0,borderWood3:'maple',borderWood4:'walnut',...input}, validWood=id=>woods.some(w=>w.id===id);
 for(const key of ['width','length','thickness','size','allowance','kerf','endTrim','stockLength','border','border2','border3','border4']){
  if(!Number.isFinite(c[key])||c[key]<0)throw Error('Enter finite, non-negative dimensions.');
 }
 if(!['triangle','cube','diamond'].includes(c.kind))throw Error('Choose a composite unit.');
 if([c.width,c.length,c.thickness,c.size,c.stockLength].some(n=>n<=0))throw Error('Board, unit, thickness and stock dimensions must be positive.');
 const margin=c.border+c.border2+c.border3+c.border4,width=c.width-2*margin,height=c.length-2*margin;
 if(width<=0||height<=0)throw Error('Border layers together must leave room for the pattern.');
 const motif=motifGeometry(c.kind,c.size),faceCount=motif.faces.length;
 if(!Array.isArray(c.faceWoods)||c.faceWoods.length!==faceCount||!c.faceWoods.every(id=>id===null||validWood(id))||!validWood(c.borderWood)||!validWood(c.borderWood2)||!validWood(c.borderWood3)||!validWood(c.borderWood4))throw Error('Choose a valid wood for every component.');
 const units=[],rotations=c.rotations||{};
 function add(key,x,y,row,col){
  const turns=rotations[key]??((c.alternate&&c.kind==='triangle')?(row+col)%4:0);
  if(!Number.isInteger(turns)||turns<0||turns>=motif.turns)throw Error('Unit rotations must be valid whole turns.');
  const theta=turns*motif.rotationStep*Math.PI/180,cos=Math.cos(theta),sin=Math.sin(theta);
  const visible=motif.faces.map(points=>clipRect(points.map(([px,py])=>{const dx=px-motif.width/2,dy=py-motif.height/2;return [dx*cos-dy*sin+motif.width/2+x,dx*sin+dy*cos+motif.height/2+y];}),width,height));
  const visibleArea=visible.reduce((s,points)=>s+area(points),0);
  if(visibleArea<EPS)return;
  // A positive turn moves each source face to its next physical face position.
  const faces=visible.map((points,index)=>({points:points.map(([px,py])=>[px+margin,py+margin]),id:c.faceWoods[index],source:index})).filter(face=>area(face.points)>EPS);
  const fullArea=motif.faces.reduce((s,points)=>s+area(points),0);
  units.push({key,x:x+margin,y:y+margin,row,col,turns,angle:turns*motif.rotationStep,faces,cropped:visibleArea<fullArea-EPS,visibleArea});
 }
 if(c.kind!=='cube'){
  const rows=Math.ceil(height/c.size),cols=Math.ceil(width/c.size);
  if(rows*cols>1600)throw Error('Increase unit size: the layout is limited to 1,600 units.');
  for(let r=0;r<rows;r++)for(let col=0;col<cols;col++)add(`${r},${col}`,col*c.size,r*c.size,r,col);
 }else{
  const h=motif.width/2,cols=Math.ceil(width/(2*h))+2,rows=Math.ceil(height/(1.5*c.size))+2;
  if(rows*cols>1800)throw Error('Increase unit size: the layout is limited to about 1,600 units.');
  for(let col=-1;col<cols;col++)for(let r=-1;r<rows;r++){
   const cx=col*2*h+((r%2+2)%2)*h,cy=r*1.5*c.size;
   add(`${r},${col}`,cx-h,cy-c.size,r,col);
  }
  units.sort((a,b)=>a.y-b.y||a.x-b.x);
 }
 if(!units.length)throw Error('Use larger board and unit dimensions.');
 if(units.length>1600)throw Error('Increase unit size: the layout is limited to 1,600 units.');
 units.forEach((unit,index)=>unit.number=index+1);
 const frames=[];
 let innerWidth=width,innerHeight=height,offset=margin;
 for(const [index,depth,id] of [[1,c.border,c.borderWood],[2,c.border2,c.borderWood2],[3,c.border3,c.borderWood3],[4,c.border4,c.borderWood4]]){
  if(!depth)continue;
  const ow=innerWidth+2*depth,oh=innerHeight+2*depth,o=offset-depth;
  frames.push({name:`Border ${index} top`,id,x:o,y:o,width:ow,height:depth},
   {name:`Border ${index} bottom`,id,x:o,y:o+oh-depth,width:ow,height:depth},
   {name:`Border ${index} left`,id,x:o,y:o+depth,width:depth,height:innerHeight},
   {name:`Border ${index} right`,id,x:o+ow-depth,y:o+depth,width:depth,height:innerHeight});
  innerWidth=ow;innerHeight=oh;offset=o;
 }
 const schedule=batches(units.length,c), blanks=[];
 for(const [batchIndex,batch] of schedule.entries())for(let face=0;face<faceCount;face++){
  if(c.faceWoods[face]===null)continue;
  const part=motif.parts?.[face]||{envelope:motif.envelope,shape:c.kind==='triangle'?'Right isosceles triangle':'60° rhombus',angles:motif.angles};
  blanks.push({batch:`M${batchIndex+1}`,component:`Face ${face+1}`,id:c.faceWoods[face],quantity:1,
   width:part.envelope[0]+c.allowance+2*c.kerf,height:part.envelope[1]+c.allowance+2*c.kerf,length:batch.length,slices:batch.slices,shape:part.shape,angles:part.angles,netEnvelope:part.envelope,outerBase:part.outerBase,innerBase:part.innerBase});
 }
 const borderGroups=[];
 for(const frame of frames){let g=borderGroups.find(g=>g.id===frame.id&&g.width===frame.width&&g.height===frame.height);if(!g){g={...frame,count:0};borderGroups.push(g);}g.count++;}
 for(const [index,g] of borderGroups.entries())for(const [batchIndex,batch] of batches(g.count,c).entries())blanks.push({batch:`B${index+1}.${batchIndex+1}`,component:g.name.replace(/ (top|bottom|left|right)$/,''),id:g.id,quantity:1,width:g.width+c.allowance,height:g.height+c.allowance,length:batch.length,slices:batch.slices,shape:'Rectangle'});
 const unassigned=c.faceWoods.filter(id=>id===null).length;
 const volume=blanks.reduce((sum,b)=>sum+b.quantity*b.width*b.height*b.length/144,0);
 return {c,motif,units,frames,schedule,blanks,volume,unassigned,centerWidth:width,centerHeight:height,margin,
  fullUnitArea:motif.faces.reduce((s,points)=>s+area(points),0),
  trimArea:units.length*motif.faces.reduce((s,points)=>s+area(points),0)-width*height,
  sliceThickness:c.thickness+c.allowance};
}
export function compositeSteps(p){
 const {c,motif}=p;
 return [
  `Use this composite schedule instead of the square-block or row-panel schedules. All grain runs along the source-stock length and becomes the board thickness after crosscutting. The motif cross-section is viewed from the end of the stock.`,
  c.kind==='diamond'?`Build a square composite section ${number(c.size)}″ on each side: four corner triangles surround two concentric diamond frames and a square diamond core. Components 1–4 are the corners; 5–8 the outer frame; 9–12 the inner frame; 13 the core. Each frame is four mitered trapezoids with interior angles 45°/135°. Use the component diagram and exact net dimensions in the table. Assemble each frame around the core with a dry-fit before gluing; this needs additional subassembly glue-ups.`:c.kind==='triangle'?`Prepare four long triangular prisms per composite blank. Each has 45° / 45° / 90° interior angles, two equal legs ${number(motif.edge)}″, and hypotenuse ${number(c.size)}″. Join four 90° corners at the center with hypotenuses facing outward to form a ${number(c.size)}″ square. Faces 1–4 run clockwise from the top.`:
   `Prepare three long rhombic prisms per composite blank. Each has side ${number(c.size)}″, altitude ${number(motif.envelope[1])}″, and interior angles 60° / 120°. Join three 120° corners at the center to make a regular hexagonal blank, ${number(motif.width)}″ wide × ${number(motif.height)}″ high. Faces 1, 2, 3 are top, lower right, and lower left.`,
  `The cut list budgets one oversized rectangular source blank per component prism; no two-for-one yield is assumed. Angled-part envelopes include the cross-section allowance plus two kerfs on each bounding dimension. These are stock estimates, not saw fence or blade settings. Develop a suitable jig and verify a scrap cross-section before milling final stock.`,
  `First glue-up: match the numbered motif diagram, glue the long prism faces, and keep the composite blank straight and its section accurate. Follow adhesive cure times. Do not rotate individual prisms so their grain crosses the blank length. Make ${p.schedule.length} motif blanks, using the listed batch lengths and slice counts.`,
  `Square a stock end, then crosscut slices at ${number(p.sliceThickness)}″ along the grain. Each batch reserves one ${number(c.kerf)}″ kerf per slice and ${number(c.endTrim)}″ trimming at each stock end. Available stock length is a cap, not a minimum safe workpiece length; allow additional material for fixtures and safe support.`,
  `Turn slices end grain up. The diagram is the reference end view: keep face labels in that orientation before rotating clockwise by the map angle. Dry-fit numbered units at their mapped positions. Units marked “trim” are full slices before perimeter trimming; their entire material is included in the schedule.`,
  `Second glue-up: assemble the dry-fit mosaic using appropriate cauls and fixtures, maintaining grain through the board thickness. ${c.kind==='cube'?'Hexagonal units form a staggered tessellation with a stepped perimeter; keep sacrificial outside portions until the mosaic has cured.':'Square units meet along full edges; alternate or custom rotations change the pinwheel effect.'} Cure before trimming the center to ${number(p.centerWidth)}″ × ${number(p.centerHeight)}″ at the marked rectangle.`,
  p.frames.length?`Prepare the end-grain rectangular border pieces from their listed stock with the same slice thickness. Fit the inner border around the trimmed center, then each enabled outer ring in order. Top and bottom pieces span each ring’s full width; side pieces fit between them. Glue each ring in a separate operation after checking the dry-fit. These borders require additional glue-ups beyond the two-stage center assembly.`:`No border is enabled. Trim the cured center to the final board footprint.`,
  `Flatten cured end grain using a suitable router sled or drum sander to ${number(c.thickness)}″, then finish to ${number(c.width)}″ × ${number(c.length)}″. Avoid an end-grain thickness-planer pass. Ease edges and use an appropriate food-contact finish. Confirm species suitability and stock condition before fabrication.`
 ];
}
export const number=n=>Number(n.toFixed(3)).toString();
export function compositeCsv(p){
 const rows=[['Composite cutting board plan'],['Unit',p.c.kind],['Finished board W × L × T (in)',p.c.width,p.c.length,p.c.thickness],['Status',p.unassigned?'INCOMPLETE':'Geometry-derived plan; verify machining on scrap'],['Grain direction','Along stock length; perpendicular to finished board face'],['Unit dimension',p.c.size],['Component interior angles',p.motif.angles],[],['Source face','Wood','Finished polygon in reference end-view coordinates (in)'],...p.motif.faces.map((points,i)=>[i+1,p.c.faceWoods[i]||'unassigned',JSON.stringify(points)]),[],['Rough slice thickness',p.sliceThickness],['Kerf per crosscut',p.c.kerf],['End trim at EACH stock end',p.c.endTrim],['Rough blank volume (bd ft)',p.volume],['Stock budget','One rectangular blank per component; excludes defects, extra workholding and long rip losses'],[],['Batch','Component','Wood','Rectangular blanks','Rough envelope W','Rough envelope H','Grain length','Slices','Finished component shape','Interior angles','Net envelope W','Net envelope H','Outer base','Inner base'],...p.blanks.map(b=>[b.batch,b.component,woods.find(w=>w.id===b.id).name,b.quantity,b.width,b.height,b.length,b.slices,b.shape,b.angles||'90°',...(b.netEnvelope||[b.width-p.c.allowance,b.height-p.c.allowance]),b.outerBase??'',b.innerBase??'']),[],['Unit number','Lattice key','Origin X (in)','Origin Y (in)','Clockwise rotation (deg)','Perimeter trim'],...p.units.map(u=>[u.number,u.key,u.x,u.y,u.angle,u.cropped?'yes':'no']),[],['Unit','Source face','Wood','Visible polygon coordinates (board origin top-left, inches)'],...p.units.flatMap(u=>u.faces.map(f=>[u.number,f.source+1,f.id||'unassigned',JSON.stringify(f.points)])),[],['Border piece','Wood','Finished X','Finished Y','Origin X','Origin Y'],...p.frames.map(f=>[f.name,f.id,f.width,f.height,f.x,f.y]),[],['Step','Instructions'],...compositeSteps(p).map((step,i)=>[i+1,step])];
 return rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\n');
}
