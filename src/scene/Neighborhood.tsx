import { useMemo } from 'react'
import * as THREE from 'three'
import { Batch, Box, Pipe, Sign, type Part, type V3 } from './Primitives'
import { concreteTexture, random, sevenTexture, signTexture } from './materials'

const blocks: { x: number; z: number; w: number; d: number; h: number; c: string }[] = [
  { x: -13.6, z: -7, w: 9.8, d: 15, h: 19, c: '#737c7b' },
  { x: 13.8, z: -14.5, w: 8.5, d: 18, h: 23, c: '#647675' },
  { x: 1.3, z: -24, w: 12.3, d: 18, h: 27, c: '#6c7979' },
  { x: -25, z: -17, w: 10, d: 21, h: 29, c: '#566b70' },
  { x: 25, z: -23, w: 10, d: 25, h: 32, c: '#6b787a' },
  { x: -14, z: -34, w: 9, d: 15, h: 33, c: '#586970' },
  { x: 13, z: -40, w: 8, d: 12, h: 37, c: '#566a73' },
  { x: -3, z: -46, w: 14, d: 14, h: 38, c: '#5a6d78' },
  { x: -36, z: -30, w: 10, d: 15, h: 37, c: '#546670' },
]

function Buildings() {
  const map = useMemo(concreteTexture, [])
  const { trim, dark, lit } = useMemo(() => {
    const rng = random(99), trim: Part[] = [], dark: Part[] = [], lit: Part[] = []
    blocks.forEach((b, n) => {
      const front = b.z + b.d / 2 + .04
      for (let y = 3.8; y < b.h - 1; y += 3.1) {
        trim.push({ p: [b.x, y - 1.4, front], s: [b.w + .06, .07, .14], c: '#465859' })
        for (let x = b.x - b.w / 2 + 1.1; x < b.x + b.w / 2 - .5; x += 1.9) {
          const isLit = rng() > .72
          const parts = isLit ? lit : dark
          parts.push({ p: [x, y, front + .04], s: [1.08, 1.55, .035], c: isLit ? (rng() > .5 ? '#a4bcb6' : '#d7bb84') : '#14292f' })
          trim.push({ p: [x, y, front + .075], s: [.045, 1.59, .045], c: '#526261' })
          if (isLit && rng() > .5) trim.push({ p: [x, y + .3, front + .08], s: [1.07, .06, .03], c: '#647366' })
        }
      }
      if (n < 3) for (let y = 4; y < b.h - 2; y += 6.2) {
        const x = b.x + b.w / 2 + .06
        for (const z of [b.z + 3, b.z - 2]) {
          dark.push({ p: [x, y, z], s: [.04, 1.4, 1.15], c: '#14292c' })
          trim.push({ p: [x + .3, y - 1.3, z], s: [.64, .62, 1.0], c: '#7c8a81' })
          for (let i = 0; i < 6; i++) trim.push({ p: [x + .63, y - 1.5 + i * .075, z], s: [.035, .023, .82], c: '#384b4c' })
        }
      }
    })
    return { trim, dark, lit }
  }, [])
  return <>
    {blocks.map((b, i) => <group key={i}>
      <mesh position={[b.x, b.h / 2, b.z]} castShadow receiveShadow><boxGeometry args={[b.w, b.h, b.d]} /><meshStandardMaterial color={b.c} map={map} roughness={.92} /></mesh>
      <Box p={[b.x, b.h + .15, b.z]} s={[b.w + .25, .3, b.d + .2]} c="#293c41" />
      {i < 3 && <Pipe a={[b.x + b.w / 2 - .25, .4, b.z + b.d / 2 + .12]} b={[b.x + b.w / 2 - .25, b.h, b.z + b.d / 2 + .12]} radius={.075} color="#78877f" />}
    </group>)}
    <Batch parts={trim} /><Batch parts={dark} roughness={.3} metalness={.25} /><Batch parts={lit} emissive />
    <Sign p={[-10.2, 8, .6]} size={[.9, 5.0]} texture={signTexture('居酒屋', '#74352b', '#e1c49a', true)} brightness={.8} />
    <Sign p={[-14.2, 3.0, .6]} size={[7.3, .85]} texture={signTexture('炭火焼 とりよし', '#29342f', '#cabfa0')} brightness={.75} />
    <Sign p={[-12, 12.8, .6]} size={[2.1, .8]} texture={signTexture('喫茶 雨音', '#425958', '#b5c8bf')} brightness={.8} />
    <Sign p={[9.4, 12.5, -5.35]} size={[1.05, 5.7]} texture={signTexture('カラオケ', '#472f38', '#c87f92', true)} brightness={1.2} />
    <Sign p={[14, 5.0, -5.35]} size={[7.2, 1.1]} texture={signTexture('渋谷 らーめん', '#292d2c', '#d2c4a4')} brightness={.8} />
    <Sign p={[14.7, 17.5, -5.35]} size={[3.7, 1.6]} texture={signTexture('HOTEL 24', '#2a373b', '#93afb0')} brightness={.9} />
    <Sign p={[-25.7, 11, -6.44]} size={[1.6, 6.2]} texture={signTexture('渋谷薬局', '#294c45', '#b3c5ad', true)} brightness={.8} />
    <Sign p={[1.5, 18, -14.94]} size={[7, 1.6]} texture={signTexture('TOKYO  •  東京', '#334b54', '#a9c3c1')} brightness={.65} />
    {/* Roller shutter and a few street-level shop details. */}
    <Box p={[-14, 1.45, .55]} s={[6.8, 2.8, .08]} c="#394e4f" metalness={.3} />
    <Batch parts={Array.from({ length: 25 }, (_, i) => ({ p: [-14, .15 + i * .105, .62], s: [6.8, .025, .03], c: '#53635f' }))} />
  </>
}

