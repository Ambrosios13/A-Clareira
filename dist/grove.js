import {seeded,insideLake} from './model.js';
import {carveTerrain} from './terrain-cutouts.js';
import {makeTerrainMaterial,makeStoneMaterial} from './materials.js';
import {LAKE,WORLD,terrainHeight,lakeRadius,pathDistance,insideFarm} from './world.js';

export function makeGrove(THREE,scene){
 const random=seeded(19382),range=(a,b)=>a+random()*(b-a),dummy=new THREE.Object3D(),color=new THREE.Color(),occluders=[];
 const terrainGeo=new THREE.BufferGeometry(),positions=[],colors=[],indices=[],segments=384,rings=200;
 for(let ring=0;ring<=rings;ring++)for(let step=0;step<=segments;step++){
  const angle=step/segments*Math.PI*2,t=(ring/rings)**1.65,c=Math.cos(angle),s=Math.sin(angle);
  const x=c*(LAKE.x+(WORLD.radius-LAKE.x)*t),z=s*(LAKE.z+(WORLD.radius-LAKE.z)*t),y=terrainHeight(x,z);
  positions.push(x,y,z);const path=pathDistance(x,z),shore=lakeRadius(x,z);color.setHSL(.29+.018*Math.sin(x*.035)*Math.cos(z*.04),.4,.27+y*.0015+.025*Math.sin(z*.08));
  if(path<1.8&&shore>1.1)color.lerp(new THREE.Color(0xd7bf7d),(1-path/1.8)*.65);if(shore<1.07)color.lerp(new THREE.Color(0xc6b981),.7);colors.push(color.r,color.g,color.b);
  if(ring<rings&&step<segments){const a=ring*(segments+1)+step,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
 }
 const groundIndices=carveTerrain(positions,colors,indices);
 terrainGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));terrainGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));terrainGeo.setIndex(groundIndices);terrainGeo.computeVertexNormals();const ground=new THREE.Mesh(terrainGeo,makeTerrainMaterial(THREE));ground.receiveShadow=true;scene.add(ground);occluders.push(ground);

 // Instances are grouped in spatial cells: distant forest cells are frustum-culled.
 const batches=new Map(),detailMeshes=[];
 const materials={bark:new THREE.MeshStandardMaterial({color:0xffffff,roughness:1}),leaf:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95}),grass:new THREE.MeshStandardMaterial({color:0xffffff,roughness:1,side:THREE.DoubleSide}),stone:makeStoneMaterial(THREE)};
 const geos={trunk:new THREE.CylinderGeometry(.65,1,1,8),crown:new THREE.IcosahedronGeometry(1,1),pine:new THREE.ConeGeometry(1,1,7),stone:new THREE.DodecahedronGeometry(1,0),flower:new THREE.IcosahedronGeometry(1,0)};
 const blade=new THREE.BufferGeometry();blade.setAttribute('position',new THREE.Float32BufferAttribute([-.035,0,0,.035,0,0,-.022,.3,.04,.022,.3,.04,0,.65,.16],3));blade.setIndex([0,1,2,1,3,2,2,3,4]);blade.computeVertexNormals();geos.blade=blade;
 function put(kind,mat,x,y,z,sx,sy,sz,tint,rotation=0,quaternion=null){const key=`${kind}:${Math.floor(x/70)}:${Math.floor(z/70)}`;if(!batches.has(key))batches.set(key,{kind,mat,items:[],x,z});dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(0,rotation,0);if(quaternion)dummy.quaternion.copy(quaternion);dummy.updateMatrix();batches.get(key).items.push({matrix:dummy.matrix.clone(),color:new THREE.Color(tint)});}
 function branch(a,b,r,tint){const delta=new THREE.Vector3().subVectors(b,a),mid=a.clone().add(b).multiplyScalar(.5),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());put('trunk','bark',mid.x,mid.y,mid.z,r,delta.length(),r,tint,0,q);}
 const trees=[];
 for(let attempts=0;trees.length<WORLD.trees&&attempts<50000;attempts++){
  const a=range(0,Math.PI*2),r=Math.sqrt(range(0,1))*WORLD.forestRadius,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(insideFarm(x,z,38)||lakeRadius(x,z)<WORLD.clearingScale||pathDistance(x,z)<2.4)continue;
  // The approach to the clearing stays open, while ridges grow darker conifers.
  if(r<85&&z>20&&Math.abs(x)<25)continue;
  const base=terrainHeight(x,z),species=base>11&&random()<.7?'pine':random()<.28?'birch':'oak',h=species==='pine'?range(11,19):species==='birch'?range(9,15):range(8,15),rTrunk=species==='birch'?range(.17,.26):range(.3,.55);
  const bark=species==='birch'?0xe7dfc1:species==='pine'?0x744c32:0x855238; const foliage=[0x59b841,0x29a878,0xb4cd36,0xf4b52f,0xef753b,0xd75279,0x9876cf]; const zone=(Math.sin(x*.027)+Math.cos(z*.035)+2)/4; const treeColor=new THREE.Color(foliage[Math.min(6,Math.floor(zone*7))]);
  branch(new THREE.Vector3(x,base,z),new THREE.Vector3(x,base+h,z),rTrunk,bark);
  if(species==='pine'){for(let k=0;k<4;k++){const width=(3.1-k*.55)*h/14;put('pine','leaf',x,base+h*(.43+k*.15),z,width,h*.42,width,color.setHSL(range(.31,.42),.56,range(.29,.4)),range(0,6));}}
  else{const clusters=species==='oak'?7:5;for(let k=0;k<clusters;k++){const angle=k*Math.PI*2/clusters,rad=species==='oak'?range(1.3,2.8):range(.6,1.6),cy=base+h+range(-1.4,1),cx=x+Math.cos(angle)*rad,cz=z+Math.sin(angle)*rad;
    if(k<3)branch(new THREE.Vector3(x,base+h*.62,z),new THREE.Vector3(cx,cy,cz),rTrunk*.35,bark);
    const size=species==='oak'?range(1.8,2.7):range(1.1,1.8);put('crown','leaf',cx,cy,cz,size,size*range(.65,.9),size,treeColor.clone().offsetHSL(range(-.015,.015),range(-.04,.04),range(-.045,.06)),range(0,6));}
  }
  trees.push({x,z,species,radius:rTrunk});
 }
 for(let i=0;i<600;i++){const a=i/600*Math.PI*2,r=range(1.005,1.04),x=Math.cos(a)*LAKE.x*r,z=Math.sin(a)*LAKE.z*r;put('stone','stone',x,terrainHeight(x,z)+.12,z,range(.2,.6),range(.15,.4),range(.2,.5),color.setHSL(range(.15,.22),.14,range(.36,.55)),range(0,6));}
 for(let i=0;i<900;i++){const a=range(0,6.28),r=range(45,WORLD.forestRadius),x=Math.cos(a)*r,z=Math.sin(a)*r;if(insideLake(x,z,1.06)||insideFarm(x,z))continue;put('stone','stone',x,terrainHeight(x,z),z,range(.4,1.6),range(.3,1.2),range(.4,1.4),0x858b72,range(0,6));}
 // Ground detail is concentrated near the clearing and along walking trails.
 for(let i=0;i<42000;i++){const a=range(0,6.28),r=i<28000?range(1.025,3.6):range(3.6,15),x=Math.cos(a)*LAKE.x*r,z=Math.sin(a)*LAKE.z*r;if(insideFarm(x,z,24)||insideLake(x,z,1.025)||pathDistance(x,z)<1.3)continue;const scale=range(.6,1.5);put('blade','grass',x,terrainHeight(x,z),z,scale,scale,scale,color.setHSL(range(.25,.37),.45,range(.29,.43)),range(0,6));}
 for(let i=0;i<2400;i++){const a=range(0,6.28),r=range(1.08,3.5),x=Math.cos(a)*LAKE.x*r,z=Math.sin(a)*LAKE.z*r;if(insideLake(x,z,1.08))continue;const y=terrainHeight(x,z)+range(.22,.48);for(let j=0;j<5;j++){const theta=j*6.28/5;put('flower','leaf',x+Math.cos(theta)*.13,y,z+Math.sin(theta)*.13,.13,.035,.09,[0xffcb36,0xff6c7c,0xc080f5,0x5fb9ff,0xfff1d6][i%5],theta);}}
 for(const batch of batches.values()){const mesh=new THREE.InstancedMesh(geos[batch.kind],materials[batch.mat],batch.items.length);batch.items.forEach((item,i)=>{mesh.setMatrixAt(i,item.matrix);mesh.setColorAt(i,item.color);});mesh.computeBoundingSphere();mesh.receiveShadow=true;mesh.castShadow=['trunk','crown','pine','stone'].includes(batch.kind)&&Math.hypot(batch.x,batch.z)<120;scene.add(mesh);detailMeshes.push({mesh,range:batch.kind==='blade'?150:batch.kind==='flower'?190:batch.kind==='stone'?300:600});if(['trunk','crown','pine','stone'].includes(batch.kind))occluders.push(mesh);}
 const padSpots=[];const padShape=new THREE.Shape();padShape.moveTo(0,0);padShape.absarc(0,0,.4,.2,Math.PI*2-.2,false);padShape.lineTo(0,0);const pads=new THREE.InstancedMesh(new THREE.ShapeGeometry(padShape,24),new THREE.MeshStandardMaterial({color:0x80bd3a,roughness:.7,side:THREE.DoubleSide}),85);
 for(let i=0;i<85;i++){const a=range(0,6.28),r=range(.83,.96);dummy.position.set(Math.cos(a)*LAKE.x*r,.13,Math.sin(a)*LAKE.z*r);dummy.rotation.set(-Math.PI/2,0,range(0,6));padSpots.push({x:dummy.position.x,z:dummy.position.z});dummy.scale.setScalar(range(.7,1.3));dummy.updateMatrix();pads.setMatrixAt(i,dummy.matrix);}scene.add(pads);
 const dustGeo=new THREE.BufferGeometry(),dustPositions=[];for(let i=0;i<170;i++)dustPositions.push(range(-75,75),range(.4,8),range(-60,60));dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(dustPositions,3));const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xffe8a5,size:.045,transparent:true,opacity:.55,depthWrite:false}));scene.add(dust);
 return {occluders,trees,padSpots,treeCount:trees.length,cull(camera){for(const item of detailMeshes){const sphere=item.mesh.boundingSphere;item.mesh.visible=camera.position.distanceTo(sphere.center)-sphere.radius<item.range;}},update(time){dust.rotation.y=Math.sin(time*.04)*.025;dust.position.y=Math.sin(time*.3)*.07;}};
}
