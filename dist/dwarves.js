import {interiorFloor,CLAN_NAME} from './underground-model.js';

export const DWARF_NAMES=['Elda','Borin','Dagna','Orun','Mira','Thrain','Runa','Dorin'];
export function dwarfPose(index,time){
 const carrier=index>=6,phase=time*.24+index;
 const x=carrier?(index===6?-6:6):[-7,7,-7,7,-7,7][index];
 const z=carrier?-202+Math.sin(phase)*9:[-190,-190,-201,-201,-216,-216][index];
 return{x,z,y:interiorFloor(x,z),heading:carrier?(Math.cos(phase)>0?0:Math.PI):(index%2?Math.PI/2:-Math.PI/2),stride:carrier?Math.sin(time*5+index)*.3:0,swing:carrier?0:Math.max(0,Math.sin(time*2.5+index))};
}

export function makeDwarves(THREE,parent,site,register){
 const actors=[],occluders=[],sphere=new THREE.SphereGeometry(1,32,24),box=new THREE.BoxGeometry(1,1,1);
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.8}),skin=mat(0xc99b7b),iron=mat(0x65727a),bronze=mat(0xb58d52),wood=mat(0x71503a);
 function mesh(root,geo,material,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);root.add(m);occluders.push(m);return m;}
 for(let i=0;i<8;i++){
  const actor=new THREE.Group();actor.userData.character=true;parent.add(actor);const cloth=mat([0x557b83,0x9c694c,0x736b88,0x61785d][i%4]),hair=mat([0xc4c5bd,0x5b4132,0xd4c3a1,0x977a61][i%4]);
  mesh(actor,sphere,cloth,0,.95,0,.42,.5,.3);mesh(actor,box,wood,0,.78,0,.84,.13,.6);mesh(actor,box,bronze,0,.78,.32,.18,.17,.07);
  const head=mesh(actor,sphere,skin,0,1.58,.04,.3,.31,.28);register(head,site,'dwarf',`Conversar com ${DWARF_NAMES[i]}`,i).userData.adventure.maxDistance=3.5;
  mesh(actor,sphere,iron,0,1.82,0,.35,.17,.32);mesh(actor,sphere,bronze,0,1.86,.28,.08,.08,.045);
  for(const side of [-1,1]){mesh(actor,sphere,iron,side*.11,1.63,.285,.035,.04,.025);mesh(actor,sphere,skin,side*.34,1.52,0,.065,.11,.07);}
  mesh(actor,sphere,skin,0,1.52,.32,.11,.09,.12);
  for(let b=0;b<7;b++){const strand=mesh(actor,new THREE.ConeGeometry(.09,.55,24,4),hair,(b-3)*.065,1.22,.27+Math.sin(b)*.018);strand.rotation.z=Math.PI;}
  const legs=[];for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.22,.62,0);actor.add(leg);mesh(leg,box,cloth,0,-.2,0,.24,.42,.26);mesh(leg,sphere,wood,0,-.51,.08,.17,.12,.24);legs.push(leg);}
  const arm=new THREE.Group();arm.position.set(.43,1.22,0);actor.add(arm);mesh(arm,new THREE.CylinderGeometry(.1,.12,.62,24),cloth,0,-.27,0);mesh(arm,sphere,skin,0,-.61,0,.11,.12,.1);
  mesh(actor,new THREE.CylinderGeometry(.1,.12,.62,24),cloth,-.43,.95,0);
  if(i<6){mesh(arm,new THREE.CylinderGeometry(.035,.045,1.1,24),wood,0,-.56,.35).rotation.x=Math.PI/2;mesh(arm,new THREE.CylinderGeometry(.035,.09,.65,24),iron,0,-.56,.86).rotation.z=Math.PI/2;}
  else mesh(actor,box,wood,0,.92,.53,.8,.5,.5);
  actors.push({actor,arm,legs});
 }
 return{occluders,update(time){for(let i=0;i<actors.length;i++){const p=dwarfPose(i,time),a=actors[i];a.actor.position.set(p.x,p.y,p.z);a.actor.rotation.y=p.heading;a.arm.rotation.x=-.2-p.swing*1.5;a.legs.forEach((leg,j)=>leg.rotation.x=p.stride*(j?1:-1));}},greet(index){return `${DWARF_NAMES[index]||'A anciã'}: Somos o ${CLAN_NAME}. Há milênios guardamos estas profundezas. A magia branca vela a senda: os goblins passam por ela e só veem pedra. Cuide da forja e escute nosso sino.`;}};
}
