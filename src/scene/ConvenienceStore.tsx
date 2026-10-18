import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Batch, Box, Pipe, Sign, type Part } from './Primitives'
import { concreteTexture, posterTexture, random, sevenTexture, signTexture, vendingTexture } from './materials'

function Shelves() {
  const { fixtures, products, labels } = useMemo(() => {
    const fixtures: Part[] = [], products: Part[] = [], labels: Part[] = []
    const rng = random(73), colors = ['#e4d7b8', '#b7c1a1', '#c75a3d', '#bc993d', '#698c92', '#ead3b9', '#627d57', '#dfc253']
    for (const x of [-4.6, -.8, 3.3]) {
      fixtures.push({ p: [x, 1.1, -6.5], s: [2.5, 1.7, .12], c: '#b4b4a4' })
      for (let row = 0; row < 4; row++) {
        const y = .48 + row * .48
        fixtures.push({ p: [x, y, -6.0], s: [2.65, .055, 1.18], c: '#d8d5bb' })
        labels.push({ p: [x, y - .015, -5.38], s: [2.6, .07, .025], c: '#efe9cf' })
        for (let n = 0; n < 13; n++) {
          const h = .18 + rng() * .19
          products.push({ p: [x - 1.15 + n * .19, y + h / 2 + .03, -5.72], s: [.12 + rng() * .04, h, .2], c: colors[Math.floor(rng() * colors.length)] })
          products.push({ p: [x - 1.15 + n * .19, y + h / 2 + .03, -6.05], s: [.14, h, .2], c: colors[Math.floor(rng() * colors.length)] })
          labels.push({ p: [x - 1.15 + n * .19, y + h * .53, -5.61], s: [.1, .04, .006], c: '#eee7cf' })
        }
      }
    }
    for (let i = 0; i < 5; i++) {
      const x = -5.35 + i * 2.45
      fixtures.push({ p: [x, 1.5, -9.65], s: [2.2, 2.5, .8], c: '#9dadaa' })
      fixtures.push({ p: [x, 1.53, -9.21], s: [1.99, 2.15, .04], c: '#455d61' })
      labels.push({ p: [x, 2.69, -9.15], s: [2.08, .07, .03], c: '#e0f3dd' })
      for (let row = 0; row < 5; row++) {
        fixtures.push({ p: [x, .6 + row * .4, -9.1], s: [2, .035, .18], c: '#b8c9c3' })
        for (let j = 0; j < 9; j++) products.push({ p: [x - .87 + j * .21, .75 + row * .4, -9.13], s: [.12, .24, .14], c: colors[(row + j) % colors.length] })
      }
    }
    return { fixtures, products, labels }
  }, [])
  return <><Batch parts={fixtures} roughness={.5} /><Batch parts={products} roughness={.55} /><Batch parts={labels} /></>
}

function SlidingDoors() {
  const left = useRef<THREE.Group>(null!), right = useRef<THREE.Group>(null!)
  const amount = useRef(0)
  useFrame(({ camera }, dt) => {
    const near = Math.hypot(camera.position.x - 2.2, camera.position.z + 1.8) < 4.8
    amount.current = THREE.MathUtils.damp(amount.current, near ? 1 : 0, 4, dt)
    left.current.position.x = -amount.current * 1.06
    right.current.position.x = amount.current * 1.06
  })
  return <group position={[2.25, 0, -1.98]}>
    {[-1, 1].map((side, i) => <group key={side} ref={i === 0 ? left : right}>
      <mesh position={[side * .57, 1.62, 0]}>
        <boxGeometry args={[1.12, 2.72, .025]} />
        <meshPhysicalMaterial color="#abc8c6" transparent opacity={.12} roughness={.17} metalness={.2} depthWrite={false} />
      </mesh>
      <Box p={[side * .57, 2.99, 0]} s={[1.16, .06, .08]} c="#727d79" metalness={.8} />
      <Box p={[side * .57, .27, 0]} s={[1.16, .06, .08]} c="#727d79" metalness={.8} />
      <Box p={[side * .03, 1.62, .01]} s={[.055, 2.76, .07]} c="#727d79" metalness={.8} />
      <Box p={[side * .57, 1.13, .025]} s={[1.11, .06, .018]} c="#008657" />
      <Box p={[side * .11, 1.53, .07]} s={[.035, .35, .045]} c="#b6c3be" metalness={.9} />
      <Sign p={[side * .57, 1.84, .03]} size={[.6, .17]} texture={signTexture('自動ドア', '#d6d9bf', '#344b43')} brightness={.75} />
    </group>)}
    <Box p={[0, 3.08, 0]} s={[2.5, .14, .25]} c="#485354" />
  </group>
}

