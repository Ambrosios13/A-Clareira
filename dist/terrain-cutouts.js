import {ADVENTURES} from './places.js';

// Excise the ground itself, including raycast geometry, beneath the covered entrances.
export function caveCutouts(){return ADVENTURES.filter(s=>s.kind==='cave').flatMap(s=>[
 {minX:s.x-15,maxX:s.x+15,minZ:s.z-26,maxZ:s.z+30},
 {minX:s.x-10,maxX:s.x+10,minZ:s.z-42,maxZ:s.z-26}
]);}
function split(poly,axis,bound,sign){
 const inside=[],outside=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length],da=(a.p[axis]-bound)*sign,db=(b.p[axis]-bound)*sign;
  (da>=0?inside:outside).push(a);
  if((da>=0)!==(db>=0)){const t=da/(da-db),v={p:a.p.map((x,k)=>x+(b.p[k]-x)*t),c:a.c.map((x,k)=>x+(b.c[k]-x)*t)};inside.push(v);outside.push(v);}
 }
 return{inside,outside};
}
export function subtractTerrainRect(poly,rect){
 let remainder=poly;const result=[];
 for(const [axis,bound,sign] of [[0,rect.minX,1],[0,rect.maxX,-1],[2,rect.minZ,1],[2,rect.maxZ,-1]]){
  if(remainder.length<3)break;const halves=split(remainder,axis,bound,sign);if(halves.outside.length>=3)result.push(halves.outside);remainder=halves.inside;
 }
 return result;
}
export function carveTerrain(positions,colors,indices,cutouts=caveCutouts()){
 const carved=[];
 for(let i=0;i<indices.length;i+=3){
  const ids=indices.slice(i,i+3),xs=ids.map(n=>positions[n*3]),zs=ids.map(n=>positions[n*3+2]);
  const candidates=cutouts.filter(r=>Math.max(...xs)>r.minX&&Math.min(...xs)<r.maxX&&Math.max(...zs)>r.minZ&&Math.min(...zs)<r.maxZ);
  if(!candidates.length){carved.push(...ids);continue;}
  let pieces=[ids.map(n=>({p:positions.slice(n*3,n*3+3),c:colors.slice(n*3,n*3+3)}))];
  for(const rect of candidates)pieces=pieces.flatMap(poly=>subtractTerrainRect(poly,rect));
  for(const poly of pieces){const base=positions.length/3;for(const v of poly){positions.push(...v.p);colors.push(...v.c);}for(let j=1;j<poly.length-1;j++)carved.push(base,base+j,base+j+1);}
 }
 return carved;
}
