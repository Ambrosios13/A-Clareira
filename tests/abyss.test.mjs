import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ADVENTURES} from '../dist/places.js';
import {ABYSS_SITE,ABYSS_GATE,hasAbyss,abyssProfile,abyssFloor,abyssRoof,abyssMesh,cutAbyssOpening,constrainExploration,nearAbyssGate} from '../dist/abyss-model.js';
import {undergroundMesh,interiorRoof,interiorFloor,SECRET_SITE} from '../dist/underground-model.js';
import {restoreAdventure,adventureAction} from '../dist/adventure-model.js';

test('the ancient chamber has a unique host and does not share the dwarven entrance',()=>{
 const hosts=ADVENTURES.filter(hasAbyss);assert.equal(hosts.length,1);assert.notEqual(hosts[0].id,SECRET_SITE);
 for(const site of ADVENTURES){assert.equal(nearAbyssGate(site,ABYSS_GATE.x-1,ABYSS_GATE.z),hasAbyss(site));assert.equal(nearAbyssGate(site,0,0),false);}
});
test('the additional gallery has valid geometry and opens only its host vault',()=>{
 const host=ADVENTURES.find(hasAbyss),mine=undergroundMesh(host).vault;assert.ok(cutAbyssOpening(mine,host).indices.length<mine.indices.length);assert.equal(cutAbyssOpening(mine,{id:'other'}),mine);
 for(const mesh of Object.values(abyssMesh())){assert.ok(mesh.positions.every(Number.isFinite));assert.ok(mesh.indices.every(i=>i>=0&&i<mesh.positions.length/3));assert.ok(mesh.indices.length>100000);}
});
test('an open seal provides a continuous traversable route and a closed seal blocks it',()=>{
 const host=ADVENTURES.find(hasAbyss);
 for(let x=12;x<=91;x+=.2){const z=abyssProfile(x).center,p=constrainExploration(host,x,abyssFloor(x,z)+1.9,z,false,true);assert.ok(Math.abs(p.x-x)<1e-5);assert.ok(Math.abs(p.z-z)<1e-5);}
 const blocked=constrainExploration(host,78,-48,-115,false,false);assert.ok(blocked.x<15);
 for(let x=12;x<=92;x+=.5)for(const offset of [-30,0,30]){const z=abyssProfile(x).center+offset,p=constrainExploration(host,x,100,z,false,true),floor=p.region==='abyss'?abyssFloor(p.x,p.z):interiorFloor(p.x,p.z),roof=p.region==='abyss'?abyssRoof(p.x,p.z):interiorRoof(p.x,p.z);assert.ok(p.y>=floor+1.24);assert.ok(p.y<=roof-.54);}
});
test('two distinct markings unlock the chamber; progress survives reload independently of dwarves',()=>{
 const state=restoreAdventure(null);adventureAction(state,ABYSS_SITE,'abyss-seal');assert.equal(state.abyssOpened,false);
 adventureAction(state,ABYSS_SITE,'abyss-rune',0);adventureAction(state,ABYSS_SITE,'abyss-rune',0);assert.equal(state.abyssRunes.length,1);
 adventureAction(state,SECRET_SITE,'abyss-rune',1);assert.equal(state.abyssRunes.length,1);
 adventureAction(state,ABYSS_SITE,'abyss-rune',1);adventureAction(state,ABYSS_SITE,'abyss-seal');adventureAction(state,ABYSS_SITE,'ancient');
 const loaded=restoreAdventure(JSON.parse(JSON.stringify(state)));assert.equal(loaded.abyssOpened,true);assert.equal(loaded.ancientMet,true);assert.equal(loaded.secretOpened,false);assert.equal(loaded.completed.length,0);
 assert.equal(restoreAdventure({abyssOpened:true,abyssRunes:[0,0,8],ancientMet:true}).abyssOpened,false);
});
