import {constrainExploration,hasAbyss,abyssProfile} from './abyss-model.js';
import {constrainInteriorPoint,interiorFloor,interiorProfile,interiorEnd,undergroundZone,SECRET_Z} from './underground-model.js';
import {ADVENTURES} from './places.js';
import {REALMS,SANCTUARIES,ROUTES} from './realm-layout.js';
import {mountainHeight} from './cave-model.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {constrainTarget,terrainHeight,isTap,LAKE,WORLD,LANDMARKS} from './world.js';

export function createNavigation(THREE,camera,canvas,container,onTap,onExplore){
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.screenSpacePanning=false;controls.minDistance=3;controls.maxDistance=WORLD.maxViewDistance;controls.minDistance=3;controls.minPolarAngle=.12;controls.maxPolarAngle=Math.PI/2-.035;controls.panSpeed=1;controls.rotateSpeed=.55;
 const velocity=new THREE.Vector3();
 const keys=new Set(),pointers=new Map(),forward=new THREE.Vector3(),right=new THREE.Vector3();let returnTrip=null,room=null,secretOpen=false,abyssOpen=false,walking=false;
 const editable=target=>target.closest('input,select,button,dialog,textarea');
 function outdoorHeight(x,z){let height=terrainHeight(x,z);for(const site of ADVENTURES)if(site.kind==='cave'){const rock=mountainHeight(x-site.x,z-site.z);if(rock>0)height=Math.max(height,terrainHeight(site.x,site.z)+rock+.05);}return height;}
 function clearInput(){velocity.set(0,0,0);keys.clear();pointers.clear();}
 addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput();});
 addEventListener('keydown',event=>{if(editable(event.target)||event.ctrlKey||event.metaKey||event.altKey)return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight','KeyR','KeyF'].includes(event.code)){event.preventDefault();keys.add(event.code);returnTrip=null;onExplore();}});
 addEventListener('keyup',event=>keys.delete(event.code));
 controls.addEventListener('start',()=>{returnTrip=null;});
 container.addEventListener('pointerdown',event=>{container.focus({preventScroll:true});returnTrip=null;const start={x:event.clientX,y:event.clientY,time:performance.now(),button:event.button,multitouch:pointers.size>0,dragged:false};if(pointers.size)for(const p of pointers.values())p.multitouch=true;pointers.set(event.pointerId,start);},true);
 container.addEventListener('pointermove',event=>{const p=pointers.get(event.pointerId);if(p&&Math.hypot(event.clientX-p.x,event.clientY-p.y)>6){p.dragged=true;onExplore();}},true);
 container.addEventListener('pointerup',event=>{const start=pointers.get(event.pointerId);pointers.delete(event.pointerId);if(start&&isTap(start,{x:event.clientX,y:event.clientY,time:performance.now()}))onTap(event.clientX,event.clientY);},true);
 for(const type of ['pointercancel','lostpointercapture'])container.addEventListener(type,event=>pointers.delete(event.pointerId));
 container.addEventListener('wheel',()=>{returnTrip=null;onExplore();},{passive:true});
 function home(instant=false){room=null;controls.maxDistance=WORLD.maxViewDistance;controls.minDistance=3;clearInput();controls.enabled=true;controls.enableDamping=false;controls.update();controls.enableDamping=true;const mobile=container.clientWidth<600;const position=new THREE.Vector3(mobile?16:45,mobile?105:68,mobile?138:100),target=new THREE.Vector3(0,.8,0);if(instant||matchMedia('(prefers-reduced-motion: reduce)').matches){returnTrip=null;controls.reset();controls.target.copy(target);camera.position.copy(position);controls.update();}else{returnTrip={position,target,from:camera.position.clone(),fromTarget:controls.target.clone(),elapsed:0};} }
 function visit(site){room=null;returnTrip=null;clearInput();controls.enableDamping=false;controls.update();controls.enableDamping=true;controls.maxDistance=walking?16:WORLD.maxViewDistance;controls.minDistance=walking?4:3;const y=terrainHeight(site.x,site.z);controls.target.set(site.x,y+1.5,site.z+(site.kind==='cave'?30:0));camera.position.set(site.x+(site.kind==='cave'?0:9),y+(site.kind==='cave'?4:7),site.z+(site.kind==='cave'?44:14));controls.update();onExplore();}
 function enterCave(site){visit(site);room=site;const y=terrainHeight(site.x,site.z);controls.maxDistance=9;controls.minDistance=1;controls.target.set(site.x,y+1.8,site.z+16);camera.position.set(site.x,y+2.8,site.z+24);controls.update();}
 function exitCave(){if(room){const site=room;room=null;visit(site);}}
 function update(delta){
  if(walking&&!room){controls.update();return;}
  if(returnTrip){returnTrip.elapsed+=delta;const t=Math.min(1,returnTrip.elapsed/1.35),s=t*t*(3-2*t);camera.position.lerpVectors(returnTrip.from,returnTrip.position,s);controls.target.lerpVectors(returnTrip.fromTarget,returnTrip.target,s);camera.position.y=Math.max(camera.position.y,outdoorHeight(camera.position.x,camera.position.z)+2);camera.lookAt(controls.target);if(t===1){returnTrip=null;controls.update();}return;}
  let longitudinal=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),lateral=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);
  if(longitudinal||lateral){forward.subVectors(controls.target,camera.position);forward.y=0;forward.normalize();right.crossVectors(forward,camera.up).normalize();const scale=delta*(keys.has('ShiftLeft')||keys.has('ShiftRight')?(room?8:60):(room?4:16))/Math.hypot(longitudinal,lateral);forward.multiplyScalar(longitudinal*scale).addScaledVector(right,lateral*scale);velocity.lerp(forward,1-Math.exp(-delta*9));camera.position.add(velocity);controls.target.add(velocity);}
  if(!longitudinal&&!lateral){velocity.multiplyScalar(Math.exp(-delta*12));camera.position.add(velocity);controls.target.add(velocity);}
  const lift=(keys.has('KeyR')?1:0)-(keys.has('KeyF')?1:0);if(lift){camera.position.y+=lift*delta*8;controls.target.y+=lift*delta*8;}
  controls.update();if(room){
   const y=terrainHeight(room.x,room.z)+.05,localZ=camera.position.z-room.z;
   controls.maxDistance=localZ<-22?3:9;
   const target=constrainExploration(room,controls.target.x-room.x,1.8,controls.target.z-room.z,secretOpen,abyssOpen);
   const probe=constrainExploration(room,camera.position.x-room.x,camera.position.y-y,localZ,secretOpen,abyssOpen);
   const eye=localZ<-22?probe.floor+1.9:camera.position.y-y;
   const position=constrainExploration(room,camera.position.x-room.x,eye,localZ,secretOpen,abyssOpen);
   controls.target.set(room.x+target.x,y+target.floor+1.6,room.z+target.z);
   camera.position.set(room.x+position.x,y+position.y,room.z+position.z);camera.lookAt(controls.target);return;
  }const fixed=constrainTarget(controls.target.x,controls.target.z);const dx=fixed.x-controls.target.x,dz=fixed.z-controls.target.z,dy=Math.max(fixed.y,controls.target.y)-controls.target.y;controls.target.set(fixed.x,Math.max(fixed.y,controls.target.y),fixed.z);camera.position.x+=dx;camera.position.z+=dz;camera.position.y+=dy;camera.position.y=Math.max(camera.position.y,outdoorHeight(camera.position.x,camera.position.z)+1.8);camera.lookAt(controls.target);
 }
 function hold(code,pressed){if(pressed){keys.add(code);returnTrip=null;onExplore();}else keys.delete(code);}
 home(true);controls.saveState();
 const map=document.getElementById('map'),ctx=map.getContext('2d');let mapClock=0;
 function drawMap(delta){mapClock+=delta;if(mapClock<.12)return;mapClock=0;
  if(room){
   ctx.clearRect(0,0,136,136);const end=interiorEnd(room,secretOpen),scale=Math.min(112/(30-end),hasAbyss(room)&&abyssOpen?.62:1),mapX=x=>68+x*scale,mapZ=z=>12+(30-z)*scale;
   ctx.strokeStyle='#a9b9c0';ctx.lineWidth=2;ctx.beginPath();for(let z=29;z>=end;z-=1){const p=interiorProfile(z);if(z===29)ctx.moveTo(mapX(p.spine),mapZ(z));else ctx.lineTo(mapX(p.spine),mapZ(z));}ctx.stroke();
   for(const [z,x] of [[-65,-16],[-91,14]]){ctx.beginPath();ctx.moveTo(mapX(interiorProfile(z).spine),mapZ(z));ctx.lineTo(mapX(x),mapZ(z));ctx.stroke();}
   if(hasAbyss(room)&&abyssOpen){ctx.strokeStyle='#a995c2';ctx.beginPath();for(let x=12;x<=91;x++){const z=abyssProfile(x).center;if(x===12)ctx.moveTo(mapX(x),mapZ(z));else ctx.lineTo(mapX(x),mapZ(z));}ctx.stroke();}
   const x=camera.position.x-room.x,z=camera.position.z-room.z;ctx.fillStyle='#f9e6ad';ctx.beginPath();ctx.arc(mapX(x),mapZ(z),3,0,Math.PI*2);ctx.fill();ctx.lineWidth=1;
   const here=constrainExploration(room,x,0,z,secretOpen,abyssOpen);document.getElementById('place').textContent=here.region==='abyss'?(x>62?'Câmara da Cinza':'Galeria sem nome'):undergroundZone(z);document.getElementById('distance').textContent=`${Math.round(Math.max(0,-here.floor))} m de profundidade`;return;
  }
const size=136,scale=55/(walking?280:WORLD.travelRadius+WORLD.maxViewDistance);ctx.clearRect(0,0,size,size);ctx.fillStyle='#c6d5a70b';ctx.strokeStyle='#c6d5a72d';ctx.beginPath();ctx.arc(68,68,58,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.save();ctx.beginPath();ctx.arc(68,68,62,0,Math.PI*2);ctx.clip();if(walking)ctx.translate(-controls.target.x*scale,-controls.target.z*scale);ctx.fillStyle='#a4c7af';ctx.beginPath();ctx.ellipse(68,68,LAKE.x*scale,LAKE.z*scale,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d6c49b77';for(const route of ROUTES){ctx.beginPath();route.forEach(([x,z],i)=>{if(i)ctx.lineTo(68+x*scale,68+z*scale);else ctx.moveTo(68+x*scale,68+z*scale);});ctx.stroke();}for(const place of [...LANDMARKS,...REALMS,...SANCTUARIES]){ctx.fillStyle=place.color;ctx.beginPath();ctx.arc(68+place.x*scale,68+place.z*scale,2,0,Math.PI*2);ctx.fill();}const position=walking?controls.target:camera.position;const x=68+position.x*scale,z=68+position.z*scale;ctx.save();ctx.translate(x,z);ctx.rotate(Math.atan2(controls.target.z-camera.position.z,controls.target.x-camera.position.x));ctx.fillStyle='#f5e6b8';ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(-4,-3);ctx.lineTo(-2,0);ctx.lineTo(-4,3);ctx.closePath();ctx.fill();ctx.restore();ctx.restore();const nearby=[...REALMS,...LANDMARKS].find(place=>Math.hypot(position.x-place.x,position.z-place.z)<(place.radius||55));document.getElementById('place').textContent=nearby?nearby.name:Math.hypot(position.x,position.z)<120?'Clareira central':'Caminhos do bosque';document.getElementById('distance').textContent=`${Math.round(Math.max(0,Math.hypot(position.x,position.z)-LAKE.x))} m da clareira`;}
 function setWalking(value){walking=value;returnTrip=null;clearInput();controls.enablePan=!value;controls.minDistance=value?4:3;controls.maxDistance=value?16:WORLD.maxViewDistance;}
 function follow(point,delta){const y=terrainHeight(point.x,point.z)+1.35,dx=point.x-controls.target.x,dz=point.z-controls.target.z,dy=(y-controls.target.y)*(1-Math.exp(-delta*12));controls.target.x=point.x;controls.target.z=point.z;controls.target.y+=dy;camera.position.x+=dx;camera.position.z+=dz;camera.position.y+=dy;camera.position.y=Math.max(camera.position.y,outdoorHeight(camera.position.x,camera.position.z)+1);camera.lookAt(controls.target);}
 return {update,home,hold,drawMap,clearInput,controls,visit,enterCave,exitCave,setWalking,follow,get keys(){return keys;},setAbyssOpen(value){abyssOpen=value===true;},setSecretOpen(value){secretOpen=value===true;},get localPosition(){return room?{x:camera.position.x-room.x,z:camera.position.z-room.z}:null;},get room(){return room;}};
}
