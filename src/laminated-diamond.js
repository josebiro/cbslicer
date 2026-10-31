import {laminationStack} from './laminations.js';
export function defaultBars(){const A=[{wood:'purpleheart',weight:50},{wood:'maple',weight:16},{wood:'walnut',weight:16},{wood:'maple',weight:18}];return {A,B:structuredClone(A).reverse()};}
function clipLinear(poly,a,b,bound,above){const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],pv=a*p[0]+b*p[1]-bound,qv=a*q[0]+b*q[1]-bound,pi=above?pv>=-1e-10:pv<=1e-10,qi=above?qv>=-1e-10:qv<=1e-10;if(pi)out.push(p);if(pi!==qi){const t=pv/(pv-qv);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}}return out;}
export function laminatedMotif(size,bars=defaultBars(),quarters=['A','A','A','A'],settings={}){
 const assembly=settings.assembly??'strips',shaping=settings.shaping??'bevel45',quarterTurns=settings.quarterTurns??[0,1,2,3];
 if(!['strips','squares'].includes(assembly)||!['none','bevel45'].includes(shaping))throw Error('Choose a valid bar assembly and shaping operation.');
 if(!Array.isArray(quarterTurns)||quarterTurns.length!==4||quarterTurns.some(t=>!Number.isInteger(t)||t<0||t>3))throw Error('Quarter rotations must be 0°, 90°, 180° or 270°.');
 if(!Array.isArray(quarters)||quarters.length!==4||quarters.some(k=>!['A','B'].includes(k)))throw Error('Assign A or B to each of four quarters.');
 const q=size/2,height=shaping==='bevel45'?q*Math.SQRT2:q,stacks={};
 for(const key of ['A','B']){
  const layers=bars?.[key];if(!Array.isArray(layers)||layers.length<2||layers.length>4||layers.some(l=>!Number.isFinite(l.weight)||l.weight<=0))throw Error('Each bar needs 2–4 layers with positive relative thicknesses.');
  const total=layers.reduce((s,l)=>s+l.weight,0);
  const stack=laminationStack(layers.map(l=>({wood:l.wood,thickness:height*l.weight/total})),{width:height,length:1});
  if(assembly==='squares'){
   if(layers.length!==4)throw Error('The four-square bar needs exactly four square pieces.');
   stack.strips=stack.strips.map((strip,i)=>({...strip,width:height/2,thickness:height/2,x:[0,1,1,0][i]*height/2,y:[0,0,1,1][i]*height/2}));
  }
  stacks[key]=stack;
 }
 const faces=[],ids=[],meta=[];
 // Native stock coordinates as affine functions of the finished square coordinates.
 const X=shaping==='bevel45'?[1/Math.SQRT2,-1/Math.SQRT2,height/2]:[1,0,0],Y=shaping==='bevel45'?[1/Math.SQRT2,1/Math.SQRT2,0]:[0,1,0];
 for(let quarter=0;quarter<4;quarter++){
  const key=quarters[quarter],stack=stacks[key];
  stack.strips.forEach((strip,index)=>{
   let points=[[0,0],[q,0],[q,q],[0,q]];
   const cut=(axis,low,high)=>{points=clipLinear(points,axis[0],axis[1],low-axis[2],true);points=clipLinear(points,axis[0],axis[1],high-axis[2],false);};
   if(assembly==='squares'){cut(X,strip.x,strip.x+strip.width);cut(Y,strip.y,strip.y+strip.thickness);}else cut(Y,strip.offset,strip.offset+strip.thickness);
   for(let turn=0;turn<quarterTurns[quarter];turn++)points=points.map(([x,y])=>[q-y,x]);
   const [ox,oy]=[[0,0],[q,0],[q,q],[0,q]][quarter];
   faces.push(points.map(([x,y])=>[x+ox,y+oy]));ids.push(strip.wood);meta.push({bar:key,layer:index,quarter});
  });
 }
 return {width:size,height:size,faces,ids,meta,stacks,quarters,quarterTurns,assembly,shaping,barSpan:height,quarterSide:q,rotationStep:90,turns:4,angles:shaping==='bevel45'?'Square bar shaped with four 45° cuts':'Unshaped square bar'};
}
export function laminatedBlanks(motif,unitCount,c){
 const slice=c.thickness+c.allowance,pitch=slice+c.kerf,capacity=Math.floor((c.stockLength-2*c.endTrim+1e-9)/pitch);
 if(capacity<1)throw Error('Stock length must fit a quarter slice, kerf and end trims.');
 const blanks=[],schedule=[];
 for(const key of ['A','B']){
  const perRepeat=motif.quarters.filter(k=>k===key).length;let remaining=unitCount*perRepeat,batch=0;
  while(remaining>0){const slices=Math.min(remaining,capacity),length=slices*pitch+2*c.endTrim,id=`${key}${++batch}`;schedule.push({bar:key,name:id,slices,length});
   for(const strip of motif.stacks[key].strips)blanks.push({batch:id,component:`Bar ${key} · layer ${strip.order}`,id:strip.wood,quantity:1,width:strip.width+c.allowance,height:strip.thickness+c.allowance,length,slices,shape:motif.assembly==='squares'?'Square stock for four-piece bar':motif.shaping==='none'?'Rectangular lamination (unshaped)':'Rectangular lamination before beveling',netEnvelope:[strip.width,strip.thickness],angles:motif.shaping==='bevel45'?'Straight stock; assembled bar shaped at 45°':'Straight stock; no shaping cuts'});
   remaining-=slices;
  }
 }
 return {blanks,schedule};
}
export function laminationSteps(p){return [
 p.motif.assembly==='squares'?'Prepare four long square-section pieces per source bar, in top-left, top-right, bottom-right, bottom-left order. Glue them as a 2 × 2 square with all grain along the bar length. Each piece has side '+(p.motif.barSpan/2).toFixed(3)+'″.':'Prepare rectangular laminations and mill each layer to its listed finished thickness before glue-up, in the listed A/B orders. All grain runs along the stock length. Layer 1 is the outer-corner end of the diagonal bands; the last layer meets the diamond center.',
 `Glue each stack into a straight bar. Dress the assembled width to ${p.motif.barSpan.toFixed(3)}″ and verify the stack height is ${p.motif.barSpan.toFixed(3)}″ without changing the specified layer thicknesses. Individual layer allowances are removed during preparation; the table lists each finished layer thickness.`,
 p.motif.shaping==='none'?'Keep the square bar as glued: there are no bevel or shaping cuts. Confirm its cross-section is square before crosscutting.':`Viewed end-on, mark the midpoint of each of the four sides. Four 45° cuts connecting adjacent midpoints form an inscribed square. Its side is ${p.motif.quarterSide.toFixed(3)}″. The bar runs lengthwise through this square. The layer boundaries now cross the shaped square diagonally. Keep the square centered in the stack; do not shift the bevels relative to the layers. Cut outside the layout lines and dress to them, using suitable fixtures. Blade settings depend on machine and workholding.`,
 p.motif.shaping==='none'?'The unshaped model retains 100% of the milled bar area; only specified milling, crosscut and trimming allowances are budgeted.':`This shaping model retains 50% of the milled square cross-sectional area; the four corner offcuts are not counted as reusable stock. Rough rectangular lamination volumes include this bevel loss. No separately shaped colored regions are required.`,
 `Crosscut each shaped bar at ${p.sliceThickness.toFixed(3)}″ along the grain. Each batch reserves a separating kerf per slice and trim at both stock ends. One repeat needs four quarter slices, allocated to A/B as shown.`,
 'Turn slices end grain up. Rotate the top-left, top-right, bottom-right, bottom-left quarters by '+p.motif.quarterTurns.map(t=>t*90+'°').join(', ')+' clockwise from their reference end views. Use the specified A/B bar in each position.',
 'Dry-fit the quarter slices into repeats, then arrange repeats by the numbered board map. Board-map rotations apply to the assembled four-quarter repeat. Glue the layout with appropriate cauls, cure and trim the center rectangle.',
 'Fit enabled end-grain border rings from inside to outside, then flatten with an appropriate sled or drum sander to final thickness, ease edges and finish. Add workholding stock and validate a scrap bar before machining final stock.'
 ];}
