// Optional local browser smoke test. Start isolated Chrome with --remote-debugging-port=9337 first.
import {mkdir,writeFile} from 'node:fs/promises';
const pages=await fetch('http://127.0.0.1:9337/json').then(r=>r.json());
const page=pages.find(p=>p.type==='page');
if(!page)throw Error('No isolated browser page');
const socket=new WebSocket(page.webSocketDebuggerUrl),pending=new Map(),errors=[];let id=0;
socket.onmessage=event=>{const data=JSON.parse(event.data);if(data.id){const p=pending.get(data.id);pending.delete(data.id);if(data.error)p?.reject(Error(data.error.message));else p?.resolve(data.result);}if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.exception?.description||data.params.exceptionDetails.text);if(data.method==='Log.entryAdded'&&data.params.entry.level==='error')errors.push(data.params.entry.text+' '+(data.params.entry.url||''));};
await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
function send(method,params={}){return new Promise((resolve,reject)=>{const next=++id;pending.set(next,{resolve,reject});socket.send(JSON.stringify({id:next,method,params}));});}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
async function screenshot(name){const r=await send('Page.captureScreenshot',{format:'png'});await writeFile(`test-results/${name}.png`,Buffer.from(r.data,'base64'));}
try{
  await mkdir('test-results',{recursive:true});await send('Runtime.enable');await send('Log.enable');await send('Log.clear');errors.length=0;await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5173'});
  let ready=false;for(let i=0;i<100;i++){await wait(500);if(await evaluate("document.getElementById('loading')?.hidden===true")){ready=true;break;}}
  if(!ready)throw Error('World did not load: '+await evaluate("document.getElementById('loading')?.textContent"));
  await screenshot('realm-desktop');
  await evaluate("document.getElementById('explore').click()");await wait(1200);
  if(!await evaluate("document.body.classList.contains('journey')"))throw Error('Journey did not start');
  await screenshot('journey-desktop');
  await evaluate("document.querySelector('[data-action=attack]').click()");await wait(100);
  const vigor=await evaluate("document.getElementById('stamina-text').textContent");
  if(vigor==='100 / 100')throw Error('Attack did not spend stamina');
  await wait(800);await evaluate("document.getElementById('game-pause').click()");
  const before=await evaluate("document.getElementById('stamina-text').textContent");await wait(500);const after=await evaluate("document.getElementById('stamina-text').textContent");
  if(before!==after)throw Error('Simulation changed during pause');
  await evaluate("document.getElementById('game-pause').click()");
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await wait(1500);await send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});
  await screenshot('journey-walking');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Shift',code:'ShiftLeft'});
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await wait(6000);
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Shift',code:'ShiftLeft'});
  await evaluate("document.querySelector('[data-action=lock]').click()");await wait(1200);
  const targetLocked=await evaluate("document.getElementById('lock-state').textContent.includes('ALVO FIXADO')");
  if(!targetLocked)throw Error('Could not lock the gate encounter after walking the route');
  await screenshot('journey-encounter');
  await evaluate("document.getElementById('game-pause').click()");
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await wait(800);await screenshot('journey-mobile');
  const overflow=await evaluate('document.documentElement.scrollWidth>innerWidth');if(overflow)throw Error('Mobile layout overflow');
  const results={ready,attackVigor:vigor,pauseStable:before===after,targetLocked,mobileOverflow:overflow,errors};
  await writeFile('test-results/browser-smoke.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results));
  if(errors.length)process.exitCode=1;
}finally{socket.close();}
