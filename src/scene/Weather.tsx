import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { QUALITY, type Quality } from '../config'
import { random } from './materials'

const rainVertex = `
attribute vec4 aSeed;
uniform float uTime;
uniform float uDrip;
varying float vAlpha;
varying vec2 vUv;
void main(){
  vUv=uv;
  float height=mix(24.,3.25,uDrip);
  float speed=mix(12.+aSeed.w*12.,5.+aSeed.w*3.,uDrip);
  float y=mod(aSeed.y*height-uTime*speed,height);
  vec3 p=vec3(mix(aSeed.x*70.-35.,aSeed.x*14.6-7.3,uDrip),y,mix(aSeed.z*68.-30.,-.61,uDrip));
  p.x+=y*.065;
  float streakLength=mix(.17+aSeed.w*.31,.14,uDrip);
  p+=vec3(position.x*(.009+aSeed.w*.008)+position.y*streakLength*.065,position.y*streakLength,0.);
  float storeLight=exp(-length(p.xz-vec2(0.,-.8))*.1);
  vAlpha=(.15+storeLight*.46)*mix(1.,.6,uDrip);
  if(uDrip<.5&&p.x>-7.5&&p.x<7.6&&p.z<-1.5&&p.z>-10.5&&p.y<6.5)vAlpha=0.;
  gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
}`
const rainFragment = `
varying float vAlpha;
varying vec2 vUv;
uniform float uIntensity;
void main(){float edge=1.-abs(vUv.y-.5)*2.;gl_FragColor=vec4(.68,.8,.84,vAlpha*edge*uIntensity);}`

function RainVolume({ count, intensity, drip = false }: { count: number; intensity: number; drip?: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null!)
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1), data = new Float32Array(count * 4), rng = random(drip ? 8 : 174)
    for (let i = 0; i < data.length; i++) data[i] = rng()
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(data, 4))
    return g
  }, [count, drip])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uDrip: { value: drip ? 1 : 0 }, uIntensity: { value: intensity } }), [drip])
  useFrame(({ clock }) => {
    material.current.uniforms.uTime.value = clock.elapsedTime
    material.current.uniforms.uIntensity.value = intensity
  })
  return <instancedMesh args={[geometry, undefined, count]} frustumCulled={false} renderOrder={2}>
    <shaderMaterial ref={material} vertexShader={rainVertex} fragmentShader={rainFragment} uniforms={uniforms} transparent depthWrite={false} side={THREE.DoubleSide} />
  </instancedMesh>
}

function Ripples({ count, intensity }: { count: number; intensity: number }) {
  const material = useRef<THREE.ShaderMaterial>(null!)
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1), data = new Float32Array(count * 4), rng = random(43)
    for (let i = 0; i < count; i++) {
      data[i * 4] = rng() * 56 - 28
      data[i * 4 + 1] = rng() * 33 + 3.1
      data[i * 4 + 2] = rng(); data[i * 4 + 3] = rng()
    }
    g.setAttribute('aData', new THREE.InstancedBufferAttribute(data, 4)); return g
  }, [count])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uIntensity: { value: 1 } }), [])
  useFrame(({ clock }) => { material.current.uniforms.uTime.value = clock.elapsedTime; material.current.uniforms.uIntensity.value = intensity })
  return <instancedMesh args={[geometry, undefined, count]} frustumCulled={false}>
    <shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false}
      vertexShader={`attribute vec4 aData;uniform float uTime;varying vec2 vUv;varying float vAge;varying float vSeed;
      void main(){vUv=uv;vAge=fract(uTime*(.6+aData.w*.4)+aData.z);vSeed=aData.w;
      float size=.4+aData.w*.7;vec3 p=vec3(aData.x+position.x*size,.028,aData.y+position.y*size);
      gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`}
      fragmentShader={`varying vec2 vUv;varying float vAge;varying float vSeed;uniform float uIntensity;
      void main(){float d=length(vUv-.5);float ring=exp(-pow((d-vAge*.45)*105.,2.));
      float second=exp(-pow((d-vAge*.32)*110.,2.))*.4;
      float splash=exp(-d*80.)*max(0.,1.-vAge*9.);
      float a=(ring+second)*pow(1.-vAge,2.)*.22+splash*.55;
      gl_FragColor=vec4(mix(vec3(.35,.51,.58),vec3(.79,.74,.54),vSeed),a*uIntensity);}`}
    />
  </instancedMesh>
}

function GlassStreaks() {
  const ref = useRef<THREE.ShaderMaterial>(null!)
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])
  useFrame(({ clock }) => { ref.current.uniforms.uTime.value = clock.elapsedTime })
  return <mesh position={[-2.8, 1.8, -1.916]}>
    <planeGeometry args={[8.5, 2.8]} />
    <shaderMaterial ref={ref} transparent depthWrite={false} uniforms={uniforms}
      vertexShader="varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
      fragmentShader={`varying vec2 vUv;uniform float uTime;void main(){
      float x=vUv.x*143.;float line=pow(max(0.,sin(x+sin(vUv.y*12.)*.2)),80.);
      float flow=pow(max(0.,sin(vUv.y*13.+uTime*.35+floor(x)*1.7)),12.);
      gl_FragColor=vec4(.65,.79,.79,line*flow*.13);}`}
    />
  </mesh>
}

function SplashParticles({ count, intensity }: { count: number; intensity: number }) {
  const material = useRef<THREE.ShaderMaterial>(null!)
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(.009, .05), seeds = new Float32Array(count * 4), rng = random(29)
    for (let i = 0; i < count; i++) {
      const cluster = Math.floor(i / 5)
      // Share the same ground impact position for each five-particle crown.
      const base = random(cluster + 480)
      seeds.set([base() * 45 - 22.5, base() * 27 + 3.3, base(), rng()], i * 4)
    }
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4)); return g
  }, [count])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uIntensity: { value: intensity } }), [])
  useFrame(({ clock }) => { material.current.uniforms.uTime.value = clock.elapsedTime; material.current.uniforms.uIntensity.value = intensity })
  return <instancedMesh args={[geometry, undefined, count]} frustumCulled={false}>
    <shaderMaterial ref={material} transparent depthWrite={false} side={THREE.DoubleSide} uniforms={uniforms}
      vertexShader={`attribute vec4 aSeed;uniform float uTime;varying float vAge;void main(){
      vAge=fract(uTime*1.45+aSeed.z);float angle=aSeed.w*6.2831;
      vec3 p=vec3(aSeed.x+cos(angle)*vAge*.32,.035+sin(vAge*3.14159)*.17,aSeed.y+sin(angle)*vAge*.32);
      p+=position;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`}
      fragmentShader={`varying float vAge;uniform float uIntensity;void main(){gl_FragColor=vec4(.55,.7,.73,pow(1.-vAge,3.)*.45*uIntensity);}`}
    />
  </instancedMesh>
}

export function Weather({ quality, rain }: { quality: Quality; rain: number }) {
  const density = Math.max(0, rain / 100)
  return <group name="gpu-weather">
    <RainVolume count={Math.max(1, Math.round(QUALITY[quality].rain * density))} intensity={Math.min(1, density * 1.8)} />
    <RainVolume count={Math.max(1, Math.round(100 * density))} intensity={density} drip />
    <Ripples count={QUALITY[quality].ripples} intensity={density} />
    <SplashParticles count={QUALITY[quality].ripples * 5} intensity={density} />
    {rain > 0 && <GlassStreaks />}
  </group>
}
