import {REALMS,SANCTUARIES,ROUTES} from './realm-layout.js';
import {terrainHeight} from './world.js';
import {seeded} from './model.js';

export function makeRealm(THREE,scene){
  const root=new THREE.Group();root.name='Reino das Brasas';scene.add(root);
  const random=seeded(8242),obstacles=[],occluders=[],shrines=[],groups=[];
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.88,flatShading:true,...extra});
  const stone=mat(0x777f81),lightStone=mat(0xa8aca0),dark=mat(0x343e48),gold=mat(0xcab07a,{metalness:.45,roughness:.4}),moss=mat(0x6e9159),cloth=mat(0x823e41,{side:THREE.DoubleSide}),moon=mat(0x81c8ed,{emissive:0x5db6f5,emissiveIntensity:1.4}),ember=mat(0xffb95d,{emissive:0xff7b23,emissiveIntensity:2.5});
  const box=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,8),crystal=new THREE.OctahedronGeometry(1,0);
  function mesh(group,geo,material,x,y,z,sx,sy,sz){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
  function block(group,material,x,y,z,sx,sy,sz){return mesh(group,box,material,x,y,z,sx,sy,sz);}
  function obstacle(group,x,z,r){obstacles.push({x:group.position.x+x,z:group.position.z+z,radius:r});}
  function pillar(group,x,z,h=6){block(group,dark,x,.25,z,2.2,.5,2.2);for(let y=.5;y<h;y+=1.15){const m=block(group,y>h-2?lightStone:stone,x,y+.55,z,1.45,1.08,1.45);m.rotation.y=(random()-.5)*.09;}block(group,lightStone,x,h+.2,z,2,.45,2);mesh(group,cylinder,moss,x,.53,z,1.15,.06,1.15);obstacle(group,x,z,1.1);}
  function arch(group,x,z,width=9,height=9){pillar(group,x-width/2,z,height);pillar(group,x+width/2,z,height);for(let i=0;i<9;i++){const a=i/8*Math.PI,m=block(group,i%3?stone:lightStone,x+Math.cos(a)*width/2,height+Math.sin(a)*width/2,z,1.8,1.7,1.65);m.rotation.z=a-Math.PI/2;}}
  function flag(group,x,y,z){block(group,gold,x,y,z,.08,5,.08);const banner=block(group,cloth,x+.7,y+.4,z,1.4,2.5,.055);const points=banner.geometry;return {banner,points};}
  const flags=[];
  for(const place of REALMS){const group=new THREE.Group();group.position.set(place.x,terrainHeight(place.x,place.z),place.z);root.add(group);groups.push({group,range:470});
    if(place.kind==='gate'){arch(group,0,0,13,9);for(const side of [-1,1]){for(let i=0;i<4;i++)block(group,stone,side*(9+i*2.3),1.8,0,2.2,3.6-i*.65,2);flags.push(flag(group,side*6.5,11.8,1));}block(group,gold,0,15,0,1.2,1.2,.4);}
    if(place.kind==='court'){for(const x of [-16,16])for(const z of [-14,0,14])pillar(group,x,z,4+random()*4);arch(group,0,-17,9,5);for(let i=0;i<8;i++)block(group,stone,-16+i*4.6,.25,-17,4,.5,2);}
    if(place.kind==='tower'){for(let floor=0;floor<5;floor++){for(const side of [-1,1]){block(group,stone,side*7,floor*5+1.5,0,2,3,12);for(const z of [-4,4])block(group,stone,side*7,floor*5+4,z,2,2,3);if(floor>0)block(group,stone,0,floor*5+1,side*7,12,2,2);for(const x of [-4.5,4.5])block(group,lightStone,x,floor*5+3,side*7,3,4,2);}for(const x of [-7,7])for(const z of [-7,7])block(group,floor%2?lightStone:stone,x,floor*5+2.5,z,2.6,4.9,2.6);for(const z of [-7,7])block(group,stone,0,floor*5+5,z,16,1,2.6);for(const x of [-7,7])block(group,stone,x,floor*5+5,0,2.6,1,16);}for(let i=0;i<8;i++){const a=i*Math.PI/4;block(group,lightStone,Math.sin(a)*9,26,Math.cos(a)*9,2,3,2);}mesh(group,crystal,moon,0,29,0,2.2,4,2.2);for(const x of [-7,7])for(const z of [-7,7])obstacle(group,x,z,2);}
    if(place.kind==='arena'){// A broken ring with four generous entrances and a level fighting floor.
      const ring=new THREE.Mesh(new THREE.RingGeometry(22,24.5,64),dark);ring.rotation.x=-Math.PI/2;ring.position.y=.055;ring.receiveShadow=true;group.add(ring);
      for(let i=0;i<16;i++){const a=i*Math.PI/8,x=Math.sin(a)*25,z=Math.cos(a)*25;if(i%4===0)continue;pillar(group,x,z,4+random()*6);if(i%4!==3){const next=a+Math.PI/8,m=block(group,stone,(x+Math.sin(next)*25)/2,1.1,(z+Math.cos(next)*25)/2,9,2.2,1.5);m.rotation.y=a+Math.PI/16;}}
      arch(group,0,26,10,7);for(const x of [-6,6])flags.push(flag(group,x,10,26));
      const sigil=new THREE.Mesh(new THREE.RingGeometry(8,8.15,6),gold);sigil.rotation.x=-Math.PI/2;sigil.position.y=.06;group.add(sigil);
    }
    for(let i=0;i<20;i++){const a=random()*Math.PI*2,r=place.radius+random()*5;const m=block(group,i%3?stone:moss,Math.sin(a)*r,.25,Math.cos(a)*r,.7+random()*1.4,.4+random()*.7,.8+random());m.rotation.y=a;}
    // Distant low-poly silhouettes remain readable through atmospheric fog.
    group.traverse(o=>{if(o.isMesh)occluders.push(o);});
  }
  for(const s of SANCTUARIES){const group=new THREE.Group(),y=terrainHeight(s.x,s.z);group.position.set(s.x,y,s.z);root.add(group);groups.push({group,range:300});mesh(group,cylinder,dark,0,.12,0,2.1,.24,2.1);mesh(group,cylinder,lightStone,0,.3,0,1.5,.3,1.5);for(let i=0;i<7;i++){const a=i*6.28/7;block(group,stone,Math.sin(a)*.9,.6,Math.cos(a)*.9,.5,.6,.5);}const flame=mesh(group,crystal,ember,0,1.4,0,.42,1,.42);block(group,dark,.1,1.3,0,.12,2.2,.12);block(group,gold,.1,2.1,0,.85,.12,.16);const halo=new THREE.Mesh(new THREE.RingGeometry(2.8,2.86,48),gold);halo.rotation.x=-Math.PI/2;halo.position.y=.05;group.add(halo);shrines.push({group,flame,halo});}
  // Walkable, terrain-following flagstones connect encounters and safe places.
  const stones=[];
  for(const route of ROUTES)for(let i=1;i<route.length;i++){const a=route[i-1],b=route[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<length;d+=2.1){const t=d/length,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;stones.push({x,z,a:Math.atan2(b[0]-a[0],b[1]-a[1])});}}
  const path=new THREE.InstancedMesh(box,lightStone,stones.length),dummy=new THREE.Object3D();stones.forEach((p,i)=>{dummy.position.set(p.x,terrainHeight(p.x,p.z)+.035,p.z);dummy.rotation.set(0,p.a+(random()-.5)*.25,0);dummy.scale.set(1.3+random(),.06,1.25);dummy.updateMatrix();path.setMatrixAt(i,dummy.matrix);path.setColorAt(i,new THREE.Color().setHSL(.13,.11,.35+random()*.15));});path.receiveShadow=true;root.add(path);
  // Waystones carry light along the route without adding expensive point lights.
  for(let i=0;i<stones.length;i+=10){const p=stones[i],x=p.x+Math.cos(p.a)*3.1,z=p.z-Math.sin(p.a)*3.1,y=terrainHeight(x,z);block(root,dark,x,y+.65,z,.45,1.3,.45);mesh(root,crystal,ember,x,y+1.5,z,.16,.32,.16);}
  // A distant alpine skyline frames the traversable valley. No invisible walls on its routes.
  const mountainMat=mat(0x71878d),snowMat=mat(0xd7e0d9),peakGeo=new THREE.ConeGeometry(1,1,5);
  for(let i=0;i<19;i++){const a=i/19*Math.PI*2,r=740+random()*90,x=Math.sin(a)*r,z=Math.cos(a)*r,h=70+random()*95,width=65+random()*55;const mountain=mesh(root,peakGeo,mountainMat,x,h/2-12,z,width,h,width*.8);mountain.rotation.y=a;const snow=mesh(root,peakGeo,snowMat,x,h*.86-12,z,width*.28,h*.28,width*.224);snow.rotation.y=a;}
  return {obstacles,occluders,update(time,camera){for(const {group,range}of groups)group.visible=group.position.distanceTo(camera.position)<range;for(const {flame,halo}of shrines){flame.rotation.y=time;flame.scale.y=1+Math.sin(time*5)*.12;halo.material=gold;}for(const {banner}of flags)banner.rotation.y=Math.sin(time*1.8+banner.position.x)*.12;}};
}
