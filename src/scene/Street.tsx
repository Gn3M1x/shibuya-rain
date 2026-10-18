import { useMemo } from 'react'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { QUALITY, type Quality } from '../config'
import { asphaltTextures, random } from './materials'
import { Batch, Box, type Part } from './Primitives'

function wetReflection(material: THREE.Material) {
  if (material.userData.wetReflection) return
  material.userData.wetReflection = true
  const compile = material.onBeforeCompile.bind(material)
  material.onBeforeCompile = (shader, renderer) => {
    compile(shader, renderer)
    // A thin water layer reflects independently of diffuse asphalt illumination.
    // Preserve Drei's real planar capture and roughness-dependent blur, then mix
    // it as the water film rather than multiply it into the dark diffuse base.
    shader.fragmentShader = shader.fragmentShader.replace(
      'diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);',
      `float wetFresnel = .2 + .8 * pow(1.0 - max(0.0, dot(normalize(vViewPosition), normal)), 3.0);
       float wetFilm = .07 + .27 * pow(1.0 - reflectorRoughnessFactor, 2.0);
       totalEmissiveRadiance += max(vec3(0.), newMerge.rgb) * wetFresnel * wetFilm * mixStrength;
       diffuseColor.rgb *= .65;`,
    )
  }
  material.customProgramCacheKey = () => 'shibuya-wet-film-v1'
  material.needsUpdate = true
}

function GroundGlow() {
  // Low-cost fallback and soft indirect light. It is deliberately subtle: the
  // actual planar reflection above remains the source of reflected architecture.
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .012, 10]}>
    <planeGeometry args={[35, 40]} />
    <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
      vertexShader={`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`}
      fragmentShader={`varying vec2 vUv;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        void main(){vec2 p=vUv;float n=hash(floor(p*vec2(270.,1900.)));float d=abs(p.x-.51);
        float glow=exp(-d*d*60.)*exp(-abs(p.y-.77)*7.);
        float strips=(.45+.55*sin(p.x*95.+sin(p.y*700.)*.5));
        float mask=glow*(.1+.5*n)*strips;gl_FragColor=vec4(vec3(.65,.57,.38)*mask,.13);}`}
    />
  </mesh>
}

export function Street({ quality }: { quality: Quality }) {
  const maps = useMemo(asphaltTextures, [])
  const { curbs, markings, grates, tiles } = useMemo(() => {
    const curbs: Part[] = [], markings: Part[] = [], grates: Part[] = [], tiles: Part[] = []
    const rng = random(61)
    for (let x = -32; x < 34; x += .78) {
      curbs.push({ p: [x, .115, 2.55], s: [.75, .23, .28], c: rng() > .5 ? '#626d69' : '#747d73' })
      tiles.push({ p: [x, .235, 1.96], s: [.75, .014, .32], c: '#8b845c' })
      for (let z = -.5; z < 2.5; z += .55) tiles.push({ p: [x, .226, z], s: [.75, .015, .52], c: rng() > .5 ? '#535f5b' : '#5e6961' })
      if (Math.abs(x % 4) < .8) for (let j = 0; j < 9; j++) grates.push({ p: [x - .32 + j * .075, .025, 2.9], s: [.025, .022, .35], c: '#101e22' })
    }
    // Worn crossing across the near road, with actual three-dimensional markings.
    for (let i = 0; i < 9; i++) markings.push({ p: [-14.0 + i * 1.43, .016, 12.3], s: [.75, .012, 5.8], c: '#9b9d8d', r: [0, -.12, 0] })
    for (let x = -36; x < 40; x += 7) markings.push({ p: [x, .018, 7.6], s: [3.6, .012, .105], c: '#b0a888' })
    markings.push({ p: [0, .018, 3.4], s: [70, .012, .09], c: '#a7aaa0' })
    return { curbs, markings, grates, tiles }
  }, [])
  return <group name="wet-street">
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[130, 130]} />
      {quality === 'low' ? <meshStandardMaterial color="#3b474c" map={maps.color} normalMap={maps.normal} normalScale={new THREE.Vector2(.6, .6)} roughnessMap={maps.roughness} roughness={.62} metalness={.35} /> :
        <MeshReflectorMaterial key={quality} onUpdate={wetReflection} resolution={QUALITY[quality].reflection} blur={[quality === 'high' ? 240 : 180, 70]} mixBlur={1.2} mixStrength={2.7} mirror={.65}
          color="#8d999e" map={maps.color} normalMap={maps.normal} normalScale={new THREE.Vector2(.3, .5)} roughnessMap={maps.roughness} roughness={.95} metalness={.15}
          depthScale={0} mixContrast={1.05} reflectorOffset={.005} />}
    </mesh>
    <GroundGlow />
    <Box p={[0, .105, .2]} s={[90, .21, 4.5]} c="#3c4a49" roughness={.58} receiveShadow />
    <Batch parts={tiles} roughness={.48} /><Batch parts={curbs} roughness={.65} /><Batch parts={markings} roughness={.5} /><Batch parts={grates} metalness={.65} />
    {/* A manhole with concentric iron rims and a recessed center. */}
    <group position={[6.4, .024, 8.8]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh><circleGeometry args={[.7, 48]} /><meshStandardMaterial color="#293c40" roughness={.38} metalness={.7} /></mesh>
      {[.3, .48, .65].map(r => <mesh key={r} position={[0, 0, .002]}><ringGeometry args={[r, r + .015, 48]} /><meshStandardMaterial color="#687572" roughness={.5} metalness={.7} /></mesh>)}
    </group>
  </group>
}