function Bicycle({ position, rotation = 0, color = '#657c73' }: { position: V3; rotation?: number; color?: string }) {
  const frame: [V3, V3][] = [
    [[-.65, .52, 0], [-.14, .59, 0]], [[-.14, .59, 0], [-.42, 1.13, 0]], [[-.42, 1.13, 0], [-.65, .52, 0]],
    [[-.42, 1.13, 0], [.38, 1.14, 0]], [[.38, 1.14, 0], [-.14, .59, 0]], [[.38, 1.14, 0], [.72, .52, 0]],
    [[.38, 1.14, 0], [.34, 1.4, 0]], [[.34, 1.4, 0], [.54, 1.45, 0]], [[-.42, 1.13, 0], [-.46, 1.36, 0]],
  ]
  return <group position={position} rotation={[0, rotation, .035]}>
    {[-.65, .72].map(x => <group key={x} position={[x, .53, 0]}>
      <mesh><torusGeometry args={[.46, .035, 7, 30]} /><meshStandardMaterial color="#17282a" roughness={.6} /></mesh>
      <mesh><torusGeometry args={[.415, .013, 5, 30]} /><meshStandardMaterial color="#9baaa0" metalness={.8} roughness={.3} /></mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = i * Math.PI / 5
        return <Pipe key={i} a={[0, 0, 0]} b={[Math.cos(a) * .41, Math.sin(a) * .41, 0]} radius={.004} color="#a2aca2" />
      })}
    </group>)}
    {frame.map(([a, b], i) => <Pipe key={i} a={a} b={b} color={color} radius={.024} />)}
    <Box p={[-.46, 1.37, 0]} s={[.3, .06, .18]} c="#1b2828" />
    <Box p={[.69, 1.26, 0]} s={[.39, .28, .36]} c="#59645d" roughness={.6} />
    <Pipe a={[-.14, .59, -.14]} b={[-.14, .59, .14]} radius={.025} />
    <Pipe a={[-.3, .6, .14]} b={[-.05, .6, .14]} radius={.026} color="#1b2828" />
  </group>
}

function Utilities() {
  const wires = useMemo(() => {
    const out = []
    for (let i = 0; i < 6; i++) {
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-17, 11.7 + i * .13, 3 + i * .14), new THREE.Vector3(-3, 9.2 + i * .12, -2 + i * .14), new THREE.Vector3(12, 11.5 + i * .13, -10 + i * .14), new THREE.Vector3(29, 10.8 + i * .13, -24 + i * .14)])
      out.push(new THREE.TubeGeometry(curve, 32, .015, 4, false))
    }
    return out
  }, [])
  return <>
    {wires.map((geometry, i) => <mesh key={i} geometry={geometry}><meshStandardMaterial color="#15252c" /></mesh>)}
    {[[-16.8, 2.8], [11.8, -10.2]].map(([x, z], i) => <group key={i} position={[x, 0, z]}>
      <Pipe a={[0, 0, 0]} b={[0, 12.2, 0]} radius={.13} color="#536668" />
      <Box p={[0, 10.8, 0]} s={[3, .12, .13]} c="#293e43" />
      <Box p={[.4, 8.9, 0]} s={[.65, 1.05, .65]} c="#596a68" />
      <Pipe a={[0, 8.6, 0]} b={[1.8, 8.6, 0]} radius={.04} />
      <Box p={[1.8, 8.5, 0]} s={[.65, .12, .35]} c="#c3d5c8" glow="#cce3d2" intensity={1.8} />
      <spotLight position={[1.8, 8.4, 0]} target-position={[x + 1.8, 0, z]} angle={.85} penumbra={1} intensity={50} distance={22} color="#adc6ca" />
    </group>)}
    <group position={[9.4, 0, 1.8]}>
      <Pipe a={[0, 0, 0]} b={[0, 5.6, 0]} radius={.048} color="#586765" />
      <mesh position={[0, 4.7, .03]}><circleGeometry args={[.47, 32]} /><meshStandardMaterial color="#b64c3e" /></mesh>
      <Box p={[0, 4.7, .06]} s={[.66, .12, .015]} c="#dbdfc9" />
      <Sign p={[0, 3.65, .06]} size={[.7, 1]} texture={signTexture('止まれ', '#344d58', '#d1d9c9', true)} brightness={.65} />
    </group>
    <group position={[-8.35, 0, 1.0]}>
      <Pipe a={[0, 0, 0]} b={[0, 6.9, 0]} radius={.055} />
      <Box p={[0, 5.9, 0]} s={[1.5, 1.65, .3]} c="#b5bdb0" />
      <Sign p={[0, 5.9, .16]} size={[1.38, 1.5]} texture={sevenTexture()} brightness={1.6} />
    </group>
    <Bicycle position={[8.15, .18, -.05]} rotation={-.6} />
    <Bicycle position={[-9.6, .17, 1.4]} rotation={.2} color="#a4a297" />
    {[-8.0, 7.9].map(x => <group key={x}><Pipe a={[x, .2, 1.7]} b={[x, 1.15, 1.7]} radius={.065} color="#657c75" /><Box p={[x, .99, 1.7]} s={[.16, .1, .16]} c="#c5bc8c" /></group>)}
  </>
}

export function Neighborhood() {
  return <group name="shibuya-neighborhood"><Buildings /><Utilities /></group>
}
