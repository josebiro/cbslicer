import {woods} from './planner.js';
// Source laminations are rectangles before the assembled bar is bevel-shaped.
// Bevel yield belongs to the bar geometry, not to this lamination schedule.
export function laminationStack(layers,{width,length,allowance=0}){
 if(!Array.isArray(layers)||layers.length<2||layers.length>4)throw Error('Use two to four laminations per bar.');
 if(![width,length,allowance].every(Number.isFinite)||width<=0||length<=0||allowance<0)throw Error('Enter valid stock dimensions.');
 let offset=0;
 const strips=layers.map((layer,index)=>{
  if(!woods.some(w=>w.id===layer.wood)||!Number.isFinite(layer.thickness)||layer.thickness<=0)throw Error('Each lamination needs a wood species and positive milled thickness.');
  const strip={order:index+1,wood:layer.wood,thickness:layer.thickness,offset,width,length,roughThickness:layer.thickness+allowance};
  offset+=layer.thickness;return strip;
 });
 return {strips,milledWidth:width,milledHeight:offset,length,roughVolume: strips.reduce((sum,s)=>sum+s.width*s.roughThickness*s.length/144,0)};
}
