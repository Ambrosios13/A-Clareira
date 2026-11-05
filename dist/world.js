export const LAKE={x:42,z:31,level:.07};
export const WORLD={radius:900,travelRadius:460,trees:4500,forestRadius:700,maxViewDistance:180,clearingScale:3};
export const FARMS=[{id:'orchard',name:'Pomar do Sol',x:-135,z:115,color:'#ffb766'},{id:'lavender',name:'Lavanda da Colina',x:210,z:-100,color:'#c599ff'},{id:'wheat',name:'Sítio do Moinho',x:-300,z:-45,color:'#ffe196'}];
export const LANDMARKS=[{name:'Prado das flores',x:95,z:65,color:'#ffd06e'},{name:'Colina violeta',x:-240,z:-190,color:'#bf9df2'},{name:'Pedras do poente',x:290,z:160,color:'#f0aa7d'},...FARMS];
export function insideFarm(x,z,margin=30){return FARMS.some(farm=>Math.hypot(x-farm.x,z-farm.z)<margin);}
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function lakeRadius(x,z){return Math.hypot(x/LAKE.x,z/LAKE.z);}
// Continuous terrain: a level clearing blends into broad hills and small ridges.
function rawHeight(x,z){const edge=lakeRadius(x,z);if(edge<=1)return -.35;const clearing=smooth(1.12,4.2,edge);const hills=5+4.2*Math.sin(x*.019+.6)*Math.cos(z*.017)+3.6*Math.sin(z*.027+x*.011)+1.8*Math.cos(x*.064-z*.035)+.6*Math.sin(x*.14)*Math.cos(z*.11);const peak=25*Math.exp(-((x+240)**2+(z+190)**2)/6400)+22*Math.exp(-((x-290)**2+(z-160)**2)/5200)+30*Math.exp(-((x-350)**2+(z+380)**2)/12000);return -.05+smooth(1,1.12,edge)*.18+clearing*Math.max(.2,hills+peak);}
export function terrainHeight(x,z){let height=rawHeight(x,z);for(const farm of FARMS){const blend=1-smooth(22,38,Math.hypot(x-farm.x,z-farm.z));if(blend>0)height=height*(1-blend)+rawHeight(farm.x,farm.z)*blend;}return height;}
export function pathDistance(x,z){return Math.min(Math.abs(x-(14*Math.sin(z*.018)+2)),Math.abs(z-(18*Math.sin(x*.014)-3)),Math.abs(Math.hypot(x/1.35,z)-61));}
export function constrainTarget(x,z){const r=Math.hypot(x,z),scale=r>WORLD.travelRadius?WORLD.travelRadius/r:1;return{x:x*scale,z:z*scale,y:Math.max(.15,terrainHeight(x*scale,z*scale))+.8};}
export function isTap(start,end){return start.button===0&&!start.multitouch&&!start.dragged&&Math.hypot(end.x-start.x,end.y-start.y)<=6&&end.time-start.time<550;}
