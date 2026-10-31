import {laminationStack} from './laminations.js';
export function defaultBars(){const A=[{wood:'purpleheart',weight:50},{wood:'maple',weight:16},{wood:'walnut',weight:16},{wood:'maple',weight:18}];return {A,B:structuredClone(A).reverse()};}
function clipBand(poly,bound,keepAbove){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],av=a[0]+a[1]-bound,bv=b[0]+b[1]-bound,ai=keepAbove?av>=-1e-10:av<=1e-10,bi=keepAbove?bv>=-1e-10:bv<=1e-10;if(ai)out.push(a);if(ai!==bi){const t=av/(av-bv);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}return out;}
export function laminatedMotif(size,bars=defaultBars(),quarters=['A','A','A','A']){
 if(!Array.isArray(quarters)||quarters.length!==4||quarters.some(k=>!['A','B'].includes(k)))throw Error('Assign A or B to each of four quarters.');
 const height=size/Math.SQRT2,q=size/2,stacks={};
 for(const key of ['A','B']){
  const layers=bars?.[key];if(!Array.isArray(layers)||layers.length<2||layers.length>4||layers.some(l=>!Number.isFinite(l.weight)||l.weight<=0))throw Error('Each bar needs 2–4 layers with positive relative thicknesses.');
  const total=layers.reduce((s,l)=>s+l.weight,0);
  stacks[key]=laminationStack(layers.map(l=>({wood:l.wood,thickness:height*l.weight/total})),{width:height,length:1});
 }
 const faces=[],ids=[],meta=[];
 for(let quarter=0;quarter<4;quarter++){
  const key=quarters[quarter],stack=stacks[key];
  stack.strips.forEach((strip,index)=>{
   let points=clipBand([[0,0],[q,0],[q,q],[0,q]],2*q*strip.offset/height,true);
   points=clipBand(points,2*q*(strip.offset+strip.thickness)/height,false);
   for(let turn=0;turn<quarter;turn++)points=points.map(([x,y])=>[q-y,x]);
   const [ox,oy]=[[0,0],[q,0],[q,q],[0,q]][quarter];
   faces.push(points.map(([x,y])=>[x+ox,y+oy]));ids.push(strip.wood);meta.push({bar:key,layer:index,quarter});
  });
 }
 return {width:size,height:size,faces,ids,meta,stacks,quarters,barSpan:height,quarterSide:q,rotationStep:90,turns:4,angles:'Square quarter bars with diagonal lamination bands'};
}
export function laminatedBlanks(motif,unitCount,c){
 const slice=c.thickness+c.allowance,pitch=slice+c.kerf,capacity=Math.floor((c.stockLength-2*c.endTrim+1e-9)/pitch);
 if(capacity<1)throw Error('Stock length must fit a quarter slice, kerf and end trims.');
 const blanks=[],schedule=[];
 for(const key of ['A','B']){
  const perRepeat=motif.quarters.filter(k=>k===key).length;let remaining=unitCount*perRepeat,batch=0;
  while(remaining>0){const slices=Math.min(remaining,capacity),length=slices*pitch+2*c.endTrim,id=`${key}${++batch}`;schedule.push({bar:key,name:id,slices,length});
   for(const strip of motif.stacks[key].strips)blanks.push({batch:id,component:`Bar ${key} · layer ${strip.order}`,id:strip.wood,quantity:1,width:motif.barSpan+c.allowance,height:strip.thickness+c.allowance,length,slices,shape:'Rectangular lamination before beveling',netEnvelope:[motif.barSpan,strip.thickness],angles:'Straight stock; assembled bar shaped at 45°'});
   remaining-=slices;
  }
 }
 return {blanks,schedule};
}
export function laminationSteps(p){return [
 'Prepare rectangular laminations and mill each layer to its listed finished thickness before glue-up, in the listed A/B orders. All grain runs along the stock length. Layer 1 is the outer-corner end of the diagonal bands; the last layer meets the diamond center.',
 `Glue each stack into a straight bar. Dress the assembled width to ${p.motif.barSpan.toFixed(3)}″ and verify the stack height is ${p.motif.barSpan.toFixed(3)}″ without changing the specified layer thicknesses. Individual layer allowances are removed during preparation; the table lists each finished layer thickness.`,
 `Viewed end-on, mark the midpoint of each of the four sides. Four 45° cuts connecting adjacent midpoints form an inscribed square. Its side is ${p.motif.quarterSide.toFixed(3)}″. The bar runs lengthwise through this square. The layer boundaries now cross the shaped square diagonally. Keep the square centered in the stack; do not shift the bevels relative to the layers. Cut outside the layout lines and dress to them, using suitable fixtures. Blade settings depend on machine and workholding.`,
 `This shaping model retains 50% of the milled square cross-sectional area; the four corner offcuts are not counted as reusable stock. Rough rectangular lamination volumes include this bevel loss. No separately shaped colored regions are required.`,
 `Crosscut each shaped bar at ${p.sliceThickness.toFixed(3)}″ along the grain. Each batch reserves a separating kerf per slice and trim at both stock ends. One repeat needs four quarter slices, allocated to A/B as shown.`,
 'Turn slices end grain up. From the reference end view, rotate top-left 0°, top-right 90°, bottom-right 180°, bottom-left 270° clockwise. Use the specified A/B bar in each position; this joins four diagonal-band squares into a diamond repeat.',
 'Dry-fit the quarter slices into repeats, then arrange repeats by the numbered board map. Board-map rotations apply to the assembled four-quarter repeat. Glue the layout with appropriate cauls, cure and trim the center rectangle.',
 'Fit enabled end-grain border rings from inside to outside, then flatten with an appropriate sled or drum sander to final thickness, ease edges and finish. Add workholding stock and validate a scrap bar before machining final stock.'
 ];}
