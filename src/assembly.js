// A panel's face is X × grain-length, and its milled thickness becomes row Y.
export function panelPlan(c, board) {
 if(board.unassigned) return null;
 const panels=[], order=[];
 for(let r=0;r<board.ys.length;r++){
  const runs=[];
  for(const cell of board.cells.filter(cell=>cell.r===r)){
   const last=runs.at(-1);
   if(last?.id===cell.id)last.width+=cell.x;
   else runs.push({id:cell.id,width:cell.x});
  }
  const key=JSON.stringify([board.ys[r],runs.map(run=>[run.id,Number(run.width.toFixed(8))])]);
  let panel=panels.find(p=>p.key===key);
  if(!panel){panel={key,name:`P${panels.length+1}`,rowDepth:board.ys[r],runs,slices:0};panels.push(panel);}
  panel.slices++;order.push(panel.name);
 }
 const sliceThickness=c.thickness+c.allowance;
 for(const p of panels){
  // Reserve a separating cut for every slice plus combined end-trimming allowance.
  p.stockLength=p.slices*(sliceThickness+c.kerf)+c.allowance;
  p.strips=p.runs.map(run=>({...run,roughWidth:run.width+c.allowance,roughThickness:p.rowDepth+c.allowance,length:p.stockLength}));
 }
 return {panels,order,sliceThickness,volume:panels.reduce((sum,p)=>sum+p.strips.reduce((s,strip)=>s+strip.roughWidth*strip.roughThickness*strip.length/144,0),0)};
}
