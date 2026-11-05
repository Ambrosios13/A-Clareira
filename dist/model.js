import {LAKE} from './world.js';
export const MAX_WAVES=48;
export const SPEED=2.8;
export const defaults={pattern:'single',wavelength:2.4,persistence:6};
export function sanitize(input={}){const state={...defaults};if(!input||typeof input!=='object')return state;if(['single','pair','hexagon','fractal'].includes(input.pattern))state.pattern=input.pattern;for(const [key,min,max]of [['wavelength',1,8],['persistence',2,10]])if(Number.isFinite(input[key]))state[key]=Math.max(min,Math.min(max,input[key]));return state;}
export function seeded(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function insideLake(x,z,margin=1){return (x/LAKE.x)**2+(z/LAKE.z)**2<margin**2;}
export function sourcePattern(pattern){if(pattern==='pair')return[[-.65,0],[.65,0]];if(pattern==='hexagon')return Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*.85,Math.sin(i*Math.PI/3)*.85]);if(pattern==='fractal'){let points=[[0,0]];for(let level=0;level<3;level++){const radius=.72/(2**level);points=points.flatMap(([x,z])=>Array.from({length:3},(_,i)=>[x+Math.cos(i*Math.PI*2/3-Math.PI/2)*radius,z+Math.sin(i*Math.PI*2/3-Math.PI/2)*radius]));}return points;}return[[0,0]];}
export function createSources(x,z,time,settings){if(!insideLake(x,z))return[];const state=sanitize(settings),points=sourcePattern(state.pattern);let scale=4.5;for(let i=0;i<40;i++){if(points.every(([dx,dz])=>insideLake(x+dx*scale,z+dz*scale)))break;scale*=.7;}return points.filter(([dx,dz])=>insideLake(x+dx*scale,z+dz*scale)).map(([dx,dz])=>({x:x+dx*scale,z:z+dz*scale,time,wavelength:state.wavelength,persistence:state.persistence,amplitude:.12/Math.sqrt(points.length)}));}
export function addSources(waves,sources){return[...waves,...sources].slice(-MAX_WAVES);}
function smooth(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
export function waveHeight(x,z,time,wave){const age=time-wave.time,d=Math.hypot(x-wave.x,z-wave.z),behind=age-d/SPEED;if(age<0||behind<=0||behind>=wave.persistence)return 0;const envelope=smooth(0,.22,behind)*(1-smooth(wave.persistence*.5,wave.persistence,behind));return wave.amplitude*Math.sin(2*Math.PI/wave.wavelength*(d-SPEED*age))*Math.exp(-d*.035-age/(wave.persistence*2))*envelope;}
export function fieldHeight(x,z,time,waves){return waves.reduce((sum,wave)=>sum+waveHeight(x,z,time,wave),0);}
export function pruneWaves(waves,time){return waves.filter(wave=>time-wave.time<wave.persistence+2*Math.max(LAKE.x,LAKE.z)/SPEED);}
