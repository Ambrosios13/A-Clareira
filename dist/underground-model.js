import {caveWidth,caveFloor,caveRoof,caveWalkable,CAVE} from './cave-model.js';

// Only this surface cave connects to the dwarven route. Never a travel destination.
export const SECRET_SITE='moss-cave';
export const SECRET_Z=-104;
export const DEEP_END=-234;
export const CLAN_NAME='Clã da Pedra Milenar';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
// distance behind the goblin chamber, spine x, floor, half-width, vault height
const stations=[
 [0,0,caveFloor(0,-21),caveWidth(-21),caveRoof(0,-21)-caveFloor(0,-21)],
 [12,-3,-3,2.5,4.7],[25,5,-9,2,4.1],
 [40,7,-16,7,7],[48,7,-16,7,7],
 [56,-4,-22,2.2,4.2],[66,-7,-26,6,6],[74,-7,-26,5,6],
 [83,-1,-29,1.8,3.8],[90,-2,-31,1.75,3.8],
 [110,6,-41,1.8,3.8],[130,-6,-50,2.2,4.3],[148,0,-60,3,5],
 [163,0,-65,15,12],[185,0,-65,17,15],[207,0,-65,11,10],[213,0,-65,8,8]
];

export function hasSecret(site){return site.id===SECRET_SITE;}
export function interiorEnd(site,opened=false){return hasSecret(site)&&opened?DEEP_END+1:SECRET_Z+1.5;}
export function interiorProfile(z){
 if(z>=CAVE.backZ)return{center:0,spine:0,floor:caveFloor(0,z),width:caveWidth(z),height:caveRoof(0,z)-caveFloor(0,z)};
 const t=clamp(-z-21,0,213);let a=stations[0],b=stations[1];
 for(let i=1;i<stations.length;i++){a=stations[i-1];b=stations[i];if(t<=b[0])break;}
 const f=smooth((t-a[0])/(b[0]-a[0])),values=a.map((v,i)=>v+(b[i]-v)*f);
 // Two lateral, dead-end mine galleries merge continuously into the main vault.
 const left=19*Math.exp(-(((z+65)/2.8)**8)),right=16*Math.exp(-(((z+91)/2.6)**8));
 return{spine:values[1],center:values[1]+(right-left)/2,floor:values[2],width:values[3]+(left+right)/2,height:values[4]};
}
export function interiorFloor(x,z){
 if(z>=-21)return caveFloor(x,z);
 const f=smooth((-z-21)/5),p=interiorProfile(z);
 return p.floor+(1-f)*(caveFloor(x,-21)-caveFloor(0,-21))+f*.025*Math.sin(x*.8)*Math.sin(z*.4);
}
export function interiorRoof(x,z){const p=interiorProfile(z);return interiorFloor(x,z)+p.height*Math.sqrt(Math.max(0,1-((x-p.center)/p.width)**2));}
export function constrainInteriorPoint(site,x,y,z,opened=false){
 z=clamp(z,interiorEnd(site,opened),29);const p=interiorProfile(z),margin=Math.max(z>=-21?1.3:.7,p.width*(1-Math.sqrt(Math.max(0,1-(1.95/p.height)**2))));
 x=clamp(x,p.center-p.width+margin,p.center+p.width-margin);
 return{x,y:clamp(y,interiorFloor(x,z)+1.25,interiorRoof(x,z)-.55),z};
}
export function canOpenSecret(site,x,z){const p=interiorProfile(SECRET_Z);return hasSecret(site)&&Math.hypot(x-p.spine,z-(SECRET_Z+.65))<=3.2;}
export function undergroundZone(z){return z<-176?CLAN_NAME:z<SECRET_Z?'Senda esquecida':z<-51?'Minas abandonadas':z<-21?'Túneis inferiores':'Salão dos goblins';}

// The white ward is a permanent perception boundary for goblins, even when open to visitors.
export function goblinWalkable(x,z){
 if(z>=-18)return caveWalkable(x,z,1.2);
 const p=interiorProfile(z);return z>SECRET_Z+3&&Math.abs(x-p.center)<p.width-.9&&interiorRoof(x,z)-interiorFloor(x,z)>2.2;
}
export function goblinSpine(z){
 if(z>=-21)return -2.6*smooth((z+14)/3)*(1-smooth((z+2)/3));
 return interiorProfile(z).spine;
}
export const GOBLIN_STOPS=[
 {x:-5,z:4},{x:5,z:12},{x:0,z:-16},{x:interiorProfile(-38).spine,z:-38},
 {x:-14,z:-65},{x:7,z:-68},{x:13,z:-91},{x:interiorProfile(-100).spine,z:-100}
];
export function goblinRoute(from,to){
 const points=[],spine=goblinSpine(from.z);if(Math.abs(from.x-spine)>.6)points.push({x:spine,z:from.z});
 const steps=Math.ceil(Math.abs(to.z-from.z)/1.5);for(let i=1;i<=steps;i++){const z=from.z+(to.z-from.z)*i/steps;points.push({x:goblinSpine(z),z});}
 points.push({...to});return points;
}

export function undergroundMesh(site,step=.35,columns=64){
 const end=hasSecret(site)?DEEP_END:SECRET_Z,rows=Math.ceil((-21-end)/step),vault={positions:[],indices:[]},floor={positions:[],indices:[]};
 for(let r=0;r<=rows;r++){const z=-21+(end+21)*r/rows,p=interiorProfile(z);for(let c=0;c<=columns;c++){
  const a=c/columns*Math.PI,x=p.center+Math.cos(a)*p.width,join=1-smooth((-z-21)/3),oldNoise=(Math.sin(a*17+z*.9)*.18+Math.sin(a*31-z*1.6)*.07)*Math.sin(a),noise=oldNoise*join+.09*Math.sin(a*19+z*1.1)*Math.sin(a)*(1-join);
  vault.positions.push(x+oldNoise*Math.cos(a)*join,interiorFloor(x,z)+Math.sin(a)*p.height+noise,z);
  const fx=p.center+(c/columns*2-1)*p.width;floor.positions.push(fx,interiorFloor(fx,z),z);
  if(r<rows&&c<columns){const i=r*(columns+1)+c;vault.indices.push(i,i+1,i+columns+1,i+1,i+columns+2,i+columns+1);floor.indices.push(i,i+1,i+columns+1,i+1,i+columns+2,i+columns+1);}
 }}
 return{vault,floor,end};
}
