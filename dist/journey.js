import {createCombat,stepCombat,requestAction,restAt,levelUp,levelCost,respawn,combatSave,SAVE_KEY} from './combat-model.js';
import {SANCTUARIES,REALMS} from './realm-layout.js';
import {terrainHeight,lakeRadius,WORLD} from './world.js';
import {ADVENTURES} from './places.js';
import {mountainHeight} from './cave-model.js';

export function makeJourney(THREE,scene,camera,navigation,realm,trees,toast){
  const $=id=>document.getElementById(id);
  let saved;try{saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');}catch{}
  const state=createCombat(saved),root=new THREE.Group();scene.add(root);
  let active=false,locked=null,wasInside=false,region='',regionTimer=0,saveClock=0,storageWarned=false,audio=null,muted=true,suspended=false;
  const obstacles=[...realm.obstacles,...trees.map(t=>({...t,radius:t.radius+.4}))],cells=new Map();
  for(const o of obstacles){const key=`${Math.floor(o.x/12)},${Math.floor(o.z/12)}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(o);}
  function canMove(x,z,actor){if(lakeRadius(x,z)<1.12||Math.hypot(x,z)>WORLD.travelRadius)return false;const travel=Math.hypot(x-actor.x,z-actor.z);if(Math.abs(terrainHeight(x,z)-terrainHeight(actor.x,actor.z))>travel*1.45+.06)return false;for(const place of ADVENTURES)if(place.kind==='cave'&&mountainHeight(x-place.x,z-place.z)>1.5)return false;const cx=Math.floor(x/12),cz=Math.floor(z/12);for(let a=cx-1;a<=cx+1;a++)for(let b=cz-1;b<=cz+1;b++)for(const o of cells.get(`${a},${b}`)||[])if(Math.hypot(x-o.x,z-o.z)<o.radius+.42)return false;return true;}
  const materials={armor:new THREE.MeshStandardMaterial({color:0x70878e,metalness:.55,roughness:.45,flatShading:true}),edge:new THREE.MeshStandardMaterial({color:0xc7d0c7,metalness:.7,roughness:.28}),leather:new THREE.MeshStandardMaterial({color:0x33343a,roughness:.9}),cape:new THREE.MeshStandardMaterial({color:0xb44d3f,roughness:1,side:THREE.DoubleSide}),gold:new THREE.MeshStandardMaterial({color:0xcaa06b,metalness:.6,roughness:.4})};
  const box=new THREE.BoxGeometry(1,1,1);
  function cube(parent,material,x,y,z,sx,sy,sz){const m=new THREE.Mesh(box,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m;}
  function fighter(enemy){const model=new THREE.Group(),body=new THREE.Group();model.add(body);const isBoss=enemy?.kind==='warden',armor=enemy?materials.armor.clone():materials.armor.clone();if(enemy)armor.color.set(isBoss?0x4a515b:enemy.kind==='knight'?0x6c6372:0x66766c);const capeMaterial=materials.cape.clone();if(enemy)capeMaterial.color.set(isBoss?0x563a59:0x68694f);
    cube(body,armor,0,1.35,0,.75,.85,.45);cube(body,materials.gold,0,1.03,.03,.8,.12,.5);cube(body,armor,0,2,0,.57,.61,.53);cube(body,materials.leather,0,2.02,.278,.48,.12,.025);
    const eyes=new THREE.MeshBasicMaterial({color:enemy?0xffad58:0xb8ebea});for(const side of [-1,1])cube(body,eyes,side*.13,2.03,.299,.085,.045,.025);
    cube(body,materials.edge,0,2.25,.07,.08,.12,.56);const cape=cube(body,capeMaterial,0,1.2,-.32,.88,1.35,.09);cape.rotation.x=-.15;
    const legs=[],arms=[];for(const side of [-1,1]){const leg=new THREE.Group();leg.position.set(side*.23,1.02,0);body.add(leg);cube(leg,materials.leather,0,-.38,0,.28,.65,.3);cube(leg,armor,0,-.78,.07,.32,.3,.45);legs.push(leg);const arm=new THREE.Group();arm.position.set(side*.55,1.65,0);body.add(arm);cube(arm,armor,0,-.1,0,.37,.4,.45);cube(arm,materials.leather,0,-.46,0,.24,.4,.25);arms.push(arm);}
    const sword=new THREE.Group();arms[1].add(sword);sword.position.set(0,-.63,.14);cube(sword,materials.gold,0,0,0,.56,.1,.16);cube(sword,materials.edge,0,.02,.85,.17,.075,1.7);cube(sword,materials.leather,0,0,-.18,.12,.12,.3);
    cube(arms[0],armor,-.12,-.4,.16,.12,.85,.6);cube(arms[0],materials.gold,-.19,-.4,.16,.02,.08,.55);
    if(isBoss){for(const side of [-1,1]){cube(body,materials.gold,side*.32,2.45,0,.16,.55,.18);cube(body,armor,side*.7,1.8,0,.5,.4,.65);}model.scale.setScalar(1.9);}else if(enemy?.kind==='knight')model.scale.setScalar(1.2);
    const shadow=new THREE.Mesh(new THREE.CircleGeometry(isBoss?1.6:.75,24),new THREE.MeshBasicMaterial({color:0x101c20,transparent:true,opacity:.24,depthWrite:false}));shadow.rotation.x=-Math.PI/2;root.add(shadow);
    root.add(model);return {model,body,legs,arms,cape,armor,shadow,previous:{x:0,z:0},stride:0};
  }
  const hero=fighter(),enemies=state.enemies.map(e=>({state:e,visual:fighter(e)}));
  const ring=new THREE.Mesh(new THREE.RingGeometry(.75,.84,32),new THREE.MeshBasicMaterial({color:0xf8d595,side:THREE.DoubleSide,transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;root.add(ring);
  const warnings=enemies.map(({state:e})=>{const m=new THREE.Mesh(new THREE.RingGeometry(e.range-.1,e.range,48),new THREE.MeshBasicMaterial({color:0xffb15d,side:THREE.DoubleSide,transparent:true,opacity:.65,depthWrite:false}));m.rotation.x=-Math.PI/2;root.add(m);return m;});
  const lost=new THREE.Mesh(new THREE.OctahedronGeometry(.4),new THREE.MeshStandardMaterial({color:0xb1e1d8,emissive:0x61c8bc,emissiveIntensity:2}));root.add(lost);
  const slash=new THREE.Mesh(new THREE.RingGeometry(1.8,2.1,24,1,0,Math.PI*1.2),new THREE.MeshBasicMaterial({color:0xffe6b6,side:THREE.DoubleSide,transparent:true,opacity:.75,depthWrite:false}));slash.rotation.x=-Math.PI/2;root.add(slash);
  const sparks=new THREE.Group();root.add(sparks);const sparkGeo=new THREE.OctahedronGeometry(.075),sparkMat=new THREE.MeshBasicMaterial({color:0xffd795});for(let i=0;i<16;i++)sparks.add(new THREE.Mesh(sparkGeo,sparkMat));let sparkLife=0;
  function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(combatSave(state)));}catch{if(!storageWarned){toast('Armazenamento indisponível: seu progresso vale nesta sessão.');storageWarned=true;}}}
  function tone(freq,duration=.12,type='triangle',volume=.04){if(muted)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type=type;oscillator.frequency.setValueAtTime(freq,audio.currentTime);oscillator.frequency.exponentialRampToValueAtTime(freq*.45,audio.currentTime+duration);gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+duration);}catch{}}
  function direction(){const keys=navigation.keys,fw=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);const dx=navigation.controls.target.x-camera.position.x,dz=navigation.controls.target.z-camera.position.z,l=Math.hypot(dx,dz)||1;return {x:fw*dx/l-side*dz/l,z:fw*dz/l+side*dx/l,sprint:keys.has('ShiftLeft')||keys.has('ShiftRight'),locked:!!locked};}
  function action(kind){if(!active||navigation.room||suspended)return;const p=state.player;if(kind==='lock'){locked=locked?null:state.enemies.filter(e=>!e.dead&&Math.hypot(e.x-p.x,e.z-p.z)<24).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0]||null;return;}if(kind==='rest'){const s=SANCTUARIES.find(s=>Math.hypot(s.x-p.x,s.z-p.z)<5);if(!s||!restAt(state,s.id))toast('Descanse junto a uma brasa, longe dos inimigos.');return;}if(kind==='level'){if(!levelUp(state))toast(`Evolua na sua brasa: ${levelCost(p.level)} brasas necessárias, sem inimigos por perto.`);return;}if(kind==='respawn'){if(respawn(state)){locked=null;placeCamera();}return;}requestAction(state,kind,direction());}
  const actions={KeyJ:'attack',KeyK:'heavy',Space:'roll',KeyL:'heal',KeyQ:'lock',KeyT:'rest',KeyU:'level'};
  addEventListener('keydown',event=>{if(!active||navigation.room||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,select,button,dialog,textarea'))return;const kind=actions[event.code];if(kind){event.preventDefault();action(kind);}});
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{action(b.dataset.action);$('scene').focus({preventScroll:true});}));
  $('sound-toggle').onclick=()=>{muted=!muted;$('sound-toggle').setAttribute('aria-pressed',!muted);$('sound-toggle').textContent=muted?'Som desligado':'Som ligado';tone(440);};
  function placeCamera(){const p=state.player,y=terrainHeight(p.x,p.z);navigation.controls.target.set(p.x,y+1.35,p.z);camera.position.set(p.x-6,y+4.4,p.z-11);navigation.controls.update();}
  function start(){active=true;camera.fov=58;camera.updateProjectionMatrix();root.visible=true;document.body.classList.add('journey','exploring','panel-collapsed');$('panel-toggle').setAttribute('aria-expanded','false');$('panel-toggle').textContent='Ondas +';navigation.exitCave();navigation.setWalking(true);placeCamera();$('scene').focus();toast('Siga as pedras até os Portões do Outono. J ataca · Espaço esquiva · Q trava a mira.');}
  function stop(){active=false;camera.fov=48;camera.updateProjectionMatrix();navigation.setWalking(false);document.body.classList.remove('journey');root.visible=true;$('region-banner').classList.remove('show');$('enemy-hud').hidden=true;$('shrine-hint').hidden=true;$('death-screen').hidden=true;hero.model.visible=false;hero.shadow.visible=false;ring.visible=false;warnings.forEach(m=>m.visible=false);save();}
  function animate(visual,actor,dt){const {model,body,legs,arms,cape,armor,shadow}=visual;model.visible=!actor.dead;shadow.visible=model.visible;if(!model.visible)return;const y=terrainHeight(actor.x,actor.z);model.position.set(actor.x,y+.05,actor.z);model.rotation.y=actor.angle;shadow.position.set(actor.x,y+.025,actor.z);
    const moved=Math.hypot(actor.x-visual.previous.x,actor.z-visual.previous.z);visual.previous={x:actor.x,z:actor.z};visual.stride+=Math.min(moved,.5)*2.8;const stride=moved>.002?Math.sin(visual.stride)*.55:0;legs[0].rotation.x=stride;legs[1].rotation.x=-stride;arms[0].rotation.x=-stride*.5;arms[1].rotation.x=stride*.5;arms[1].rotation.y=0;body.rotation.x=0;body.position.y=0;cape.rotation.x=-.17-Math.abs(stride)*.4;
    if(actor.action==='roll'){body.rotation.x=actor.timer/.48*Math.PI*2;body.position.y=.35;}
    if(actor.action==='heal')arms[0].rotation.x=-2.3;
    if(actor.action==='attack'||actor.action==='heavy'){arms[1].rotation.y=-1.8+Math.min(1,actor.timer/(actor.action==='heavy'?.7:.4))*3.5;arms[1].rotation.x=-.5;}
    if(actor.mode==='windup'){arms[1].rotation.x=-2.2;body.rotation.x=-.1;}
    if(actor.mode==='recover')arms[1].rotation.x=-.8;
    if(actor.action==='dead')body.rotation.x=-Math.PI/2;
    armor.emissive.setHex(actor.hurt>0?0xffcc99:actor.mode==='windup'?0x7e3519:0x000000);armor.emissiveIntensity=actor.hurt>0?.8:.45;
  }
  function eventEffects(){for(const event of state.events){if(event.type==='hit'){sparkLife=.28;sparks.position.set(event.x,terrainHeight(event.x,event.z)+1.2,event.z);tone(155,.11,'sawtooth');}if(event.type==='hurt')tone(65,.2,'sawtooth');if(event.type==='attack'||event.type==='heavy')tone(260,.15);if(event.type==='kill')toast(`+${event.souls} brasas`);if(event.type==='death'){locked=null;tone(90,1);save();}if(event.type==='rest')toast(`${event.name} · Vida e frascos restaurados. Os inimigos retornaram.`);if(event.type==='level')toast(`Vínculo ${state.player.level+1} · Sua vida e seus ataques ficaram mais fortes.`);if(event.type==='recover')toast('Você recuperou suas brasas.');if(event.type==='victory'){toast('GUARDIÃO VENCIDO · A Coroa de Cinzas voltou a brilhar.');$('quest-text').textContent='O guardião caiu. As cavernas ainda guardam seus segredos.';tone(620,.8);}if(['rest','level','recover','victory','kill','respawn'].includes(event.type))save();}state.events.length=0;}
  function hud(){const p=state.player;$('health-fill').style.width=`${p.hp/p.maxHp*100}%`;$('stamina-fill').style.width=`${p.stamina}%`;$('health-text').textContent=`${Math.ceil(p.hp)} / ${p.maxHp}`;$('stamina-text').textContent=`${Math.ceil(p.stamina)} / 100`;$('souls-count').textContent=p.souls.toLocaleString('pt-BR');$('flask-count').textContent=`${p.flasks} / 3`;$('level-count').textContent=`VÍNCULO ${p.level+1}`;$('death-screen').hidden=p.hp>0;$('damage-veil').style.opacity=p.hurt>0?String(p.hurt*1.8):'0';
    const shrine=SANCTUARIES.find(s=>Math.hypot(s.x-p.x,s.z-p.z)<5);$('shrine-hint').hidden=!shrine||!!navigation.room||p.hp<=0;if(shrine)$('shrine-name').textContent=`${shrine.name} · Evoluir: ${levelCost(p.level)} brasas`;
    const target=locked||state.enemies.find(e=>e.kind==='warden'&&!e.dead&&Math.hypot(e.x-p.x,e.z-p.z)<30);$('enemy-hud').hidden=!target||!!navigation.room;if(target){$('enemy-name').textContent=target.kind==='warden'?'Aster, o Guardião das Cinzas':target.kind==='knight'?'Cavaleiro da Vigília':'Peregrino Esquecido';$('enemy-fill').style.width=`${target.hp/target.maxHp*100}%`;}
    $('lock-state').textContent=locked?'ALVO FIXADO · Q PARA SOLTAR':'Q · FIXAR ALVO';
    $('combat-actions').hidden=!!navigation.room;$('quest-text').textContent=state.bossDefeated?'O guardião caiu. Explore os segredos sob as montanhas.':'Siga as pedras. Encontre a Coroa de Cinzas, ao sul.';
    const heading=Math.atan2(navigation.controls.target.x-camera.position.x,navigation.controls.target.z-camera.position.z)*180/Math.PI;
    $('compass-heading').textContent=`${['S','SO','O','NO','N','NE','L','SE'][((Math.round(-heading/45)%8)+8)%8]} · ${Math.round((180-heading+360)%360)}°`;
  }
  function update(dt,time,paused){suspended=paused;if(!active){hero.model.visible=false;hero.shadow.visible=false;ring.visible=false;slash.visible=false;sparks.visible=false;lost.visible=false;for(const {state:e,visual}of enemies)animate(visual,e,0);warnings.forEach(m=>m.visible=false);return;}
    if(navigation.room){wasInside=true;root.visible=false;$('region-banner').classList.remove('show');hud();return;}root.visible=true;
    if(wasInside||Math.hypot(navigation.controls.target.x-state.player.x,navigation.controls.target.z-state.player.z)>35){wasInside=false;state.player.x=navigation.controls.target.x;state.player.z=navigation.controls.target.z;locked=null;}
    if(locked&&(locked.dead||Math.hypot(locked.x-state.player.x,locked.z-state.player.z)>30))locked=null;
    if(locked)state.player.angle=Math.atan2(locked.x-state.player.x,locked.z-state.player.z);
    const tick=paused?0:dt;stepCombat(state,tick,direction(),canMove);eventEffects();
    const p=state.player;navigation.follow(p,dt);
    if(locked&&!paused){const desired=new THREE.Vector3(p.x-Math.sin(p.angle)*10,terrainHeight(p.x,p.z)+4.5,p.z-Math.cos(p.angle)*10);camera.position.lerp(desired,1-Math.exp(-dt*3));camera.lookAt(navigation.controls.target);}
    animate(hero,p,tick);enemies.forEach(({state:e,visual},i)=>{animate(visual,e,tick);const m=warnings[i];m.visible=!e.dead&&e.mode==='windup';m.position.set(e.x,terrainHeight(e.x,e.z)+.07,e.z);m.material.opacity=.25+Math.min(1,e.timer/e.windup)*.6;});
    ring.visible=!!locked;if(locked)ring.position.set(locked.x,terrainHeight(locked.x,locked.z)+.09,locked.z);
    lost.visible=!!state.drop;if(state.drop){lost.position.set(state.drop.x,terrainHeight(state.drop.x,state.drop.z)+1+Math.sin(time*2)*.15,state.drop.z);lost.rotation.y=time;}
    slash.visible=(p.action==='attack'||p.action==='heavy')&&p.timer>.15&&p.timer<.5;slash.position.set(p.x,terrainHeight(p.x,p.z)+1.1,p.z);slash.rotation.z=-p.angle-p.timer*6;
    sparkLife=Math.max(0,sparkLife-tick);sparks.visible=sparkLife>0;sparks.children.forEach((s,i)=>{const age=.28-sparkLife,a=i*2.399;s.position.set(Math.cos(a)*age*6,Math.sin(i*7)*age*5,Math.sin(a)*age*6);});
    const place=REALMS.find(r=>Math.hypot(p.x-r.x,p.z-r.z)<r.radius+9);if(place&&region!==place.id){region=place.id;regionTimer=4;$('region-name').textContent=place.name;$('region-subtitle').textContent=place.subtitle;}regionTimer=Math.max(0,regionTimer-tick);$('region-banner').classList.toggle('show',regionTimer>0);
    hud();saveClock+=tick;if(saveClock>8){saveClock=0;save();}
  }
  addEventListener('pagehide',save);
  return {start,stop,update,action,get active(){return active;},get state(){return state;}};
}
