// Shared by terrain, scenery, navigation and combat. No rendering dependencies.
export const SANCTUARIES = [
  {id:'first-ember', name:'Brasa da Primeira Luz', x:0, z:58, radius:9, color:'#ffcf86'},
  {id:'pilgrim', name:'Refúgio do Peregrino', x:98, z:120, radius:11, color:'#ffd993'},
  {id:'moonwell', name:'Fonte da Lua', x:-105, z:-100, radius:12, color:'#a6cfff'},
];
export const REALMS = [
  {id:'gate', name:'Portões do Outono', subtitle:'O caminho ainda se lembra de você', x:35, z:95, radius:18, color:'#edbe79', kind:'gate'},
  {id:'court', name:'Pátio dos Esquecidos', subtitle:'Toda pedra guarda uma promessa', x:112, z:60, radius:23, color:'#dba489', kind:'court'},
  {id:'tower', name:'Vigília Lunar', subtitle:'Uma luz para quem se perdeu', x:-105, z:-100, radius:22, color:'#a6bff2', kind:'tower'},
  {id:'crown', name:'Coroa de Cinzas', subtitle:'Aqui repousa o último guardião', x:35, z:200, radius:28, color:'#e7a47c', kind:'arena'},
];
export const ROUTES = [
  [[0,58],[16,76],[35,95],[65,117],[98,120]],
  [[35,95],[70,83],[112,60]],
  [[98,120],[82,152],[55,175],[35,200]],
  [[0,58],[-55,48],[-82,0],[-105,-55],[-105,-100]],
];
export const ENCOUNTERS = [
  {id:'gate-a',x:34,z:100,kind:'hollow'},
  {id:'court-a',x:104,z:60,kind:'hollow'},
  {id:'court-b',x:120,z:65,kind:'knight'},
  {id:'road-a',x:76,z:150,kind:'hollow'},
  {id:'moon-a',x:-82,z:-48,kind:'knight'},
  {id:'crown-a',x:35,z:200,kind:'warden'},
];
export function segmentDistance(x,z,a,b){
  const dx=b[0]-a[0], dz=b[1]-a[1];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1)));
  return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
}
export function routeDistance(x,z){let d=Infinity;for(const route of ROUTES)for(let i=1;i<route.length;i++)d=Math.min(d,segmentDistance(x,z,route[i-1],route[i]));return d;}
export function insideRealm(x,z,margin=0){return [...REALMS,...SANCTUARIES].some(p=>Math.hypot(x-p.x,z-p.z)<p.radius+margin);}
