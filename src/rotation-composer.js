const parity=n=>((n%2)+2)%2;
export function selectUnits(units,pattern,previous=[]){
 const chosen=new Set(previous);
 if(pattern==='all')return units.map(u=>u.key);
 if(pattern==='checker')return units.filter(u=>parity(u.row+u.col)===0).map(u=>u.key);
 if(pattern==='rows')return units.filter(u=>parity(u.row)===0).map(u=>u.key);
 if(pattern==='invert')return units.filter(u=>!chosen.has(u.key)).map(u=>u.key);
 return [];
}
export function rotateUnits(units,selected,step,turnCount,existing){
 const keys=new Set(selected),next={...existing};
 for(const unit of units)if(keys.has(unit.key))next[unit.key]=((unit.turns+step)%turnCount+turnCount)%turnCount;
 return next;
}
export function hull(points){
 const sorted=[...new Map(points.map(p=>[p.join(','),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 if(sorted.length<3)return sorted;
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const half=list=>{const out=[];for(const point of list){while(out.length>=2&&cross(out.at(-2),out.at(-1),point)<=1e-9)out.pop();out.push(point);}return out;};
 return [...half(sorted).slice(0,-1),...half([...sorted].reverse()).slice(0,-1)];
}
