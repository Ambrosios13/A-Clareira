export function makeBird(THREE,scene){
 const bird=new THREE.Group();scene.add(bird);
 const feather=new THREE.MeshStandardMaterial({color:0x4ca9b2,roughness:.7}),breast=new THREE.MeshStandardMaterial({color:0xf5ca83,roughness:.8});
 function part(material,x,y,z,sx,sy,sz){const m=new THREE.Mesh(new THREE.SphereGeometry(1,40,28),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);bird.add(m);return m;}
 part(feather,0,0,0,.16,.19,.3);part(breast,0,-.05,-.15,.13,.13,.17);part(feather,0,.16,-.23,.14,.14,.14);
 const beak=new THREE.Mesh(new THREE.ConeGeometry(.055,.18,24),breast);beak.rotation.x=-Math.PI/2;beak.position.set(0,.15,-.4);bird.add(beak);
 const wings=[];for(const side of [-1,1]){const wing=new THREE.Group();wing.position.x=side*.1;bird.add(wing);for(let i=0;i<7;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),feather);f.position.set(side*(.08+i*.04),0,i*.025);f.scale.set(.09,.025,.25-i*.015);wing.add(f);}wings.push(wing);}
 const offset=new THREE.Vector3(),direction=new THREE.Vector3();
 return{setVisible(value){bird.visible=value;},update(camera,target,time){direction.subVectors(target,camera.position).normalize();offset.set(.9,-.2,-4).applyQuaternion(camera.quaternion);bird.position.copy(camera.position).add(offset);bird.quaternion.copy(camera.quaternion);bird.scale.setScalar(.6);wings.forEach((w,i)=>w.rotation.z=(i?1:-1)*Math.sin(time*11)*.55);}};
}
