import {seeded} from './model.js';
import {goblinWalkable,goblinSpine,goblinRoute,GOBLIN_STOPS,interiorFloor} from './underground-model.js';

export function createGoblins(seed=712){
 const random=seeded(seed),range=(a,b)=>a+random()*(b-a);
 const names=['Bruk','Nima','Tork','Zizi','Mogo','Pip','Vrak','Luma'];let time=0,nextMeeting=2;
 const goblins=names.map((name,index)=>{
  const z=[5,7,-36,-38,-65,-67,-90,-92][index],x=goblinSpine(z)+(index%2?.5:-.5);
  return{name,index,x,z,y:interiorFloor(x,z),heading:range(-3,3),mode:'walk',partner:null,timer:0,distance:0,moving:false,stop:index,route:[]};
 });
 function release(g){if(g.partner!==null){const other=goblins[g.partner];if(other.partner===g.index){other.partner=null;other.mode='rest';other.timer=2;other.route=[];}}g.partner=null;g.route=[];}
 function greet(index){const g=goblins[index];if(!g)return;release(g);g.mode='greet';g.timer=4;}
 function clearLine(a,b){for(let i=0;i<=12;i++){const t=i/12;if(!goblinWalkable(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false;}return true;}
 function update(delta){
  const dt=Math.max(0,Math.min(.05,delta));if(!dt)return;time+=dt;nextMeeting-=dt;
  if(nextMeeting<=0){nextMeeting=range(8,12);const available=goblins.filter(g=>g.partner===null&&g.mode!=='greet');let pair=null,nearest=5;
   for(const a of available)for(const b of available)if(a.index<b.index){const d=Math.hypot(a.x-b.x,a.z-b.z);if(d<nearest&&clearLine(a,b)){nearest=d;pair=[a,b];}}
   if(pair){const [a,b]=pair;a.partner=b.index;b.partner=a.index;a.mode=b.mode='approach';a.timer=b.timer=12;}
  }
  for(const g of goblins){
   g.moving=false;g.timer-=dt;const partner=g.partner===null?null:goblins[g.partner];
   if(partner&&Math.hypot(g.x-partner.x,g.z-partner.z)<2.3&&g.mode==='approach'){g.mode=partner.mode='chat';g.timer=partner.timer=range(4,7);}
   if(g.mode==='chat'){if(partner)g.heading=Math.atan2(partner.x-g.x,partner.z-g.z);if(g.timer<=0){release(g);g.mode='walk';}continue;}
   if(['rest','admire','greet'].includes(g.mode)){if(g.timer<=0)g.mode='walk';continue;}
   if(g.mode==='approach'&&g.timer<=0){release(g);g.mode='walk';continue;}
   if(g.mode==='walk'&&!g.route.length){g.stop=(g.stop+1)%GOBLIN_STOPS.length;g.route=goblinRoute(g,GOBLIN_STOPS[g.stop]);}
   const target=partner&&g.mode==='approach'?partner:g.route[0];if(!target)continue;
   if(g.mode==='walk'&&Math.hypot(g.x-target.x,g.z-target.z)<.35){g.route.shift();if(!g.route.length){g.mode='admire';g.timer=range(3,6);}continue;}
   const desired=Math.atan2(target.x-g.x,target.z-g.z),turn=Math.atan2(Math.sin(desired-g.heading),Math.cos(desired-g.heading));g.heading+=Math.max(-dt*3.5,Math.min(dt*3.5,turn));const step=dt*(Math.abs(turn)>1?.25:1.25);
   for(const steer of [0,.4,-.4,.9,-.9,1.5,-1.5]){
    const angle=g.heading+steer,x=g.x+Math.sin(angle)*step,z=g.z+Math.cos(angle)*step;
    if(goblinWalkable(x,z)&&goblins.every(other=>other===g||Math.hypot(x-other.x,z-other.z)>.8)){
     g.x=x;g.z=z;g.y=interiorFloor(x,z);g.distance+=step;g.heading=angle;g.moving=true;break;
    }
   }
   if(!g.moving)g.heading+=dt*2;
  }
 }
 return{goblins,update,greet,get time(){return time;}};
}
