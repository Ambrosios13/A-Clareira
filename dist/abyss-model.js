import {interiorFloor,interiorRoof,constrainInteriorPoint} from './underground-model.js';

export const ABYSS_SITE='violet-cave';
export const ABYSS_GATE={x:14.5,z:-91};
export const ABYSS_NAME='Vhar, o Vigia da Cinza';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const stations=[[12,-91,-26,1.4,4],[16,-91,-26,1.4,4],[24,-91,-29,1.5,4],[38,-99,-35,1.5,4.2],[50,-107,-43,1.8,4.8],[62,-114,-50,4,7],[74,-115,-50,10,13],[85,-115,-50,9,12],[92,-115,-50,3,5]];
export function hasAbyss(site){return site.id===ABYSS_SITE;}
export function abyssProfile(x){
 x=clamp(x,12,92);let a=stations[0],b=stations[1];for(let i=1;i<stations.length;i++){a=stations[i-1];b=stations[i];if(x<=b[0])break;}
 let t=(x-a[0])/(b[0]-a[0]);t=t*t*(3-2*t);const v=a.map((n,i)=>n+(b[i]-n)*t);return{center:v[1],floor:v[2],width:v[3],height:v[4]};
}
export function abyssFloor(x,z){const p=abyssProfile(x);return p.floor+.025*Math.sin(x*.8)*Math.sin(z*.4);}
export function abyssRoof(x,z){const p=abyssProfile(x);return abyssFloor(x,z)+p.height*Math.sqrt(Math.max(0,1-((z-p.center)/p.width)**2));}
export function insideAbyss(x,y,z){return x>=12&&x<=92&&y>=abyssFloor(x,z)-.05&&y<abyssRoof(x,z);}
export function constrainExploration(site,x,y,z,secretOpened=false,abyssOpened=false){
 const mine=constrainInteriorPoint(site,x,y,z,secretOpened);mine.floor=interiorFloor(mine.x,mine.z);mine.region='mine';
 if(!hasAbyss(site)||!abyssOpened)return mine;
 const ax=clamp(x,12,91),p=abyssProfile(ax),margin=Math.max(.7,p.width*(1-Math.sqrt(Math.max(0,1-(1.95/p.height)**2))));
 const az=clamp(z,p.center-p.width+margin,p.center+p.width-margin),floor=abyssFloor(ax,az);
 const branch={x:ax,z:az,y:clamp(y,floor+1.25,abyssRoof(ax,az)-.55),floor,region:'abyss'};
 const dMine=(x-mine.x)**2+(z-mine.z)**2,dBranch=(x-ax)**2+(z-az)**2;
 return dBranch<dMine||(x>=14&&dBranch<.001)?branch:mine;
}
export function nearAbyssGate(site,x,z){return hasAbyss(site)&&Math.hypot(x-ABYSS_GATE.x,z-ABYSS_GATE.z)<2.8;}
export function cutAbyssOpening(mesh,site){
 if(!hasAbyss(site))return mesh;const indices=[];
 for(let i=0;i<mesh.indices.length;i+=3){const tri=mesh.indices.slice(i,i+3),center=[0,1,2].map(axis=>tri.reduce((sum,n)=>sum+mesh.positions[n*3+axis],0)/3);if(!insideAbyss(...center))indices.push(...tri);}
 return{positions:mesh.positions,indices};
}
export function abyssMesh(){
 const vault={positions:[],indices:[]},floor={positions:[],indices:[]},rows=400,cols=64;
 for(let r=0;r<=rows;r++){const x=12+80*r/rows,p=abyssProfile(x);for(let c=0;c<=cols;c++){
  const a=c/cols*Math.PI,z=p.center+Math.cos(a)*p.width;vault.positions.push(x,abyssFloor(x,z)+Math.sin(a)*p.height+.06*Math.sin(a*23+x)*Math.sin(a),z);
  const fz=p.center+(c/cols*2-1)*p.width;floor.positions.push(x,abyssFloor(x,fz),fz);
  if(r<rows&&c<cols){const i=r*(cols+1)+c;for(const geo of [vault,floor])geo.indices.push(i,i+1,i+cols+1,i+1,i+cols+2,i+cols+1);}
 }}
 // Remove the overlapping shell where the lateral gallery already supplies an open volume.
 const kept=[];for(let i=0;i<vault.indices.length;i+=3){const tri=vault.indices.slice(i,i+3),[x,y,z]=[0,1,2].map(axis=>tri.reduce((sum,n)=>sum+vault.positions[n*3+axis],0)/3);if(!(x<16&&y>interiorFloor(x,z)&&y<interiorRoof(x,z)))kept.push(...tri);}vault.indices=kept;
 const floorKept=[];for(let i=0;i<floor.indices.length;i+=3){const tri=floor.indices.slice(i,i+3),[x,y,z]=[0,1,2].map(axis=>tri.reduce((sum,n)=>sum+floor.positions[n*3+axis],0)/3);if(!(x<16&&Math.abs(y-interiorFloor(x,z))<.06&&interiorRoof(x,z)>y+.1))floorKept.push(...tri);}floor.indices=floorKept;
 return{vault,floor};
}
