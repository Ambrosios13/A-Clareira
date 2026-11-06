import {ABYSS_GATE,abyssMesh,abyssFloor,abyssProfile,ABYSS_NAME} from './abyss-model.js';
import {interiorFloor} from './underground-model.js';

export function makeAbyss(THREE,parent,site,register){
 const group=new THREE.Group();parent.add(group);const occluders=[],runes=[],ribLights=[];
 const mat=(color,glow=0)=>new THREE.MeshStandardMaterial({color,roughness:.83,emissive:color,emissiveIntensity:glow,side:THREE.DoubleSide});
 const stone=mat(0x282932),bone=mat(0x8c8475),ash=mat(0x181821),ember=mat(0xeb6c30,1.7),cold=mat(0xa8bbe4,.28);
 function mesh(root,geo,material,x,y,z,sx=1,sy=1,sz=1,block=true){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);root.add(m);if(block)occluders.push(m);return m;}
 function curve(root,points,radius,material){return mesh(root,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),48,radius,10,false),material,0,0,0);}
 for(const data of Object.values(abyssMesh())){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));geo.setIndex(data.indices);geo.computeVertexNormals();mesh(group,geo,stone,0,0,0);}
 const end=abyssProfile(92);mesh(group,new THREE.BoxGeometry(.4,end.height*2,end.width*2),stone,92,end.floor+end.height/2,end.center);
 const gate=mesh(group,new THREE.BoxGeometry(.4,4.6,3.2),stone,ABYSS_GATE.x,abyssFloor(14.5,-91)+2,-91);register(gate,site,'abyss-seal','Examinar a fissura fria').userData.adventure.maxDistance=2.8;
 for(const [i,x,z] of [[0,-15,-65],[1,-5.3,-78]]){const rune=mesh(parent,new THREE.TorusGeometry(.23,.025,12,3+i),cold.clone(),x,interiorFloor(x,z)+1.1,z);register(rune,site,'abyss-rune','Ler a marca desgastada',i).userData.adventure.maxDistance=2.5;runes.push(rune);}
 // A processional gallery, then a single vaulted chamber with a sealed central circle.
 for(let x=20;x<67;x+=7){const p=abyssProfile(x);for(const side of [-1,1])mesh(group,new THREE.CylinderGeometry(.2,.32,3,24),bone,x,p.floor+1.5,p.center+side*(p.width-.35));}
 for(let i=0;i<9;i++){const a=i*Math.PI*2/9,x=78+Math.cos(a)*7,z=-115+Math.sin(a)*6;mesh(group,new THREE.CylinderGeometry(.45,.7,6.2,24,6),stone,x,abyssFloor(x,z)+3.1,z);mesh(group,new THREE.TorusGeometry(.55,.07,12,64),cold,x,abyssFloor(x,z)+4.8,z).rotation.x=Math.PI/2;}
 const base=abyssFloor(78,-115),circle=mesh(group,new THREE.TorusGeometry(4.6,.035,12,160),cold.clone(),78,base+.08,-115);circle.rotation.x=-Math.PI/2;
 const altar=mesh(group,new THREE.CylinderGeometry(.8,1.1,1.2,24),stone,70,abyssFloor(70,-115)+.6,-115);register(altar,site,'ancient','Escutar o nome esquecido').userData.adventure.maxDistance=3.5;
 // Original ancient being: obsidian limbs, exposed ember ribs, antlers and torn stone wings.
 const creature=new THREE.Group();creature.userData.character=true;creature.position.set(78,base,-115);creature.rotation.y=-Math.PI/2;group.add(creature);
 const torso=new THREE.Group();creature.add(torso);const sphere=new THREE.SphereGeometry(1,32,24);
 mesh(torso,sphere,ash,0,3.6,0,1.1,1.7,.65);mesh(torso,sphere,ember,0,4,.52,.28,.55,.18);
 for(const side of [-1,1])for(let i=0;i<5;i++)curve(torso,[[side*.08,4.8-i*.33,.65],[side*.65,4.65-i*.33,.8],[side*.98,4.4-i*.3,.2]],.065,bone);
 const skull=mesh(torso,sphere,bone,0,5.9,.1,.52,.7,.4);register(skull,site,'ancient',`Contemplar ${ABYSS_NAME}`).userData.adventure.maxDistance=9;
 for(const side of [-1,1]){
  mesh(torso,sphere,ember,side*.22,6.02,.47,.13,.06,.065);curve(torso,[[side*.32,6.3,0],[side*.95,6.9,-.15],[side*1.35,7.5,-.1],[side*.9,7.9,.1]],.11,ash);
  curve(torso,[[side*.9,4.65,0],[side*1.65,3.8,0],[side*1.85,2.4,.4]],.18,ash);
  for(let f=0;f<4;f++)curve(torso,[[side*1.85,2.5,.4+f*.09],[side*(1.9+f*.09),1.9,.6+f*.1],[side*(1.7+f*.13),1.65,.75+f*.1]],.038,bone);
  curve(creature,[[side*.55,2.7,0],[side*.78,1.3,-.15],[side*.95,.3,.4]],.25,ash);mesh(creature,sphere,ash,side*.95,.16,.55,.4,.17,.65);
  const wing=new THREE.BufferGeometry(),vertices=[side*.8,4.7,-.3,side*2.4,6,-.7,side*4.4,5.4,-1,side*3.4,3.8,-.8,side*2.8,4.2,-.5,side*2.2,2.6,-.6,side*1.4,3.3,-.3];wing.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));wing.setIndex([0,1,4,1,2,4,2,3,4,0,4,6,4,5,6]);wing.computeVertexNormals();mesh(torso,wing,ash,0,0,0);curve(torso,[[side*.8,4.7,-.3],[side*2.4,6,-.7],[side*4.4,5.4,-1]],.065,bone);
 }
 for(let i=0;i<36;i++){const a=i*2.4,r=1+(i%7)*.45;const spark=mesh(group,new THREE.SphereGeometry(.025+(i%3)*.012,8,6),ember,78+Math.cos(a)*r,base+.4+i*.13,-115+Math.sin(a)*r,1,1,1,false);ribLights.push({spark,a,r});}
 const light=new THREE.PointLight(0xed7646,65,24,1.6);light.position.set(78,base+4,-115);group.add(light);
 const passageLight=new THREE.PointLight(0x8d9fc8,16,22,1.5);group.add(passageLight);
 return{occluders,update(time,camera,state){
  gate.visible=!state.abyssOpened;runes.forEach((r,i)=>r.material.emissiveIntensity=state.abyssRunes.includes(i)?.65:.15);
  const local=camera.position.clone().sub(parent.parent.position),near=local.x>12&&local.z<-85;
  light.visible=state.abyssOpened&&near;passageLight.visible=state.abyssOpened&&near;
  const x=Math.max(18,Math.min(68,local.x)),p=abyssProfile(x);passageLight.position.set(x,p.floor+2.8,p.center);
  torso.position.y=Math.sin(time*.6)*.045;torso.rotation.z=Math.sin(time*.3)*.012;
  light.intensity=(state.ancientMet?85:55)+Math.sin(time*.8)*6;circle.material.emissiveIntensity=state.ancientMet?.8:.2;
  ribLights.forEach(({spark,a,r},i)=>{spark.position.x=78+Math.cos(a+time*.08)*r;spark.position.y=base+.5+(i*.15+time*.08)%5;});
 }};
}
