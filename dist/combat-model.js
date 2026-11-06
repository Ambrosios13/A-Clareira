import {SANCTUARIES, ENCOUNTERS} from './realm-layout.js';
export const SAVE_KEY='clareira-embers-v1';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const finite=(n,fallback,min,max)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
export const levelCost=level=>80+level*45;
const stats={hollow:{hp:65,damage:18,speed:2.7,range:2.7,reward:35,windup:.85},knight:{hp:115,damage:26,speed:2.25,range:3.3,reward:65,windup:1.05},warden:{hp:480,damage:32,speed:2.8,range:5.1,reward:400,windup:1.25}};
export function createCombat(saved={}){
  if(!saved||typeof saved!=='object')saved={};
  const checkpoint=SANCTUARIES.find(s=>s.id===saved.checkpoint)||SANCTUARIES[0];
  const level=Math.floor(finite(saved.level,0,0,30)),maxHp=100+level*12;
  const drop=saved.drop&&Number.isFinite(saved.drop.x)&&Number.isFinite(saved.drop.z)&&Math.hypot(saved.drop.x,saved.drop.z)<470?{x:saved.drop.x,z:saved.drop.z,souls:Math.floor(finite(saved.drop.souls,0,0,1e7))}:null;
  return {player:{x:checkpoint.x,z:checkpoint.z+3,angle:0,hp:maxHp,maxHp,stamina:100,maxStamina:100,souls:Math.floor(finite(saved.souls,0,0,1e7)),level,flasks:3,action:'idle',timer:0,regenDelay:0,invulnerable:0,hurt:0,attackHit:false,rollX:0,rollZ:1},checkpoint:checkpoint.id,drop,bossDefeated:saved.bossDefeated===true,enemies:ENCOUNTERS.map(e=>({...e,...stats[e.kind],maxHp:stats[e.kind].hp,homeX:e.x,homeZ:e.z,angle:0,mode:'idle',timer:0,hurt:0,dead:e.kind==='warden'&&saved.bossDefeated===true})),events:[],elapsed:0};
}
export function combatSave(state){const p=state.player;return {version:1,checkpoint:state.checkpoint,level:p.level,souls:p.souls,bossDefeated:state.bossDefeated,drop:state.drop};}
export function requestAction(state,action,direction){
  const p=state.player;if(p.hp<=0||p.action!=='idle')return false;
  const cost=action==='attack'?23:action==='heavy'?38:action==='roll'?28:0;
  if(p.stamina<cost||!['attack','heavy','roll','heal'].includes(action)||(action==='heal'&&(p.flasks<=0||p.hp>=p.maxHp)))return false;
  p.stamina-=cost;p.regenDelay=.7;p.action=action;p.timer=0;p.attackHit=false;
  if(action==='roll'){const d=direction&&Math.hypot(direction.x,direction.z)>0?direction:{x:Math.sin(p.angle),z:Math.cos(p.angle)},l=Math.hypot(d.x,d.z);p.rollX=d.x/l;p.rollZ=d.z/l;p.invulnerable=.38;}
  if(action==='heal')p.flasks--;
  state.events.push({type:action});return true;
}
function hurtPlayer(state,damage){const p=state.player;if(p.hp<=0||p.invulnerable>0)return;p.hp=Math.max(0,p.hp-damage);p.hurt=.35;p.invulnerable=.5;state.events.push({type:'hurt'});if(p.hp===0){p.action='dead';p.timer=0;state.drop=p.souls?{x:p.x,z:p.z,souls:p.souls}:null;p.souls=0;state.events.push({type:'death'});}}
export function restAt(state,id){
  const shrine=SANCTUARIES.find(s=>s.id===id),p=state.player;
  if(!shrine||p.hp<=0||p.action!=='idle'||distance(p,shrine)>5||state.enemies.some(e=>!e.dead&&distance(e,p)<16))return false;
  state.checkpoint=id;p.hp=p.maxHp;p.stamina=100;p.flasks=3;
  for(const e of state.enemies){if(e.kind==='warden'&&state.bossDefeated)continue;e.hp=e.maxHp;e.dead=false;e.x=e.homeX;e.z=e.homeZ;e.mode='idle';e.timer=0;}
  state.events.push({type:'rest',name:shrine.name});return true;
}
export function levelUp(state){const p=state.player,s=SANCTUARIES.find(s=>s.id===state.checkpoint);if(p.hp<=0||p.action!=='idle'||p.level>=30||distance(p,s)>5||p.souls<levelCost(p.level)||state.enemies.some(e=>!e.dead&&distance(e,p)<16))return false;p.souls-=levelCost(p.level);p.level++;p.maxHp=100+p.level*12;p.hp=p.maxHp;state.events.push({type:'level'});return true;}
export function respawn(state){const p=state.player,s=SANCTUARIES.find(s=>s.id===state.checkpoint);if(p.hp>0)return false;Object.assign(p,{x:s.x,z:s.z+3,hp:p.maxHp,stamina:100,flasks:3,action:'idle',timer:0,invulnerable:1});for(const e of state.enemies){if(e.kind==='warden'&&state.bossDefeated)continue;Object.assign(e,{hp:e.maxHp,dead:false,x:e.homeX,z:e.homeZ,mode:'idle',timer:0});}state.events.push({type:'respawn'});return true;}
// All timing uses simulation time. The renderer supplies world collision checks.
export function stepCombat(state,dt,input={},canMove=()=>true){
  dt=Math.max(0,Math.min(.05,dt));if(!dt)return;state.elapsed+=dt;
  const p=state.player;p.hurt=Math.max(0,p.hurt-dt);p.invulnerable=Math.max(0,p.invulnerable-dt);p.regenDelay=Math.max(0,p.regenDelay-dt);
  if(p.hp<=0){p.timer+=dt;return;}
  p.timer+=dt;
  const move=(actor,dx,dz)=>{if(canMove(actor.x+dx,actor.z+dz,actor)){actor.x+=dx;actor.z+=dz;}else if(canMove(actor.x+dx,actor.z,actor))actor.x+=dx;else if(canMove(actor.x,actor.z+dz,actor))actor.z+=dz;};
  if(p.action==='attack'||p.action==='heavy'){
    const hitTime=p.action==='heavy'?.5:.22;
    if(!p.attackHit&&p.timer>=hitTime){p.attackHit=true;const range=p.action==='heavy'?4.5:3.8,damage=(p.action==='heavy'?46:28)+p.level*3;
      for(const e of state.enemies){if(e.dead)continue;const d=distance(p,e),dot=d<.01?1:((e.x-p.x)*Math.sin(p.angle)+(e.z-p.z)*Math.cos(p.angle))/d;if(d<range+(e.kind==='warden'?1:0)&&dot>.05){e.hp=Math.max(0,e.hp-damage);e.hurt=.22;state.events.push({type:'hit',x:e.x,z:e.z});if(e.hp===0){e.dead=true;p.souls+=e.reward;state.events.push({type:'kill',souls:e.reward});if(e.kind==='warden'){state.bossDefeated=true;state.events.push({type:'victory'});}}}}
    }
    if(p.timer>=(p.action==='heavy'?.95:.55))p.action='idle';
  }else if(p.action==='roll'){move(p,p.rollX*13*dt,p.rollZ*13*dt);if(p.timer>=.48)p.action='idle';}
  else if(p.action==='heal'){if(p.timer>=.9){p.hp=Math.min(p.maxHp,p.hp+65);p.action='idle';state.events.push({type:'healed'});}}
  else {const len=Math.hypot(input.x||0,input.z||0);if(len>0){const sprint=input.sprint&&p.stamina>2,speed=sprint?8.2:4.8;move(p,input.x/len*speed*dt,input.z/len*speed*dt);if(!input.locked)p.angle=Math.atan2(input.x,input.z);if(sprint){p.stamina=Math.max(0,p.stamina-17*dt);p.regenDelay=.65;}}}
  if(p.regenDelay<=0&&p.action==='idle')p.stamina=Math.min(100,p.stamina+29*dt);
  if(state.drop&&distance(p,state.drop)<2){p.souls+=state.drop.souls;state.drop=null;state.events.push({type:'recover'});}
  for(const e of state.enemies){e.hurt=Math.max(0,e.hurt-dt);if(e.dead)continue;const d=distance(e,p),home=distance(e,{x:e.homeX,z:e.homeZ});e.timer+=dt;
    if(e.mode==='windup'){
      if(e.timer>=e.windup*(e.kind==='warden'&&e.hp<e.maxHp/2?.72:1)){const dot=d<.01?1:((p.x-e.x)*Math.sin(e.angle)+(p.z-e.z)*Math.cos(e.angle))/d;if(d<e.range+.8&&dot>-.15)hurtPlayer(state,e.damage);e.mode='recover';e.timer=0;state.events.push({type:'enemy-strike',x:e.x,z:e.z});}
    }else if(e.mode==='recover'){if(e.timer>1.1){e.mode='idle';e.timer=0;}}
    else if(d<22&&home<32){e.angle=Math.atan2(p.x-e.x,p.z-e.z);if(d<e.range){e.mode='windup';e.timer=0;}else move(e,Math.sin(e.angle)*e.speed*dt,Math.cos(e.angle)*e.speed*dt);}
    else if(home>.2){move(e,(e.homeX-e.x)/home*e.speed*dt,(e.homeZ-e.z)/home*e.speed*dt);if(home<1)e.hp=e.maxHp;}
  }
}
