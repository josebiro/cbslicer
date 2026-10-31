import {test} from 'node:test';
import assert from 'node:assert/strict';
import {designs,designConfig} from '../src/designs.js';
import {compositePlan} from '../src/composite.js';
test('every collection design produces a complete, exportable physical layout',()=>{assert.equal(new Set(designs.map(d=>d.id)).size,designs.length);for(const design of designs){const p=compositePlan(designConfig(design));assert.equal(p.unassigned,0);assert.ok(p.units.length>0);assert.ok(p.blanks.length>0);assert.ok(p.volume>0);}});
test('editor changes cannot mutate shared collection presets',()=>{const original=designs[0].faceWoods[0],a=designConfig(designs[0]);a.faceWoods[0]='walnut';a.rotations['0,0']=1;assert.equal(designs[0].faceWoods[0],original);assert.deepEqual(designConfig(designs[0]).rotations,{});});
