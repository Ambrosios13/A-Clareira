import {hasAbyss,cutAbyssOpening} from './abyss-model.js';
import {makeAbyss} from './abyss.js';
import {undergroundMesh,interiorProfile,interiorFloor,hasSecret,SECRET_Z,DEEP_END} from './underground-model.js';
import {makeDwarves} from './dwarves.js';

export function makeUnderground(THREE,root,site,register){
 const group=new THREE.Group();group.visible=false;root.add(group);const occluders=[],lanterns=[],embers=[];
 const mat=(color,glow=0)=>new THREE.MeshStandardMaterial({color,roughness:.9,emissive:color,emissiveIntensity:glow});
 const stone=mat(0x636573),timber=mat(0x544437),iron=mat(0x515b67),gold=mat(0xbda56c),warm=mat(0xffba71,2),box=new THREE.BoxGeometry(1,1,1);
 function mesh(parent,geo,material,x,y,z,sx=1,sy=1,sz=1,block=true){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);if(block)occluders.push(m);return m;}
 const cube=(parent,material,x,y,z,sx,sy,sz)=>mesh(parent,box,material,x,y,z,sx,sy,sz);
 const data=undergroundMesh(site);data.vault=cutAbyssOpening(data.vault,site);const rockMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.96,side:THREE.DoubleSide,emissive:0x1b2434,emissiveIntensity:.12});
 for(const surface of [data.vault,data.floor]){const geo=new THREE.BufferGeometry(),colors=[],color=new THREE.Color();for(let i=0;i<surface.positions.length;i+=3){const x=surface.positions[i],y=surface.positions[i+1],z=surface.positions[i+2],band=.5+.17*Math.sin(y*4+Math.sin(z*.8))+.12*Math.cos(x*4+z*2);color.setRGB(band*.45,band*.49,band*.58);colors.push(color.r,color.g,color.b);}geo.setAttribute('position',new THREE.Float32BufferAttribute(surface.positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.setIndex(surface.indices);geo.computeVertexNormals();mesh(group,geo,rockMaterial,0,0,0);}
 // End caps are only at the end of each network; the goblin chamber opens onto the descent.
 function cap(z){const p=interiorProfile(z),positions=[p.center,p.floor,z],indices=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI,x=p.center+Math.cos(a)*p.width;positions.push(x,interiorFloor(x,z)+Math.sin(a)*p.height,z);if(i)indices.push(0,i,i+1);}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(group,geo,new THREE.MeshStandardMaterial({color:0x555663,roughness:1,side:THREE.DoubleSide}),0,0,0);}
 cap(hasSecret(site)?DEEP_END:SECRET_Z);
 function beam(a,b,material,width=.1){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),m=new THREE.Mesh(new THREE.BoxGeometry(width,start.distanceTo(end),width),material);m.position.copy(start).lerp(end,.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());group.add(m);occluders.push(m);return m;}
 // Broken rails and timber supports follow the descent rather than floating above it.
 for(let z=-25;z>-98;z-=1.8){const p=interiorProfile(z);if(Math.round(-z)%11===0)continue;cube(group,timber,p.spine,interiorFloor(p.spine,z)+.045,z,1.7,.09,.18);for(const side of [-1,1]){const x=p.spine+side*.52,next=interiorProfile(z-1.65);beam([x,interiorFloor(x,z)+.13,z],[next.spine+side*.52,interiorFloor(next.spine+side*.52,z-1.65)+.13,z-1.65],iron,.065);}}
 for(let z=-29;z>-100;z-=9){const p=interiorProfile(z);if(p.width>4)continue;const width=p.width-.15,y=interiorFloor(p.spine,z),height=Math.min(p.height*.72,3.6);for(const side of [-1,1])cube(group,timber,p.spine+side*width,y+height/2,z,.19,height,.22);cube(group,timber,p.spine,y+height,z,width*2+.4,.2,.25);}
 function lantern(x,z){const y=interiorFloor(x,z)+2.4;cube(group,iron,x,y,z,.35,.6,.35);mesh(group,new THREE.SphereGeometry(.14,32,24),warm,x,y,z+.19,1,1,1,false);lanterns.push(new THREE.Vector3(x,y,z));}
 for(let z=-30;z>data.end+8;z-=16){const p=interiorProfile(z);lantern(p.spine+.9,z);}
 function cart(x,z){const y=interiorFloor(x,z),cart=new THREE.Group();cart.position.set(x,y,z);cart.rotation.z=.12;group.add(cart);cube(cart,timber,0,.6,0,1.3,.16,1.9);for(const side of [-1,1]){cube(cart,timber,side*.66,.9,0,.1,.7,2);for(const end of [-1,1]){const wheel=mesh(cart,new THREE.TorusGeometry(.26,.065,12,64),iron,side*.77,.3,end*.65);wheel.rotation.y=Math.PI/2;}}cube(cart,timber,0,.9,-.96,1.4,.7,.12);}
 cart(-10,-63.5);cart(10,-89.5);
 for(const [x,z] of [[-16,-65],[14,-91],[3,-46],[-6,-77]]){const y=interiorFloor(x,z);for(let i=0;i<5;i++){const crystal=mesh(group,new THREE.OctahedronGeometry(.22,1),mat(i%2?0x7b9ab4:0xc5a563,.35),x+Math.sin(i)*.3,y+.3+i*.06,z+Math.cos(i)*.3,.6,1.6,.6);embers.push(crystal);}}
 const journal=cube(group,timber,-13,interiorFloor(-13,-65)+.65,-64,1.1,.13,.7);register(journal,site,'mine-journal','Ler o caderno abandonado').userData.adventure.maxDistance=3.5;
 let gate=null,ward=null,dwarves=null,forge=null,bell=null,clock=0;
 if(hasSecret(site)){
  const p=interiorProfile(SECRET_Z);gate=cube(group,stone,p.spine,p.floor+2,SECRET_Z,3.8,4.3,.4);register(gate,site,'secret','Examinar a pedra sem eco').userData.adventure.maxDistance=3.2;
  ward=new THREE.Group();ward.position.set(p.spine,p.floor+1.8,SECRET_Z+.25);group.add(ward);
  const white=new THREE.MeshBasicMaterial({color:0xf3ffff,transparent:true,opacity:.08,depthWrite:false});
  for(let i=0;i<3;i++){const ring=mesh(ward,new THREE.TorusGeometry(.55+i*.28,.012,12,96),white,0,0,i*.012,1,1,1,false);ring.rotation.z=i*.35;}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const rune=mesh(ward,new THREE.TorusGeometry(.09,.014,12,64),white,Math.sin(a)*1.05,Math.cos(a)*1.05,.03,1,1,1,false);rune.rotation.z=-a;}
  // A settled dwarven hall: stone homes, buttresses, ore stores and a working forge.
  for(const z of [-188,-202,-218])for(const side of [-1,1]){
   const x=side*11,y=interiorFloor(x,z);cube(group,stone,x,y+1.5,z,4,3,5);cube(group,gold,x,y+3.05,z,4.3,.18,5.3);cube(group,iron,x-side*2.02,y+1.05,z,.12,2,1.3);
   for(const offset of [-1.7,1.7])cube(group,stone,x-side*2.2,y+2.1,z+offset,.6,4.2,.6);
   lantern(side*8,z);
  }
  const y=interiorFloor(-8,-202);cube(group,stone,-9,y+.55,-202,2.8,1.1,2.2);forge=mesh(group,new THREE.ConeGeometry(.65,1.5,24,8),warm,-9,y+1.6,-202);register(forge,site,'forge','Alimentar a forja ancestral').userData.adventure.maxDistance=4;
  for(const x of [-8,8]){cube(group,iron,x,interiorFloor(x,-214)+.85,-214,1.6,.5,.8);cube(group,iron,x,interiorFloor(x,-214)+.4,-214,.55,.8,.5);}
  const by=interiorFloor(0,-224);for(const x of [-1.7,1.7])cube(group,stone,x,by+2,-224,.5,4,.5);cube(group,gold,0,by+4,-224,4,.25,.4);bell=mesh(group,new THREE.CylinderGeometry(.5,.9,1.15,32,6,true),gold,0,by+3,-224);register(bell,site,'clan-bell','Escutar o sino milenar').userData.adventure.maxDistance=4;
  dwarves=makeDwarves(THREE,group,site,register);occluders.push(...dwarves.occluders);
 }
 const abyss=hasAbyss(site)?makeAbyss(THREE,group,site,register):null;if(abyss)occluders.push(...abyss.occluders);
 const lights=Array.from({length:3},()=>{const light=new THREE.PointLight(0xffcc99,30,28,1.5);group.add(light);return light;});
 return{occluders,dwarves,update(dt,camera,room,state){
  clock+=dt;group.visible=room?.id===site.id||(!room&&camera.position.distanceTo(root.position)<140);if(!group.visible)return;
  const local=camera.position.clone().sub(root.position),nearest=[...lanterns].sort((a,b)=>a.distanceToSquared(local)-b.distanceToSquared(local));lights.forEach((light,i)=>{if(nearest[i])light.position.copy(nearest[i]);});
  if(gate){gate.visible=!state.secretOpened;const distance=local.distanceTo(ward.position);ward.visible=distance<20;for(const child of ward.children)child.material.opacity=state.secretOpened?.45:Math.max(.025,(5-distance)*.12);ward.rotation.z=Math.sin(clock*.2)*.04;}
  if(forge)forge.scale.y=(state.forgeLit?1.5:1)+Math.sin(clock*5)*.1;
  if(bell)bell.rotation.z=state.bellRung?Math.sin(clock*3)*.06:0;
  abyss?.update(clock,camera,state);dwarves?.update(clock);embers.forEach((ember,i)=>ember.material.emissiveIntensity=.3+Math.sin(clock+i)*.08);
 }};
}
