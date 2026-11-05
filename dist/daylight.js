export const DAY_LENGTH=480;
const clamp=value=>Math.max(0,Math.min(1,value));
function smooth(a,b,value){const t=clamp((value-a)/(b-a));return t*t*(3-2*t);}
export function daylightAt(seconds){const hours=((8+seconds/DAY_LENGTH*24)%24+24)%24,angle=(hours-6)/24*Math.PI*2,elevation=Math.sin(angle),day=smooth(-.12,.25,elevation),twilight=(1-smooth(0,.35,Math.abs(elevation)))*.8;return{hours,day,night:1-day,twilight,sun:[Math.cos(angle)*.8,elevation,Math.cos(angle)*.6],label:hours<5||hours>=20?'Noite':hours<8?'Amanhecer':hours<17?'Dia':'Entardecer'};}
export function formatWorldTime(hours){return `${String(Math.floor(hours)).padStart(2,'0')}:${String(Math.floor((hours%1)*60)).padStart(2,'0')}`;}
