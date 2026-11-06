import {nearAbyssGate} from './abyss-model.js';
import {makeUnderground} from './underground.js';
import {canOpenSecret} from './underground-model.js';
import {makeCave} from './caves.js';
import {makeGoblins} from './goblins.js';
import {caveFloor} from './cave-model.js';
import {ADVENTURES} from './places.js';
import {terrainHeight} from './world.js';
import {restoreAdventure,adventureAction} from './adventure-model.js';

export function makeAdventures(THREE,scene,notify){
 let saved;try{saved=JSON.parse(localStorage.getItem('clareira-adventures-v1'));}catch{}const state=restoreAdventure(saved);
 const targets=[],occluders=[],actors=[],sites=[],boxGeo=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,32,24),rock=new THREE.DodecahedronGeometry(1,0);
 const mat=(color,glow=0)=>new THREE.MeshStandardMaterial({color,roughness:.85,emissive:color,emissiveIntensity:glow});const stone=mat(0x656975),wood=mat(0x795438),dark=mat(0x33313e);
 function mesh(parent,geo,material,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);occluders.push(m);return m;}
 function box(parent,material,x,y,z,sx,sy,sz){return mesh(parent,boxGeo,material,x,y,z,sx,sy,sz);}
 function target(object,site,action,label,index=0){object.userData.adventure={site:site.id,action,label,index};targets.push(object);return object;}
 function character(root,site,x,z,goblin){const g=new THREE.Group();g.userData.character=true;g.position.set(x,0,z);root.add(g);const skin=mat(goblin?0x7eb55a:0xc69b76),cloth=mat(goblin?0x775b42:0x6764a2);mesh(g,sphere,cloth,0,1,0,.42,.62,.3);const head=mesh(g,sphere,skin,0,1.85,0,.35,.35,.3);for(const side of [-1,1]){mesh(g,sphere,skin,side*.42,1.87,0,.25,.1,.11);mesh(g,sphere,dark,side*.13,1.92,.27,.04,.055,.035);box(g,dark,side*.2,.25,0,.17,.5,.18);}mesh(g,sphere,skin,0,1.83,.3,.12,.1,.16);const arm=mesh(g,new THREE.CylinderGeometry(.07,.1,.7,24),skin,.48,1.1,0);arm.rotation.z=.3;target(head,site,'greet',goblin?'Conversar com o guardião goblin':'Conversar com a guardiã');actors.push({g,arm,phase:x+z});return g;}
 for(const site of ADVENTURES){const root=new THREE.Group();root.position.set(site.x,terrainHeight(site.x,site.z)+.05,site.z);scene.add(root);const data={site,root,rings:[],signs:[],crystals:[],pulse:0,rotation:0};sites.push(data);
  if(site.kind==='cave'){
   data.cave=makeCave(THREE,root,site);occluders.push(...data.cave.occluders);data.underground=makeUnderground(THREE,root,site,target);occluders.push(...data.underground.occluders);
   const portal=mesh(root,new THREE.TorusGeometry(3.5,.09,12,80,Math.PI),mat(0x92c99e,.7),0,.4,30.8);target(portal,site,'enter','Entrar na caverna');
   for(let i=0;i<3;i++){const crystal=mesh(root,new THREE.OctahedronGeometry(1,0),mat([0x70d690,0x71bfff,0xbd80f5][i],.5),(i-1)*4,1.5,-4,.65,1.5,.65);target(crystal,site,'crystal',['Sintonizar cristal verde','Sintonizar cristal azul','Sintonizar cristal violeta'][i],i);data.crystals.push(crystal);const lamp=new THREE.PointLight([0x70d690,0x71bfff,0xbd80f5][i],22,18,1.7);lamp.position.copy(crystal.position);root.add(lamp);}
   data.goblins=makeGoblins(THREE,root,site,target);occluders.push(...data.goblins.occluders);box(root,wood,0,.5,-8,2.1,1,1.2);const lid=new THREE.Group();lid.position.set(0,1,-8.6);root.add(lid);box(lid,wood,0,.1,.6,2.2,.2,1.3);data.lid=lid;data.reward=mesh(root,new THREE.IcosahedronGeometry(.4,1),mat(0xead6a0,1.3),0,1.6,-8);
   const exit=mesh(root,new THREE.TorusGeometry(.5,.09,12,64),mat(0xf7d18c,.7),0,1.8,26);target(exit,site,'exit','Sair da caverna');
  }else{
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.cos(a)*12,z=Math.sin(a)*12;mesh(root,new THREE.CylinderGeometry(2,2.4,2.7,24),mat(i%2?0xb79b70:0x9aaf98),x,1.35,z);mesh(root,new THREE.ConeGeometry(3,2.8,24),mat(i%2?0x6b7b82:0xa46f63),x,4,z);box(root,wood,x,1,z+2.3,.85,2,.1);}
   const flame=mesh(root,new THREE.OctahedronGeometry(1,0),mat(0xffb85d,1.6),0,1,0,.5,1,.5);target(flame,site,'fire','Despertar a fogueira');data.flame=flame;const fireLight=new THREE.PointLight(0xffbc77,20,16,2);fireLight.position.set(0,2,0);root.add(fireLight);data.light=fireLight;
   for(let i=0;i<10;i++){const a=i*6.28/10;mesh(root,rock,stone,Math.cos(a)*1.2,.15,Math.sin(a)*1.2,.3,.25,.3);}
   const drum=mesh(root,new THREE.CylinderGeometry(.7,.6,.9,24),mat(0xc5a078),-4,.6,3);target(drum,site,'drum','Tocar o tambor de luz');
   const totem=mesh(root,new THREE.CylinderGeometry(.4,.65,4,24),wood,4,2,2);target(totem,site,'totem','Girar o totem geométrico');data.totem=totem;for(let i=0;i<3;i++){const sign=mesh(root,new THREE.TorusGeometry(.65,.08,12,3+i*3),mat([0x79d9d2,0xedbc75,0xbe92ee][i],.5),4,1+i,2.5);target(sign,site,'totem','Girar o totem geométrico');data.signs.push(sign);}
   character(root,site,-3,-3,false);character(root,site,5,-5,false);
  }
  data.surfaceLights=root.children.filter(object=>object.isLight);
  for(let i=0;i<4;i++){const ring=mesh(root,new THREE.TorusGeometry(1,.025,12,64),new THREE.MeshBasicMaterial({color:site.color,transparent:true,opacity:0,depthWrite:false}),0,site.kind==='cave'?caveFloor(0,0)+.04:.1,0);ring.rotation.x=-Math.PI/2;data.rings.push(ring);}
 }
 function save(){try{localStorage.setItem('clareira-adventures-v1',JSON.stringify(state));}catch{}}
 function visible(object){for(let node=object;node;node=node.parent)if(!node.visible)return false;return true;}
 function act(info,navigation){
  const data=sites.find(d=>d.site.id===info.site);if(!data)return;
  const position=navigation.localPosition;
  if(info.action==='secret'&&(!position||navigation.room?.id!==info.site||!canOpenSecret(data.site,position.x,position.z)))return;
  if(info.action==='abyss-seal'&&(!position||navigation.room?.id!==info.site||!nearAbyssGate(data.site,position.x,position.z)))return;
  if(info.action==='enter'){navigation.enterCave(data.site);if(!state.visited.includes(info.site))state.visited.push(info.site);notify('Explore o salão, os túneis e as minas. Esc retorna à entrada; H volta ao lago.');}
  else if(info.action==='exit')navigation.exitCave();
  else{
   const result=adventureAction(state,info.site,info.action,info.index);
   if(result.pulse)data.pulse=1;if(info.action==='totem')data.rotation+=Math.PI/3;
   if(info.action==='secret')navigation.setSecretOpen(state.secretOpened);if(info.action==='abyss-seal')navigation.setAbyssOpen(state.abyssOpened);
   const name=info.action==='greet'&&data.goblins?data.goblins.greet(info.index):null;
   notify(info.action==='dwarf'&&state.secretOpened?data.underground.dwarves.greet(info.index):name?`${name}: ${result.message}`:result.message);
  }
  save();
 }
 function interactionOwner(object){for(let node=object;node;node=node.parent)if(node.userData.character)return node;return object;}
 function blocks(object,target){return visible(object)&&interactionOwner(object)!==interactionOwner(target);}
 const sight=new THREE.Raycaster(),origin=new THREE.Vector3(),direction=new THREE.Vector3();
 function nearby(camera,room){
  const candidates=[];for(const object of targets){const info=object.userData.adventure;if(!visible(object)||room&&info.site!==room.id)continue;
   if(!room&&ADVENTURES.find(s=>s.id===info.site).kind==='cave'&&info.action!=='enter')continue;
   object.getWorldPosition(origin);const d=origin.distanceTo(camera.position);if(d<(info.maxDistance||(room?8:24)))candidates.push({object,info,d,point:origin.clone()});
  }
  candidates.sort((a,b)=>a.d-b.d);
  for(const candidate of candidates){direction.subVectors(candidate.point,camera.position).normalize();sight.set(camera.position,direction);sight.far=candidate.d-.12;
   if(!sight.intersectObjects(occluders.filter(o=>blocks(o,candidate.object)),false).length)return candidate.info;
  }
  return null;
 }
 function update(dt,time,camera,room){for(const data of sites){if(camera)for(const light of data.surfaceLights)light.visible=camera.position.distanceTo(data.root.position)<140;data.cave?.update(camera,time);data.goblins?.update(dt,camera,room);if(camera)data.underground?.update(dt,camera,room,state);data.pulse=Math.max(0,data.pulse-dt*.22);for(let i=0;i<data.rings.length;i++){const progress=(1-data.pulse+i*.16)%1,ring=data.rings[i];ring.scale.setScalar(1+progress*8);ring.material.opacity=data.pulse>0?(1-progress)*data.pulse*.65:0;}if(data.lid){data.lid.rotation.x=state.completed.includes(data.site.id)?-1.1:0;data.reward.visible=state.completed.includes(data.site.id);data.reward.rotation.y=time*.7;}for(const sign of data.signs)sign.rotation.z=data.rotation;data.crystals.forEach((crystal,i)=>{crystal.rotation.y=time*.2;crystal.material.emissiveIntensity=(state.crystals[data.site.id]||[]).includes(i)||state.completed.includes(data.site.id)?1.3:.45;});if(data.flame){const active=(state.rituals[data.site.id]||[]).includes('fire');data.flame.scale.y=(active?1.5:1)+Math.sin(time*5)*.12;data.light.intensity=active?38:17;}if(data.totem)data.totem.rotation.y=data.rotation;}for(const a of actors){a.g.position.y=Math.sin(time*1.1+a.phase)*.035;a.arm.rotation.z=.3+Math.sin(time*.8+a.phase)*.12;}}
 update(0,0);return{targets,occluders,state,act,nearby,update,blocks};
}
