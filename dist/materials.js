export function makeTerrainMaterial(THREE){
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
 material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 terrainXZ;').replace('#include <begin_vertex>','#include <begin_vertex>\nterrainXZ=(modelMatrix*vec4(position,1.)).xz;');
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec2 terrainXZ;
float grain(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float soilNoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(grain(i),grain(i+vec2(1.,0.)),f.x),mix(grain(i+vec2(0.,1.)),grain(i+vec2(1.,1.)),f.x),f.y);}`);
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 p=terrainXZ;float broad=soilNoise(p*.13),fine=soilNoise(p*4.5);diffuseColor.rgb*=.88+.2*broad+.12*fine;
float path=min(min(abs(p.x-(14.*sin(p.y*.018)+2.)),abs(p.y-(18.*sin(p.x*.014)-3.))),abs(length(p/vec2(1.35,1.))-61.));float lake=length(p/vec2(42.,31.));float trail=(1.-smoothstep(1.1,2.5,path+soilNoise(p*2.)*.35))*smoothstep(1.06,1.15,lake);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.52,.39,.21)*(.9+.22*fine),trail*.82);
float beach=1.-smoothstep(1.015,1.08,lake);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.57,.5,.3)*(.86+.26*fine),beach*.8);`);
 };return material;
}
export function makeStoneMaterial(THREE){const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92});material.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 rockPoint;').replace('#include <begin_vertex>','#include <begin_vertex>\nrockPoint=position;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 rockPoint;').replace('#include <color_fragment>',`#include <color_fragment>
float veins=sin(rockPoint.x*28.+sin(rockPoint.z*21.)+rockPoint.y*18.);diffuseColor.rgb*=.94+.06*veins;float moss=smoothstep(.15,.75,rockPoint.y)*(.6+.4*sin(rockPoint.x*11.)*sin(rockPoint.z*13.));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.19,.35,.08),moss*.65);`);};return material;}
