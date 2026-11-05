import {seeded} from './model.js';
import {LAKE,WORLD,lakeRadius,terrainHeight,insideFarm} from './world.js';

export const DEER_COUNT=30;
export function createWildlife(obstacles=[],seed=72816){
 const random=seeded(seed),range=(a,b)=>a+random()*(b-a),cells=new Map(),cellSize=5;
 for(const tree of obstacles){const key=`${Math.floor(tree.x/cellSize)},${Math.floor(tree.z/cellSize)}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(tree);}
 function walkable(x,z){if(insideFarm(x,z,25)||lakeRadius(x,z)<1.13||Math.hypot(x,z)>WORLD.travelRadius-8)return false;const cx=Math.floor(x/cellSize),cz=Math.floor(z/cellSize);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const tree of cells.get(`${cx+dx},${cz+dz}`)||[]){if(Math.hypot(x-tree.x,z-tree.z)<1.35+(tree.radius||.4))return false;}const y=terrainHeight(x,z);return Math.max(Math.abs(terrainHeight(x+.8,z)-y),Math.abs(terrainHeight(x,z+.8)-y))<.65;}
 const animals=[];
 for(let i=0;i<DEER_COUNT;i++){let x,z,found=false;for(let attempt=0;attempt<500;attempt++){const angle=i<4?Math.PI*.5+(i-1.5)*.13:range(0,Math.PI*2),radius=i<4?range(1.25,1.4):i<12?range(2,3.5):range(4,10);x=Math.cos(angle)*LAKE.x*radius;z=Math.sin(angle)*LAKE.z*radius;if(walkable(x,z)&&animals.every(a=>Math.hypot(a.x-x,a.z-z)>2.3)){found=true;break;}}if(!found)continue;animals.push({x,z,y:terrainHeight(x,z),heading:range(-Math.PI,Math.PI),speed:range(.65,1),distance:0,mode:'walk',timer:range(9,20),target:null,phase:range(0,6.28),scale:range(.88,1.13),antlers:i%3===0});}
 function chooseTarget(animal){const angle=Math.atan2(animal.z/LAKE.z,animal.x/LAKE.x),radius=lakeRadius(animal.x,animal.z);for(let attempt=0;attempt<50;attempt++){const a=angle+range(-.6,.6),r=Math.max(1.2,Math.min(WORLD.travelRadius/LAKE.x-1,radius+range(-.15,.15))),x=Math.cos(a)*LAKE.x*r,z=Math.sin(a)*LAKE.z*r;if(walkable(x,z))return{x,z};}return{x:animal.x,z:animal.z};}
 function update(delta){const dt=Math.max(0,Math.min(.05,delta));if(dt===0)return;
  for(const animal of animals){animal.timer-=dt;animal.moving=false;if(animal.timer<=0){animal.mode=animal.mode==='walk'?'graze':'walk';animal.timer=animal.mode==='walk'?range(10,23):range(3,8);animal.target=null;}if(animal.mode==='graze')continue;
   if(!animal.target||Math.hypot(animal.x-animal.target.x,animal.z-animal.target.z)<.7)animal.target=chooseTarget(animal);
   const desired=Math.atan2(animal.target.x-animal.x,animal.target.z-animal.z),difference=Math.atan2(Math.sin(desired-animal.heading),Math.cos(desired-animal.heading));animal.heading+=Math.max(-dt*1.4,Math.min(dt*1.4,difference));
   const speed=animal.speed*(Math.abs(difference)>1.2?.25:1),step=speed*dt;
   for(const turn of [0,.5,-.5,1,-1]){const heading=animal.heading+turn,x=animal.x+Math.sin(heading)*step,z=animal.z+Math.cos(heading)*step;
    if(walkable(x,z)&&animals.every(other=>other===animal||Math.hypot(other.x-x,other.z-z)>1.8)){animal.x=x;animal.z=z;animal.heading=heading;animal.y=terrainHeight(x,z);animal.distance+=step;animal.moving=true;break;}
   }
   if(!animal.moving){animal.target=null;animal.heading+=dt;}
  }
 }
 return{animals,update,walkable};
}
