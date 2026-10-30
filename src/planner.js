export const woods = [
 {id:'walnut',name:'Black walnut',color:'#644431'},
 {id:'maple',name:'Hard maple',color:'#e8c995'},
 {id:'sapele',name:'Sapele',color:'#a45d3c'},
 {id:'purpleheart',name:'Purpleheart',color:'#794563'},
 {id:'cherry',name:'Cherry',color:'#bf8255'},
 {id:'oak',name:'White oak',color:'#b79a67'}
];
export function plan(c){
 c={...c,border2:c.border2??0,borderWood2:c.borderWood2??c.borderWood};
 for(const key of ['width','length','thickness','border','border2','kerf','allowance'])if(!Number.isFinite(c[key])||c[key]<0)throw Error('Enter valid, non-negative dimensions.');
 if(c.width<=0||c.length<=0||c.thickness<=0||!Number.isInteger(c.cols)||!Number.isInteger(c.rows)||c.cols<1||c.rows<1||c.cols>30||c.rows>30)throw Error('Use positive dimensions and 1–30 rows and columns.');
 if((c.border+c.border2)*2>=Math.min(c.width,c.length))throw Error('The border must leave room for the center pattern.');
 if(!c.palette.length||[...c.palette,c.borderWood,c.borderWood2].some(id=>!woods.some(w=>w.id===id)))throw Error('Choose a valid wood palette.');
 const b=c.border>0, outer=c.border2>0, layers=Number(b)+Number(outer), margin=c.border+c.border2, xs=Array(c.cols).fill((c.width-2*margin)/c.cols),ys=Array(c.rows).fill((c.length-2*margin)/c.rows);
 if(b){xs.unshift(c.border);xs.push(c.border);ys.unshift(c.border);ys.push(c.border);}
 if(outer){xs.unshift(c.border2);xs.push(c.border2);ys.unshift(c.border2);ys.push(c.border2);}
 const cells=[], groups=new Map();
 ys.forEach((y,r)=>xs.forEach((x,col)=>{
 const outerEdge=outer&&(r===0||col===0||r===ys.length-1||col===xs.length-1);
 const edge=r<layers||col<layers||r>=ys.length-layers||col>=xs.length-layers,i=col-layers,j=r-layers;
 let p=c.pattern==='stripes'?i:c.pattern==='diagonal'?i+j:c.pattern==='basket'?Math.floor(i/2)+Math.floor(j/2):i+j;
 const twill=((i-j)%4+4)%4<2;
 const houndstooth=twill?Math.floor(i/4)%2:Math.floor(j/4)%2;
 const brick=(Math.floor((i+(j%2)*2)/4)+j)%2;
 if(c.pattern==='houndstooth'||c.pattern==='brick')p=c.pattern==='houndstooth'?houndstooth:brick;
 const id=edge?(outerEdge?c.borderWood2:c.borderWood):(Object.hasOwn(c.overrides||{},`${j},${i}`)?c.overrides[`${j},${i}`]:c.pattern==='blank'?null:c.palette[p%c.palette.length]);
 const cell={x,y,r,col,id,edge,key:`${j},${i}`};cells.push(cell);
 if(id===null)return;
 if(!woods.some(w=>w.id===id))throw Error('Choose a valid wood for each block.');
 const k=[id,x.toFixed(8),y.toFixed(8)].join('|');
 if(!groups.has(k))groups.set(k,{id,x,y,count:0});groups.get(k).count++;
 }));
 const cuts=[...groups.values()].map(g=>({...g,roughX:g.x+c.allowance,roughY:g.y+c.allowance,roughZ:c.thickness+c.allowance}));
 const volume=cuts.reduce((s,g)=>s+g.count*g.roughX*g.roughY*g.roughZ,0)/144;
 return {xs,ys,cells,cuts,volume,total:cells.length,unassigned:cells.filter(cell=>cell.id===null).length};
}
