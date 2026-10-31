import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compositePlan,area} from '../src/composite.js';
import {designConfig,designs} from '../src/designs.js';
import {validateProject} from '../src/projects.js';
const config={...designConfig(designs.find(d=>d.kind==='laminated')),kind:'diamond'};
test('frame proportions change physical prism dimensions while exactly covering the repeat',()=>{for(const [outer,inner] of [[.12,.12],[.52,.18],[.04,.9],[.7,.15]]){const p=compositePlan({...config,diamondOuterRatio:outer,diamondInnerRatio:inner});assert.ok(Math.abs(p.motif.faces.reduce((sum,points)=>sum+area(points),0)-config.size**2)<1e-8);assert.ok(Math.abs(p.motif.parts[4].envelope[1]-config.size/(2*Math.SQRT2)*outer)<1e-8);assert.ok(Math.abs(p.motif.parts[8].envelope[1]-config.size/(2*Math.SQRT2)*inner)<1e-8);assert.ok(Math.abs(p.motif.parts[12].envelope[0]-config.size/Math.SQRT2*(1-outer-inner))<1e-8);}});
test('project validation retains custom proportions and old projects retain default geometry',()=>{const original=compositePlan(config),balanced=compositePlan({...config,diamondOuterRatio:.32,diamondInnerRatio:.32});assert.deepEqual(original.motif,balanced.motif);const p=validateProject({version:1,name:'Fine line',config:{...config,diamondOuterRatio:.12,diamondInnerRatio:.12}});assert.equal(p.config.diamondOuterRatio,.12);assert.equal(p.config.diamondInnerRatio,.12);});
test('impossible or non-numeric frames are rejected',()=>{for(const pair of [[0,.2],[-.1,.2],[.8,.2],[.8,.3],[NaN,.2],[.2,Infinity]])assert.throws(()=>compositePlan({...config,diamondOuterRatio:pair[0],diamondInnerRatio:pair[1]}));});
