import {test} from 'node:test';
import assert from 'node:assert/strict';
import {carveTerrain,caveCutouts} from '../dist/terrain-cutouts.js';
import {ADVENTURES} from '../dist/places.js';

function area(positions,indices){let sum=0;for(let i=0;i<indices.length;i+=3){const [a,b,c]=indices.slice(i,i+3).map(n=>[positions[n*3],positions[n*3+2]]);sum+=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;}return sum;}
function covered(x,z,positions,indices){for(let i=0;i<indices.length;i+=3){const tri=indices.slice(i,i+3).map(n=>[positions[n*3],positions[n*3+2]]),signs=tri.map((a,j)=>{const b=tri[(j+1)%3];return(b[0]-a[0])*(z-a[1])-(b[1]-a[1])*(x-a[0]);});if(signs.some(s=>Math.abs(s)>1e-7)&&(signs.every(s=>s>=-1e-7)||signs.every(s=>s<=1e-7)))return true;}return false;}
test('terrain subtraction removes an exact opening without deleting the rest of crossing triangles',()=>{
 const positions=[-20,0,-20,20,0,-20,20,0,20,-20,0,20],colors=Array(12).fill(.5),indices=carveTerrain(positions,colors,[0,2,1,0,3,2],[{minX:-3,maxX:3,minZ:-4,maxZ:4}]);
 assert.ok(Math.abs(area(positions,indices)-(1600-48))<1e-6);assert.ok(positions.every(Number.isFinite));assert.equal(colors.length,positions.length);
 for(let x=-2.5;x<3;x+=.5)for(let z=-3.5;z<4;z+=.5)assert.equal(covered(x,z,positions,indices),false);
 for(const [x,z] of [[-10,0],[10,0],[0,10],[0,-10]])assert.equal(covered(x,z,positions,indices),true);
});
test('all four descending entrances are clear while grass outside the mountain is preserved',()=>{
 const cutouts=caveCutouts();assert.equal(cutouts.length,8);
 for(const site of ADVENTURES.filter(s=>s.kind==='cave')){
  const positions=[site.x-60,0,site.z-60,site.x+60,0,site.z-60,site.x+60,0,site.z+60,site.x-60,0,site.z+60],colors=Array(12).fill(.5);
  const indices=carveTerrain(positions,colors,[0,2,1,0,3,2]);
  for(const z of [20,0,-21,-27,-33,-40])assert.equal(covered(site.x,site.z+z,positions,indices),false);
  for(const [x,z] of [[0,35],[25,0],[0,-50]])assert.equal(covered(site.x+x,site.z+z,positions,indices),true);
 }
});
