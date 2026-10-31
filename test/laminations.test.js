import {test} from 'node:test';
import assert from 'node:assert/strict';
import {laminationStack} from '../src/laminations.js';
const stock={width:3,length:24,allowance:.125};
const layers=[{wood:'walnut',thickness:.25},{wood:'maple',thickness:.125},{wood:'purpleheart',thickness:.5}];
test('a laminated bar is built from rectangular strips in glue-up order',()=>{const p=laminationStack(layers,stock);assert.deepEqual(p.strips.map(s=>s.offset),[0,.25,.375]);assert.equal(p.milledHeight,.875);assert.equal(p.strips[1].roughThickness,.25);assert.equal(p.roughVolume,3*24*(.875+3*.125)/144);});
test('A/B bar sequences can share stock sizes while changing the layer order',()=>{const a=laminationStack(layers,stock),b=laminationStack([...layers].reverse(),stock);assert.equal(a.roughVolume,b.roughVolume);assert.notDeepEqual(a.strips.map(s=>s.wood),b.strips.map(s=>s.wood));});
test('invalid laminations are rejected before any shaping calculation',()=>{for(const layers of [[],[{wood:'maple',thickness:1}],Array(5).fill({wood:'maple',thickness:1}),[{wood:'maple',thickness:0},{wood:'walnut',thickness:1}]])assert.throws(()=>laminationStack(layers,stock));});