export function ConvenienceStore() {
  const tile = useMemo(concreteTexture, [])
  const frames = useMemo(() => {
    const out: Part[] = []
    for (const x of [-7.12, -4.85, -2.58, -.28, 1.04, 3.46, 5.25, 7.12]) out.push({ p: [x, 1.78, -2], s: [.065, 3.12, .13], c: '#64716c' })
    for (const y of [.28, 1.15, 3.25]) out.push({ p: [0, y, -2], s: [14.3, .065, .13], c: '#6b7771' })
    for (const z of [-3.7, -5.6, -7.5, -9.6]) out.push({ p: [7.15, 1.78, z], s: [.12, 3.12, .065], c: '#59645f' })
    for (const y of [.28, 1.15, 3.25]) out.push({ p: [7.15, y, -6.1], s: [.13, .065, 8.1], c: '#6b7771' })
    return out
  }, [])
  return <group name="7-eleven-store">
    <Box p={[0, .16, -6.1]} s={[14.6, .3, 8.2]} c="#8b8a75" roughness={.4} receiveShadow />
    <Box p={[0, 1.9, -10.2]} s={[14.6, 3.7, .22]} c="#c6c4a5" />
    <Box p={[-7.3, 2.2, -6.1]} s={[.25, 4.4, 8.5]} c="#797b6c" />
    <Box p={[0, 3.38, -6.1]} s={[14.6, .22, 8.5]} c="#b7b5a0" />
    <Box p={[0, 4.57, -6.1]} s={[14.9, .2, 8.7]} c="#333e3c" metalness={.3} />
    <mesh position={[0, 5.53, -6.3]}><boxGeometry args={[14.6, 1.75, 8.1]} /><meshStandardMaterial map={tile} color="#7c8278" roughness={.9} /></mesh>
    <Box p={[0, 6.5, -6.3]} s={[14.9, .2, 8.35]} c="#3b4949" />
    <Box p={[0, 3.99, -1.94]} s={[14.6, 1.03, .42]} c="#f1ecd8" glow="#ffe7b0" intensity={.65} />
    <Box p={[7.25, 3.99, -6.1]} s={[.34, 1.03, 8.32]} c="#eee7d6" glow="#f5e5bb" intensity={.6} />
    {[{ y: 3.63, c: '#00835b', h: .18 }, { y: 3.82, c: '#e43c22', h: .09 }, { y: 3.96, c: '#eb7426', h: .15 }].map(b => <group key={b.c}>
      <Box p={[0, b.y, -1.7]} s={[14.6, b.h, .045]} c={b.c} glow={b.c} intensity={.6} />
      <Box p={[7.44, b.y, -6.1]} s={[.045, b.h, 8.4]} c={b.c} glow={b.c} intensity={.6} />
    </group>)}
    <Sign p={[-3.55, 4.18, -1.65]} size={[1.15, 1.15]} texture={sevenTexture()} brightness={1.5} />
    <Sign p={[.95, 4.25, -1.68]} size={[4.3, .43]} texture={signTexture('7-ELEVEN', '#f6f0d9', '#00764c')} brightness={1.4} />
    <Sign p={[7.47, 4.18, -4.2]} size={[1.05, 1.05]} rotation={[0, Math.PI / 2, 0]} texture={sevenTexture()} brightness={1.4} />
    <Box p={[0, 3.45, -1.43]} s={[15.1, .16, 1.65]} c="#a8b1a6" metalness={.5} roughness={.38} />
    <Box p={[0, 3.35, -1.13]} s={[14.1, .045, .12]} c="#fff8d3" glow="#fff2c2" intensity={3} />
    <Batch parts={frames} roughness={.25} metalness={.8} />
    {[-5.96, -3.7, -1.43, 4.4, 6.18].map(x => <mesh key={x} position={[x, 1.76, -2.03]}>
      <planeGeometry args={[2.17, 2.93]} /><meshPhysicalMaterial color="#a1c7c1" transparent opacity={.095} roughness={.16} metalness={.25} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>)}
    <mesh position={[7.16, 1.77, -6.1]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[8, 2.92]} /><meshPhysicalMaterial color="#a4c5c0" transparent opacity={.12} roughness={.18} metalness={.2} depthWrite={false} side={THREE.DoubleSide} /></mesh>
    <SlidingDoors />
    <Shelves />
    {[-5, -.5, 4.3].map(x => <group key={x}>
      <Box p={[x, 3.2, -6.25]} s={[.18, .055, 5.65]} c="#fffce8" glow="#fff2c9" intensity={4.4} />
      <Box p={[x + .27, 3.2, -6.25]} s={[.18, .055, 5.65]} c="#fffce8" glow="#fff2c9" intensity={4.4} />
    </group>)}
    <Box p={[-4.8, .82, -3.3]} s={[3.25, 1.14, .9]} c="#ddd4ac" />
    <Box p={[-4.8, 1.42, -3.25]} s={[3.5, .1, 1.15]} c="#9ca49a" roughness={.3} />
    <Box p={[-4.1, 1.7, -3.5]} s={[.58, .43, .12]} c="#192a2a" rotation={[-.2, 0, 0]} />
    <Box p={[-4.1, 1.73, -3.42]} s={[.49, .31, .012]} c="#a9d6c1" glow="#9bd7bd" intensity={.8} rotation={[-.2, 0, 0]} />
    <Sign p={[-6, 2.23, -1.95]} size={[1.05, 1.4]} texture={posterTexture()} brightness={.85} />
    <Sign p={[-1.6, 2.65, -9.97]} size={[5.5, .5]} texture={signTexture('毎日の、おいしいを。', '#e7e4d0', '#316649')} brightness={1} />
    <rectAreaLight position={[0, 3.1, -4.2]} rotation={[-Math.PI / 2, 0, 0]} width={12} height={5} color="#fff1db" intensity={3.2} />
    <rectAreaLight position={[0, 2.5, -1.6]} width={13} height={2.4} color="#fff1d5" intensity={4} />
    <pointLight position={[-4, 2.7, -5]} color="#fff0cf" intensity={20} distance={13} decay={2} />
    <pointLight position={[4, 2.8, -5.5]} color="#fff4df" intensity={18} distance={12} decay={2} />
    {/* Elevated utility equipment and downpipes break the clean roof silhouette. */}
    {[-4.6, 1.6].map(x => <group key={x}>
      <Box p={[x, 6.9, -7.2]} s={[2.4, .75, 1.2]} c="#63716d" />
      {Array.from({ length: 9 }, (_, i) => <Box key={i} p={[x - 1 + i * .25, 6.92, -6.57]} s={[.07, .56, .03]} c="#283b3c" />)}
    </group>)}
    <Pipe a={[7.55, 6.4, -9.5]} b={[7.55, .3, -9.5]} radius={.075} color="#77817a" />
    <group position={[-5.0, .25, .05]} rotation={[0, .1, 0]}>
      <Box p={[0, 1.15, 0]} s={[1.1, 2.25, .8]} c="#c8cebf" roughness={.3} />
      <Sign p={[0, 1.18, .411]} size={[1.01, 2.1]} texture={vendingTexture()} brightness={1.15} />
    </group>
    {[-7, -6.35].map(x => <group key={x}>
      <Box p={[x, .71, -.45]} s={[.5, .88, .6]} c="#a3aba0" metalness={.3} />
      <Box p={[x, 1.18, -.45]} s={[.53, .12, .64]} c="#657b75" />
      <Box p={[x, 1.17, -.115]} s={[.25, .07, .01]} c="#1b282a" />
    </group>)}
    <group position={[5.0, .26, .2]} rotation={[0, -.12, 0]}>
      <Box p={[0, .76, 0]} s={[.86, 1.35, .08]} c="#253733" />
      <Sign p={[0, .78, .05]} size={[.72, 1.15]} texture={posterTexture()} brightness={.8} />
      <Pipe a={[-.4, 0, .25]} b={[-.4, 1.4, 0]} /><Pipe a={[.4, 0, .25]} b={[.4, 1.4, 0]} />
    </group>
  </group>
}
