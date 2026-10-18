import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import { cameraBlocked, INITIAL_CAMERA, INITIAL_TARGET } from '../config'

function pathClear(from: THREE.Vector3, to: THREE.Vector3) {
  const steps = Math.max(1, Math.ceil(from.distanceTo(to) / .2))
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    if (cameraBlocked(THREE.MathUtils.lerp(from.x, to.x, t), THREE.MathUtils.lerp(from.z, to.z, t))) return false
  }
  return true
}

export function CameraRig({ cinematic, reset, onManual }: { cinematic: boolean; reset: number; onManual: () => void }) {
  const controls = useRef<OrbitControlsImpl>(null!)
  const { camera, gl } = useThree()
  const keys = useRef(new Set<string>()), velocity = useRef(new THREE.Vector3())
  const last = useRef(new THREE.Vector3(...INITIAL_CAMERA)), clock = useRef(0)
  const scratch = useRef({ forward: new THREE.Vector3(), right: new THREE.Vector3(), desired: new THREE.Vector3(), next: new THREE.Vector3(), shift: new THREE.Vector3() })
  const resetMotion = useRef(false)
  useEffect(() => {
    resetMotion.current = true; velocity.current.set(0, 0, 0); keys.current.clear()
    if (controls.current) {
      const ctrl = controls.current
      // Consume residual orbit/zoom deltas before restoring the saved frame.
      // Otherwise the camera continues drifting immediately after a reset.
      ctrl.enableDamping = false; ctrl.update()
      ctrl.target.set(...INITIAL_TARGET); camera.position.set(...INITIAL_CAMERA); ctrl.update()
      ctrl.enableDamping = true; last.current.copy(camera.position); resetMotion.current = false
    }
    clock.current = 0
  }, [reset, camera])
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches('input,select,textarea')) return
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        keys.current.add(e.code); onManual(); e.preventDefault()
      }
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    const blur = () => { keys.current.clear(); velocity.current.set(0, 0, 0) }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur)
    const wheel = () => onManual()
    gl.domElement.addEventListener('wheel', wheel, { passive: true })
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); gl.domElement.removeEventListener('wheel', wheel) }
  }, [onManual, gl])
  useFrame((_, frameDelta) => {
    const dt = Math.min(frameDelta, .05), ctrl = controls.current
    if (!ctrl) return
    const s = scratch.current
    if (cinematic) {
      clock.current += dt
      const angle = .56 + Math.sin(clock.current * .055) * .15
      const radius = 30.4 + Math.sin(clock.current * .043) * 1.2
      s.next.set(INITIAL_TARGET[0] + Math.sin(angle) * radius, 1.7 + Math.sin(clock.current * .07) * .15, INITIAL_TARGET[2] + Math.cos(angle) * radius)
      camera.position.lerp(s.next, 1 - Math.exp(-dt * 1.3))
      ctrl.target.lerp(new THREE.Vector3(...INITIAL_TARGET), 1 - Math.exp(-dt * 1.3)); ctrl.update()
    } else {
      s.forward.copy(ctrl.target).sub(camera.position).setY(0).normalize()
      s.right.crossVectors(s.forward, camera.up).normalize(); s.desired.set(0, 0, 0)
      if (keys.current.has('KeyW') || keys.current.has('ArrowUp')) s.desired.add(s.forward)
      if (keys.current.has('KeyS') || keys.current.has('ArrowDown')) s.desired.sub(s.forward)
      if (keys.current.has('KeyD') || keys.current.has('ArrowRight')) s.desired.add(s.right)
      if (keys.current.has('KeyA') || keys.current.has('ArrowLeft')) s.desired.sub(s.right)
      if (s.desired.lengthSq() > 0) s.desired.normalize().multiplyScalar(2.5)
      velocity.current.lerp(s.desired, 1 - Math.exp(-dt * 7))
      s.shift.copy(velocity.current).multiplyScalar(dt)
      s.next.copy(camera.position).add(s.shift)
      s.next.x = THREE.MathUtils.clamp(s.next.x, -28, 32); s.next.z = THREE.MathUtils.clamp(s.next.z, -8, 38)
      s.next.y = THREE.MathUtils.clamp(s.next.y, 1.35, 13)
      if (pathClear(last.current, s.next)) {
        s.shift.copy(s.next).sub(camera.position); ctrl.target.add(s.shift); camera.position.copy(s.next)
      } else {
        s.shift.copy(last.current).sub(camera.position); ctrl.target.add(s.shift); camera.position.copy(last.current); velocity.current.set(0, 0, 0)
      }
    }
    if (!resetMotion.current) last.current.copy(camera.position)
    // A compact, read-only diagnostic surface for local browser verification.
    gl.domElement.dataset.camera = camera.position.toArray().map(v => v.toFixed(2)).join(',')
  })
  return <OrbitControls ref={controls} target={INITIAL_TARGET} enableDamping dampingFactor={.055} rotateSpeed={.38} zoomSpeed={.6} enablePan={false}
    minDistance={5.5} maxDistance={43} minPolarAngle={.48} maxPolarAngle={Math.PI * .53}
    minAzimuthAngle={-.95} maxAzimuthAngle={1.4} enabled={!cinematic} onStart={onManual} makeDefault />
}
