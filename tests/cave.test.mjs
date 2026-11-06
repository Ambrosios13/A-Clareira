import {goblinWalkable,interiorFloor} from '../dist/underground-model.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shellData,mountainData,caveWidth,caveFloor,caveRoof,constrainCavePoint,caveWalkable} from '../dist/cave-model.js';
import {createGoblins} from '../dist/goblin-model.js';
import {ADVENTURES} from '../dist/places.js';
import {terrainHeight,insideFarm} from '../dist/world.js';

test('detailed mountain and cavern meshes have valid indices and an open mouth',()=>{
 const shell=shellData(),mountain=mountainData(),distant=mountainData(40,64);
 assert.equal(shell.indices.length/3,65536);assert.ok(mountain.indices.length/3>90000);assert.ok(distant.indices.length<mountain.indices.length/10);
 for(const mesh of [shell,mountain,distant]){assert.ok(mesh.positions.every(Number.isFinite));assert.ok(mesh.indices.every(i=>Number.isInteger(i)&&i>=0&&i<mesh.positions.length/3));}
 for(let i=0;i<mountain.indices.length;i+=3){const ids=mountain.indices.slice(i,i+3),center=[0,1,2].map(axis=>ids.reduce((sum,id)=>sum+mountain.positions[id*3+axis],0)/3);assert.ok(!(center[2]>17&&Math.abs(center[0])<5.3&&center[1]<8.2));}
 assert.ok(caveWidth(0)>caveWidth(25)*3);
});
test('camera constraints leave clearance from the irregular vault and floor',()=>{
 for(let z=-40;z<=50;z+=.75)for(let x=-20;x<=20;x+=2)for(const y of [-10,2,40]){const p=constrainCavePoint(x,y,z);assert.ok(Math.abs(p.x)<caveWidth(p.z));assert.ok(p.y>=caveFloor(p.x,p.z)+1.24);assert.ok(p.y<=caveRoof(p.x,p.z)-.74);assert.ok(p.z>=-19&&p.z<=29);}
 for(const site of ADVENTURES.filter(s=>s.kind==='cave')){assert.equal(terrainHeight(site.x,site.z+30),terrainHeight(site.x,site.z));assert.ok(insideFarm(site.x+42,site.z));}
});
test('goblins roam, form reciprocal conversations and avoid walls, props and each other',()=>{
 for(const seed of [712,Math.abs(-190*37+260),Math.abs(290*37+250)]){const world=createGoblins(seed),distance=world.goblins.map(g=>g.distance);let conversations=0;
 for(let tick=0;tick<3600;tick++){world.update(1/30);for(const g of world.goblins){assert.ok(goblinWalkable(g.x,g.z));assert.equal(g.y,interiorFloor(g.x,g.z));for(const other of world.goblins)if(other!==g)assert.ok(Math.hypot(g.x-other.x,g.z-other.z)>.79);if(g.partner!==null)assert.equal(world.goblins[g.partner].partner,g.index);if(g.mode==='chat')conversations++;}}
 assert.ok(conversations>100);assert.ok(world.goblins.every((g,i)=>g.distance>distance[i]+5));}
});
test('pause freezes goblins; greeting interrupts a pair and walking resumes',()=>{
 const world=createGoblins(712);for(let i=0;i<1000&&!world.goblins.some(g=>g.mode==='chat');i++)world.update(.05);const goblin=world.goblins.find(g=>g.mode==='chat');assert.ok(goblin);const partner=world.goblins[goblin.partner];world.greet(goblin.index);assert.equal(goblin.mode,'greet');assert.equal(partner.partner,null);assert.equal(goblin.partner,null);
 const snapshot=JSON.stringify(world.goblins),time=world.time;world.update(0);assert.equal(JSON.stringify(world.goblins),snapshot);assert.equal(world.time,time);for(let i=0;i<100;i++)world.update(.05);assert.notEqual(goblin.mode,'greet');
 const a=createGoblins(45),b=createGoblins(45);for(let i=0;i<300;i++){a.update(.05);b.update(.05);}assert.deepEqual(a.goblins,b.goblins);
});
