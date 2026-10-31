import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectUnits,rotateUnits,hull} from '../src/rotation-composer.js';
const units=[{key:'-1,0',row:-1,col:0,turns:2},{key:'0,0',row:0,col:0,turns:0},{key:'0,1',row:0,col:1,turns:1},{key:'1,1',row:1,col:1,turns:3}];
test('repeating selections work with cropped negative lattice coordinates',()=>{assert.deepEqual(selectUnits(units,'checker'),['0,0','1,1']);assert.deepEqual(selectUnits(units,'rows'),['0,0','0,1']);assert.deepEqual(selectUnits(units,'invert',['0,0','1,1']),['-1,0','0,1']);});
test('group rotation uses visible turns and preserves unselected overrides',()=>{const existing={'-1,0':2};assert.deepEqual(rotateUnits(units,['0,0','1,1'],1,4,existing),{'-1,0':2,'0,0':1,'1,1':0});assert.deepEqual(existing,{'-1,0':2});assert.equal(rotateUnits(units,['0,0'],-1,3,{})['0,0'],2);});
test('selection outline removes inner seams without changing the footprint',()=>{assert.deepEqual(hull([[0,0],[1,0],[1,1],[0,1],[.5,.5],[0,0]]),[[0,0],[1,0],[1,1],[0,1]]);});
