import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ADVENTURES} from '../dist/places.js';
import {shellData} from '../dist/cave-model.js';
import {SECRET_SITE,SECRET_Z,DEEP_END,hasSecret,interiorEnd,interiorProfile,interiorFloor,interiorRoof,constrainInteriorPoint,canOpenSecret,undergroundMesh,goblinWalkable,GOBLIN_STOPS} from '../dist/underground-model.js';
import {createGoblins} from '../dist/goblin-model.js';
import {restoreAdventure,adventureAction} from '../dist/adventure-model.js';
import {dwarfPose,DWARF_NAMES} from '../dist/dwarves.js';

test('only one of four caves reaches the clan, with no surface travel destination',()=>{
 const caves=ADVENTURES.filter(s=>s.kind==='cave');assert.equal(caves.length,4);assert.equal(caves.filter(hasSecret).length,1);
 for(const site of caves){assert.equal(interiorEnd(site,false),SECRET_Z+1.5);assert.equal(interiorEnd(site,true),hasSecret(site)?DEEP_END+1:SECRET_Z+1.5);const p=interiorProfile(SECRET_Z);assert.equal(canOpenSecret(site,p.spine,SECRET_Z+2),hasSecret(site));assert.equal(canOpenSecret(site,0,-20),false);}
 assert.equal(ADVENTURES.length,6);assert.ok(ADVENTURES.every(s=>s.kind==='cave'||s.kind==='village'));
});
test('underground meshes join the existing arch and remain finite through the side galleries',()=>{
 const surface=shellData();for(const site of [ADVENTURES[0],ADVENTURES[1]]){const network=undergroundMesh(site);assert.equal(network.end,hasSecret(site)?DEEP_END:SECRET_Z);
  for(const mesh of [network.vault,network.floor]){assert.ok(mesh.positions.every(Number.isFinite));assert.ok(mesh.indices.every(i=>i>=0&&i<mesh.positions.length/3));assert.ok(mesh.indices.length>80000);}
  for(let col=0;col<=64;col++)for(let axis=0;axis<3;axis++)assert.ok(Math.abs(network.vault.positions[col*3+axis]-surface.positions[col*6+axis])<1e-6);
 }
 assert.ok(interiorProfile(-65).width>16);assert.ok(interiorProfile(-91).width>12);assert.equal(interiorProfile(-205).floor,-65);
});
test('camera fits inside the vault and cannot cross the ward until the discovery',()=>{
 for(const site of ADVENTURES.filter(s=>s.kind==='cave'))for(const opened of [false,true])for(let z=-245;z<32;z+=.75)for(const x of [-40,0,40]){
  const p=constrainInteriorPoint(site,x,30,z,opened);assert.ok(p.z>=interiorEnd(site,opened)&&p.z<=29);assert.ok(p.y>=interiorFloor(p.x,p.z)+1.24);assert.ok(p.y<=interiorRoof(p.x,p.z)-.54);
 }
});
test('all public galleries receive goblins, who never perceive or cross the white ward',()=>{
 for(const seed of [712,6770,12400]){const world=createGoblins(seed),seen=new Set();let admiring=false;
  for(let tick=0;tick<18000;tick++){world.update(.05);for(const g of world.goblins){assert.ok(goblinWalkable(g.x,g.z));assert.ok(g.z>SECRET_Z+3);if(g.mode==='admire')admiring=true;for(const [i,p] of GOBLIN_STOPS.entries())if(Math.hypot(g.x-p.x,g.z-p.z)<2)seen.add(i);}}
  assert.equal(seen.size,GOBLIN_STOPS.length);assert.ok(admiring);
 }
 assert.equal(goblinWalkable(interiorProfile(SECRET_Z-1).spine,SECRET_Z-1),false);
});
test('old progress migrates safely and the secret persists separately from the six surface rituals',()=>{
 const state=restoreAdventure({visited:['moss-cave'],completed:['moss-cave']});assert.equal(state.secretOpened,false);assert.equal(state.clanMet,false);
 adventureAction(state,'violet-cave','secret');assert.equal(state.secretOpened,false);
 adventureAction(state,SECRET_SITE,'dwarf');assert.equal(state.clanMet,false);
 adventureAction(state,SECRET_SITE,'secret');adventureAction(state,SECRET_SITE,'dwarf');adventureAction(state,SECRET_SITE,'forge');adventureAction(state,SECRET_SITE,'clan-bell');
 const loaded=restoreAdventure(JSON.parse(JSON.stringify(state)));assert.equal(loaded.secretOpened,true);assert.equal(loaded.clanMet,true);assert.equal(loaded.forgeLit,true);assert.equal(loaded.bellRung,true);assert.deepEqual(loaded.completed,['moss-cave']);
 assert.equal(restoreAdventure({secretOpened:'true',clanMet:true}).clanMet,false);
});
test('dwarven workers stay in their deep hall and animation poses are deterministic',()=>{
 assert.equal(DWARF_NAMES.length,8);for(let time=0;time<120;time+=.25)for(let i=0;i<8;i++){const p=dwarfPose(i,time);assert.ok(p.z<-176);assert.equal(p.y,interiorFloor(p.x,p.z));assert.ok(interiorRoof(p.x,p.z)>p.y+2.1);assert.deepEqual(dwarfPose(i,time),p);}
 assert.notDeepEqual(dwarfPose(6,0),dwarfPose(6,10));
});
