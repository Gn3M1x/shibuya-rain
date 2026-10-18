import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export type V3 = [number, number, number]
export type Part = { p: V3; s: V3; c?: string; r?: V3 }

export function Box({ p, s, c = '#505856', roughness = .75, metalness = 0, glow, intensity = 1, ...props }: {
  p: V3; s: V3; c?: string; roughness?: number; metalness?: number; glow?: string; intensity?: number;
  rotation?: V3; castShadow?: boolean; receiveShadow?: boolean
}) {
  return <mesh position={p} {...props}>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={roughness} metalness={metalness} emissive={glow} emissiveIntensity={intensity} />
  </mesh>
}

export function Batch({ parts, roughness = .7, metalness = 0, emissive = false }: { parts: Part[]; roughness?: number; metalness?: number; emissive?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useLayoutEffect(() => {
    parts.forEach((part, i) => {
      dummy.position.set(...part.p); dummy.scale.set(...part.s); dummy.rotation.set(...(part.r ?? [0, 0, 0])); dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix); ref.current.setColorAt(i, new THREE.Color(part.c ?? '#6d7673'))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [parts, dummy])
  return <instancedMesh ref={ref} args={[undefined, undefined, parts.length]} castShadow={!emissive} receiveShadow>
    <boxGeometry />
    {emissive ? <meshBasicMaterial toneMapped={false} /> : <meshStandardMaterial roughness={roughness} metalness={metalness} />}
  </instancedMesh>
}

export function Sign({ texture, p, size, rotation = [0, 0, 0], brightness = 1 }: { texture: THREE.Texture; p: V3; size: [number, number]; rotation?: V3; brightness?: number }) {
  return <mesh position={p} rotation={rotation}>
    <planeGeometry args={size} />
    <meshBasicMaterial map={texture} color={new THREE.Color().setScalar(brightness)} toneMapped={false} />
  </mesh>
}

export function Pipe({ a, b, radius = .035, color = '#333c3d' }: { a: V3; b: V3; radius?: number; color?: string }) {
  const { center, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b), direction = end.clone().sub(start)
    return { center: start.add(end).multiplyScalar(.5), quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()), length: direction.length() }
  }, [a, b])
  return <mesh position={center} quaternion={quaternion}><cylinderGeometry args={[radius, radius, length, 7]} /><meshStandardMaterial color={color} metalness={.6} roughness={.45} /></mesh>
}
