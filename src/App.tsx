import { Component, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { Aperture, ArrowUpRight, Camera, Check, ChevronDown, CloudRain, Crosshair, Droplets, Expand, EyeOff, Info, LoaderCircle, Mouse, Move, Pause, Play, RotateCcw, Settings2, Volume2, VolumeX, X } from 'lucide-react'
import { INITIAL_CAMERA, QUALITY, type Quality, type TimeOfDay } from './config'
import { Scene } from './scene/Scene'
import { RainAudio } from './audio'

class SceneBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  componentDidCatch(error: Error) { console.error('Scene initialization failed:', error) }
  render() {
    if (this.state.error) return <div className="scene-error"><CloudRain size={34} /><h2>The rain is taking a moment.</h2><p>WebGL could not initialize. Enable hardware acceleration in Chrome and reload.</p><button onClick={() => location.reload()}>Reload scene</button></div>
    return this.props.children
  }
}

export default function App() {
  const [quality, setQuality] = useState<Quality>(() => navigator.hardwareConcurrency <= 4 ? 'low' : 'medium')
  const [rain, setRain] = useState(70), [time, setTime] = useState<TimeOfDay>('night')
  const [cinematic, setCinematic] = useState(false), [reset, setReset] = useState(0)
  const [settings, setSettings] = useState(false), [photo, setPhoto] = useState(false), [help, setHelp] = useState(false)
  const [ready, setReady] = useState(false), [fps, setFps] = useState(0), [adapted, setAdapted] = useState(false)
  const [sound, setSound] = useState(false), [toast, setToast] = useState('')
  const root = useRef<HTMLDivElement>(null), audio = useRef(new RainAudio()), toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const notify = useCallback((message: string) => { clearTimeout(toastTimer.current); setToast(message); toastTimer.current = setTimeout(() => setToast(''), 3000) }, [])
  const onReady = useCallback(() => setReady(true), [])
  const onPerformance = useCallback((value: number) => setFps(value), [])
  const onManual = useCallback(() => setCinematic(false), [])
  const onAdapt = useCallback(() => {
    setQuality(q => { if (q !== 'low') { setAdapted(true); return q === 'high' ? 'medium' : 'low' } return q })
  }, [])
  const resetCamera = useCallback(() => { setCinematic(false); setReset(n => n + 1); notify('Returned to the first frame') }, [notify])
  const screenshot = useCallback(() => {
    const canvas = root.current?.querySelector('canvas')
    if (!canvas) return
    try {
      const link = document.createElement('a'); link.download = `shibuya-rain-${time}-${Date.now()}.png`; link.href = canvas.toDataURL('image/png'); link.click(); notify('Your moment, saved as PNG')
    } catch { notify('Unable to save. Please try again.') }
  }, [time, notify])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches('input,select,textarea')) return
      if (e.repeat) return
      if (e.code === 'KeyH') { setPhoto(v => !v); setSettings(false) }
      if (e.code === 'Escape') { setPhoto(false); setSettings(false); setHelp(false) }
      if (e.code === 'KeyC') setCinematic(v => !v)
      if (e.code === 'KeyR') resetCamera()
      if (e.code === 'KeyP') screenshot()
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key)
  }, [resetCamera, screenshot])
  useEffect(() => { audio.current.setIntensity(rain) }, [rain])
  useEffect(() => { const instance = audio.current; return () => { instance.dispose(); clearTimeout(toastTimer.current) } }, [])
  const toggleSound = async () => {
    try { if (sound) await audio.current.stop(); else await audio.current.start(rain); setSound(!sound) }
    catch { notify('Audio is unavailable in this browser') }
  }
  const toggleFullscreen = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await root.current?.requestFullscreen() }
    catch { notify('Use your browser’s full screen shortcut') }
  }
  return <main ref={root} className={`experience ${photo ? 'photo-mode' : ''}`} data-quality={quality} data-time={time} data-rain={rain} data-cinematic={cinematic}>
    <SceneBoundary>
      <Canvas camera={{ position: INITIAL_CAMERA, fov: 43, near: .1, far: 160 }} dpr={[1, QUALITY[quality].dpr]} shadows={QUALITY[quality].shadows}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: true }}
        fallback={<div className="scene-error">This experience requires WebGL 2. Please open it in Chrome with hardware acceleration enabled.</div>}>
        <Suspense fallback={null}><Scene quality={quality} rain={rain} time={time} cinematic={cinematic} reset={reset} onReady={onReady} onPerformance={onPerformance} onAdapt={onAdapt} onManual={onManual} /></Suspense>
      </Canvas>
    </SceneBoundary>
    <div className="film-edge" aria-hidden="true" />
    {!ready && <div className="loading"><Droplets size={28} /><span>Finding a quiet corner of Tokyo</span><LoaderCircle className="spin" size={16} /></div>}
    <div className="interface" inert={photo} aria-hidden={photo}>
      <header className="topbar">
        <a className="wordmark" href="#" onClick={e => { e.preventDefault(); resetCamera() }} aria-label="Shibuya Rain — reset view">
          <span className="brand-icon"><Droplets size={22} strokeWidth={1.25} /></span>
          <span><strong>SHIBUYA RAIN<span className="brand-dot">.</span></strong><small>AN INTERACTIVE ATMOSPHERE</small></span>
        </a>
        <div className="top-actions">
          <span className="weather"><span className="live-dot" /> TOKYO, JP <span className="weather-divider" /> <CloudRain size={16} strokeWidth={1.3} /> <span>{time === 'night' ? '00:30' : '18:40'}</span><span className="temperature"> 16°</span></span>
          <button className={`icon-button settings-trigger ${settings ? 'selected' : ''}`} title="Scene settings" aria-label="Scene settings" aria-expanded={settings} onClick={() => { setSettings(!settings); setHelp(false) }}><Settings2 size={19} strokeWidth={1.4} /></button>
        </div>
      </header>
      <div className="location-tag"><span className="thin-line" /><span>渋谷、雨の夜</span><small>35.6595° N · 139.7005° E</small></div>
      <section className="scene-caption" aria-label="Scene introduction">
        <div className="eyebrow"><span className="tiny-square" /> A MOMENT AFTER MIDNIGHT <span className="edition">/ 001</span></div>
        <h1>Shibuya <em>Rain.</em></h1>
        <p>The city slows. The light stays on.<br />Stay a little longer.</p>
        <div className="scene-meta"><span>東京、日本</span><i /><span>REAL-TIME 3D EXPERIENCE</span><ArrowUpRight size={12} /></div>
      </section>
      <aside className="frame-note" aria-hidden="true"><span>街の灯りと、雨の音。</span><small>A quiet corner.<br />An ordinary kind of beautiful.</small><span className="note-line" /></aside>
      <footer className="bottom-bar">
        <div className="navigation-hints"><span><Move size={14} /> Drag to look</span><span><Mouse size={14} /> Scroll to explore</span><span className="keyboard-hint"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to wander</span></div>
        <div className="toolbar">
          <button className={`cinematic-button ${cinematic ? 'active' : ''}`} onClick={() => setCinematic(v => !v)} aria-pressed={cinematic} title="Cinematic camera (C)">{cinematic ? <Pause size={13} fill="currentColor" /> : <Play size={13} />} <span>Cinematic</span><span className="shortcut">C</span></button>
          <span className="toolbar-divider" />
          <button className={`icon-button ${sound ? 'active' : ''}`} onClick={toggleSound} aria-label={sound ? 'Mute rain sound' : 'Enable rain sound'} title={sound ? 'Mute rain sound' : 'Enable rain sound'}>{sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
          <button className="icon-button" onClick={screenshot} aria-label="Save screenshot" title="Save screenshot (P)"><Camera size={18} /></button>
          <button className="icon-button" onClick={() => { setPhoto(true); setSettings(false); notify('Photography mode · Press H or Esc to return') }} aria-label="Photography mode" title="Hide interface (H)"><EyeOff size={18} /></button>
          <button className="icon-button desktop-action" onClick={toggleFullscreen} aria-label="Toggle fullscreen" title="Full screen"><Expand size={17} /></button>
          <button className={`icon-button help-trigger ${help ? 'selected' : ''}`} onClick={() => { setHelp(!help); setSettings(false) }} aria-label="Controls and about" aria-expanded={help}><Info size={17} /></button>
        </div>
      </footer>
      {settings && <section className="settings-panel" aria-label="Scene settings panel">
        <div className="panel-heading"><span><Aperture size={15} /> SET THE SCENE</span><button className="icon-button" aria-label="Close settings" onClick={() => setSettings(false)}><X size={16} /></button></div>
        <label className="setting-label" htmlFor="rain">Rain intensity <span>{rain}%</span></label>
        <input id="rain" aria-label="Rain intensity" type="range" min="0" max="100" step="1" value={rain} style={{ '--range-fill': `${rain}%` } as React.CSSProperties} onChange={e => setRain(Number(e.target.value))} />
        <div className="range-labels"><span>A passing shower</span><span>Downpour</span></div>
        <label className="setting-label" htmlFor="time">Time of day</label>
        <div className="select-wrap"><select id="time" value={time} onChange={e => setTime(e.target.value as TimeOfDay)}><option value="night">After midnight · 00:30</option><option value="dusk">Blue hour · 18:40</option></select><ChevronDown size={14} /></div>
        <div className="setting-label">Graphics quality <span className="fps">{fps || '—'} FPS</span></div>
        <div className="quality-switch" role="group" aria-label="Graphics quality">{(['low', 'medium', 'high'] as const).map(q => <button key={q} aria-pressed={quality === q} onClick={() => { setQuality(q); setAdapted(false) }}>{q[0].toUpperCase() + q.slice(1)}</button>)}</div>
        <p className="performance-note">{adapted ? 'Adjusted for smoother movement on this device.' : quality === 'low' ? 'Lightweight rain. Soft painted light reflections.' : quality === 'medium' ? 'Balanced rain, blurred reflections & subtle bloom.' : 'Dense rain, detailed reflections & soft shadows.'}</p>
        <div className="setting-row"><label htmlFor="cinematic">Cinematic camera</label><button id="cinematic" role="switch" aria-checked={cinematic} className="toggle" onClick={() => setCinematic(v => !v)}><span /></button></div>
        <button className="panel-action" onClick={resetCamera}><RotateCcw size={15} /> Reset camera <span>R</span></button>
        <button className="panel-action" onClick={screenshot}><Camera size={15} /> Save a photograph <span>P</span></button>
        <div className="panel-foot"><span className="live-dot" /> RENDERED LIVE. NEVER THE SAME RAIN.</div>
      </section>}
      {help && <section className="help-panel" aria-label="Controls and about panel"><div className="panel-heading"><span><Crosshair size={14} /> MAKE YOURSELF AT HOME</span><button className="icon-button" aria-label="Close controls" onClick={() => setHelp(false)}><X size={16} /></button></div><p>A small, imagined corner of Shibuya. Everything you see lives in three dimensions.</p><dl><dt>Drag / touch</dt><dd>Look around</dd><dt>Scroll / pinch</dt><dd>Move closer</dd><dt>W A S D / arrows</dt><dd>Wander slowly</dd><dt>C / R</dt><dd>Cinematic / reset</dd><dt>H / Escape</dt><dd>Hide / restore UI</dd><dt>P</dt><dd>Save a photograph</dd></dl><small>Weather and coordinates are artistic scene settings, not live observations. Rain audio is synthesized locally and starts muted.</small></section>}
    </div>
    {toast && <div className="toast" role="status"><Check size={14} />{toast}</div>}
    {photo && <button className="restore-ui" aria-label="Exit photography mode" onClick={() => setPhoto(false)}>Press H to return</button>}
    <div className="sr-only" aria-live="polite">{ready ? 'Interactive 3D scene ready. Use WASD to move, drag to look, and H to hide the interface.' : 'Loading 3D scene.'}</div>
  </main>
}
