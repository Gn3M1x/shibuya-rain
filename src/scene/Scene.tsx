import { memo, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { QUALITY, type Quality, type TimeOfDay } from '../config'
import { ConvenienceStore } from './ConvenienceStore'
import { Neighborhood } from './Neighborhood'
import { Street } from './Street'
import { Weather } from './Weather'
import { CameraRig } from './CameraRig'

function PerformanceWatch({ onReady, onPerformance, onAdapt, quality }: {
  onReady: () => void; onPerformance: (fps: number) => void; onAdapt: () => void; quality: Quality
}) {
  const samples = useRef({ time: 0, frames: 0, warmup: 0, slow: 0, ready: false })
  const { gl } = useThree()
  useEffect(() => { samples.current.warmup = 0; samples.current.slow = 0 }, [quality])
  useFrame((_, delta) => {
    const s = samples.current
    if (!s.ready) { s.ready = true; onReady() }
    // Background tabs and resuming from sleep must never trigger quality changes.
    if (document.hidden || delta > .25) return
    s.warmup += delta; s.time += delta; s.frames++
    if (s.time > 2) {
      const fps = Math.round(s.frames / s.time)
      onPerformance(fps)
      if (s.warmup > 12 && fps < 25) s.slow++; else s.slow = 0
      if (s.slow >= 3) { onAdapt(); s.slow = 0; s.warmup = 0 }
      gl.domElement.dataset.drawCalls = String(gl.info.render.calls)
      gl.domElement.dataset.triangles = String(gl.info.render.triangles)
      gl.domElement.dataset.fps = String(fps)
      s.time = 0; s.frames = 0
    }
  })
  return null
}

export const Scene = memo(function Scene({ quality, rain, time, cinematic, reset, onReady, onPerformance, onAdapt, onManual }: {
  quality: Quality; rain: number; time: TimeOfDay; cinematic: boolean; reset: number;
  onReady: () => void; onPerformance: (fps: number) => void; onAdapt: () => void; onManual: () => void
}) {
  const dusk = time === 'dusk'
  const { gl, scene } = useThree()
  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = dusk ? 1.05 : 1.12
    gl.outputColorSpace = THREE.SRGBColorSpace
    scene.background = new THREE.Color(dusk ? '#424958' : '#14242e')
    scene.fog = new THREE.FogExp2(dusk ? '#58616c' : '#203541', dusk ? .014 : .018)
    return () => { scene.fog = null }
  }, [time, dusk, gl, scene])
  return <>
    <hemisphereLight color={dusk ? '#a9b4cf' : '#86a3bd'} groundColor="#23363a" intensity={dusk ? 1.7 : .8} />
    <ambientLight color="#80979f" intensity={.22} />
    <directionalLight position={[-16, 28, 12]} color={dusk ? '#dbc5b2' : '#8faabc'} intensity={dusk ? 1.2 : .65} castShadow={QUALITY[quality].shadows}
      shadow-mapSize={[1024, 1024]} shadow-camera-left={-26} shadow-camera-right={26} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-bias={-.001} />
    <ConvenienceStore />
    <Neighborhood />
    <Street quality={quality} />
    <Weather quality={quality} rain={rain} />
    <CameraRig cinematic={cinematic} reset={reset} onManual={onManual} />
    <PerformanceWatch onReady={onReady} onPerformance={onPerformance} onAdapt={onAdapt} quality={quality} />
    {QUALITY[quality].bloom && <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={1.15} luminanceSmoothing={.35} intensity={.48} mipmapBlur />
      <Noise opacity={.022} />
      <Vignette eskil={false} offset={.26} darkness={.57} />
    </EffectComposer>}
  </>
})
