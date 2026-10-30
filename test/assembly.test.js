import {test} from 'node:test';
import assert from 'node:assert/strict';
import {plan} from '../src/planner.js';
import {panelPlan} from '../src/assembly.js';
const c={width:12,length:16,thickness:1.5,border:.75,border2:.5,borderWood:'sapele',borderWood2:'purpleheart',rows:8,cols:8,allowance:.125,kerf:.125,palette:['walnut','maple'],pattern:'houndstooth'};
test('panel slices reconstruct every row including both borders',()=>{const board=plan(c),a=panelPlan(c,board);assert.equal(a.order.length,board.ys.length);for(let r=0;r<board.ys.length;r++){const p=a.panels.find(p=>p.name===a.order[r]);assert.equal(p.rowDepth,board.ys[r]);assert.ok(Math.abs(p.runs.reduce((s,g)=>s+g.width,0)-c.width)<1e-8);const source=board.cells.filter(cell=>cell.r===r);let x=0;for(const run of p.runs){let consumed=0;while(consumed<run.width-1e-8){assert.equal(source[x].id,run.id);consumed+=source[x++].x;}assert.ok(Math.abs(consumed-run.width)<1e-8);}assert.equal(x,source.length);}assert.equal(a.panels.reduce((s,p)=>s+p.slices,0),board.ys.length);});
test('panel length budgets slice thickness, every kerf and end trim',()=>{const a=panelPlan(c,plan(c));for(const p of a.panels)assert.equal(p.stockLength,p.slices*(1.625+.125)+.125);});
test('no panel schedule for incomplete blank boards',()=>{assert.equal(panelPlan(c,plan({...c,pattern:'blank'})),null);});
test('houndstooth study repeats in an eight-cell unit',()=>{const p=plan({...c,border:0,border2:0,rows:16,cols:16});for(let r=0;r<8;r++)for(let col=0;col<8;col++){assert.equal(p.cells[r*16+col].id,p.cells[(r+8)*16+col+8].id);}assert.equal(new Set(p.cells.map(cell=>cell.id)).size,2);});
