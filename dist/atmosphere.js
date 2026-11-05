import {daylightAt} from './daylight.js';
export function makeAtmosphere(THREE,scene){
 const initial=daylightAt(0),uniforms={clock:{value:0},daylight:{value:initial.day},twilight:{value:initial.twilight},sunDirection:{value:new THREE.Vector3(...initial.sun)}};
 const material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms,vertexShader:`varying vec3 direction;void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`precision highp float;varying vec3 direction;uniform float clock;uniform float daylight;uniform float twilight;uniform vec3 sunDirection;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
void main(){vec3 d=normalize(direction);float elevation=max(d.y,0.);vec3 daytime=mix(vec3(.82,.87,.72),vec3(.24,.57,.82),pow(elevation,.48));vec3 nighttime=mix(vec3(.055,.075,.14),vec3(.009,.018,.055),pow(elevation,.5));vec3 color=mix(nighttime,daytime,daylight);color=mix(color,vec3(.85,.29,.14),twilight*pow(1.-elevation,4.)*.65);
float sun=max(dot(d,normalize(sunDirection)),0.);color+=(vec3(1.,.72,.32)*pow(sun,140.)*.5+vec3(1.,.87,.57)*pow(sun,3500.)*2.)*daylight;
float moon=max(dot(d,-normalize(sunDirection)),0.);color+=vec3(.65,.76,1.)*smoothstep(.9992,.99965,moon)*(1.-daylight)*.7;
vec2 starUV=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*180.;vec2 cell=floor(starUV),f=fract(starUV)-.5;float stars=step(.992,hash(cell))*(1.-smoothstep(.02,.13,length(f)));color+=vec3(.75,.85,1.)*stars*(1.-daylight)*smoothstep(0.,.15,elevation);
vec2 p=d.xz/(elevation+.25)*2.5+vec2(clock*.003,0.);float cloud=noise(p)*.55+noise(p*2.1)*.3+noise(p*4.3)*.15;float mask=smoothstep(.54,.77,cloud)*smoothstep(.06,.3,elevation);color=mix(color,mix(vec3(.075,.09,.14),vec3(.96,.93,.82),daylight),mask*.7);gl_FragColor=vec4(color,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
 const sky=new THREE.Mesh(new THREE.SphereGeometry(1800,24,16),material);sky.frustumCulled=false;sky.renderOrder=-10;scene.add(sky);return{sky,update(camera,time,light=initial){sky.position.copy(camera.position);uniforms.clock.value=time;uniforms.daylight.value=light.day;uniforms.twilight.value=light.twilight;uniforms.sunDirection.value.set(...light.sun);}};
}
