import * as THREE from 'three'

export function random(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

const cache = new Map<string, THREE.CanvasTexture>()
function canvasTexture(key: string, w: number, h: number, paint: (c: CanvasRenderingContext2D) => void) {
  if (cache.has(key)) return cache.get(key)!
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  paint(canvas.getContext('2d')!)
  const t = new THREE.CanvasTexture(canvas)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  cache.set(key, t)
  return t
}

export function signTexture(text: string, bg = '#17212a', color = '#efede0', vertical = false) {
  return canvasTexture(`sign-${text}-${bg}-${color}-${vertical}`, vertical ? 192 : 1024, vertical ? 1024 : 256, c => {
    const w = c.canvas.width, h = c.canvas.height
    c.fillStyle = bg; c.fillRect(0, 0, w, h)
    c.strokeStyle = color; c.globalAlpha = .3; c.lineWidth = 6; c.strokeRect(12, 12, w - 24, h - 24); c.globalAlpha = 1
    c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle'
    if (vertical) {
      c.font = '600 115px "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif'
      Array.from(text).forEach((s, i, a) => c.fillText(s, w / 2, h * (.12 + i * .76 / Math.max(a.length - 1, 1))))
    } else {
      c.font = `600 ${text.length > 13 ? 65 : 106}px "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif`
      c.fillText(text, w / 2, h / 2 + 4, w - 60)
    }
  })
}

export function sevenTexture() {
  return canvasTexture('7-eleven', 512, 512, c => {
    c.fillStyle = '#fff9e6'; c.fillRect(0, 0, 512, 512)
    c.fillStyle = '#008052'; c.fillRect(24, 25, 464, 461)
    c.fillStyle = '#fffbea'; c.fillRect(65, 39, 382, 431)
    c.fillStyle = '#ed6a20'; c.fillRect(108, 77, 294, 65)
    c.fillStyle = '#e64429'; c.beginPath(); c.moveTo(311, 142); c.lineTo(402, 142); c.lineTo(280, 386); c.lineTo(190, 386); c.closePath(); c.fill()
    c.fillStyle = '#fffcf0'; c.fillRect(78, 260, 352, 70)
    c.fillStyle = '#007550'; c.font = '900 67px Arial, sans-serif'; c.textAlign = 'center'; c.fillText('ELEVEN', 256, 315)
    c.font = '700 16px Arial'; c.fillText('OPEN 24 HOURS', 256, 439)
  })
}

export function vendingTexture() {
  return canvasTexture('vending', 512, 768, c => {
    c.fillStyle = '#e3e5d9'; c.fillRect(0, 0, 512, 768)
    c.fillStyle = '#d92527'; c.fillRect(0, 0, 512, 90)
    c.fillStyle = '#fff8e3'; c.font = 'italic bold 43px Arial'; c.textAlign = 'center'; c.fillText('Refresh. TOKYO', 256, 60)
    c.fillStyle = '#e6f2e8'; c.fillRect(25, 105, 462, 410)
    const colors = ['#cf3f32', '#578989', '#c5a15a', '#a9c79b', '#213c68', '#d9d8c4']
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) {
      const x = 43 + i * 76, y = 130 + j * 132
      c.fillStyle = colors[(i + j * 2) % 6]; c.fillRect(x, y, 43, 75)
      c.fillStyle = '#f1f1da'; c.fillRect(x + 3, y + 27, 37, 25)
      c.fillStyle = '#a9d7ba'; c.fillRect(x + 3, y + 91, 38, 8)
    }
    c.fillStyle = '#1d2529'; c.fillRect(63, 599, 295, 85); c.fillRect(396, 553, 55, 61)
    c.fillStyle = '#b82729'; c.font = 'bold 30px Arial'; c.fillText('COLD DRINKS', 237, 563)
  })
}

export function posterTexture() {
  return canvasTexture('poster', 384, 512, c => {
    c.fillStyle = '#ece6cf'; c.fillRect(0, 0, 384, 512)
    c.fillStyle = '#173d32'; c.fillRect(0, 0, 384, 90)
    c.fillStyle = '#f7edcf'; c.font = 'bold 31px sans-serif'; c.textAlign = 'center'; c.fillText('おいしい、ひと息。', 192, 57)
    c.fillStyle = '#b87936'; c.beginPath(); c.arc(192, 240, 107, 0, Math.PI * 2); c.fill()
    c.fillStyle = '#f4e3b1'; c.beginPath(); c.arc(192, 227, 86, 0, Math.PI * 2); c.fill()
    c.fillStyle = '#312b21'; c.font = 'bold 36px sans-serif'; c.fillText('挽きたての幸せ', 192, 397)
    c.fillStyle = '#b13e24'; c.font = 'bold 44px Arial'; c.fillText('¥ 120', 192, 463)
  })
}

export function asphaltTextures() {
  const rng = random(64)
  const color = canvasTexture('asphalt-color', 1024, 1024, c => {
    c.fillStyle = '#555c61'; c.fillRect(0, 0, 1024, 1024)
    for (let i = 0; i < 180000; i++) {
      const v = 35 + rng() * 90
      c.fillStyle = `rgba(${v},${v + 3},${v + 6},${.15 + rng() * .35})`
      c.fillRect(rng() * 1024, rng() * 1024, rng() * 2 + .4, rng() * 2 + .4)
    }
    for (let i = 0; i < 70; i++) {
      c.strokeStyle = 'rgba(20,24,27,.23)'; c.lineWidth = .6 + rng() * 2
      c.beginPath(); let x = rng() * 1024, y = rng() * 1024; c.moveTo(x, y)
      for (let j = 0; j < 7; j++) { x += (rng() - .5) * 100; y += rng() * 60; c.lineTo(x, y) }
      c.stroke()
    }
  })
  const roughness = canvasTexture('asphalt-rough', 512, 512, c => {
    const pixels = c.createImageData(512, 512)
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
      const n = Math.sin(x * .027 + Math.sin(y * .017) * 2.8) * Math.sin(y * .043 + Math.sin(x * .013) * 3.1)
        + Math.sin(x * .087 + y * .075) * .24
      const v = 170 + 65 * Math.max(-.85, Math.min(1, n)) + rng() * 10
      const i = (y * 512 + x) * 4
      pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = v; pixels.data[i + 3] = 255
    }
    c.putImageData(pixels, 0, 0)
  })
  const normal = canvasTexture('asphalt-normal', 512, 512, c => {
    const pixels = c.createImageData(512, 512)
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] = 128 + (rng() - .5) * 26
      pixels.data[i + 1] = 128 + (rng() - .5) * 48
      pixels.data[i + 2] = 254; pixels.data[i + 3] = 255
    }
    c.putImageData(pixels, 0, 0)
  })
  for (const t of [color, roughness, normal]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 12) }
  roughness.colorSpace = normal.colorSpace = THREE.NoColorSpace
  return { color, roughness, normal }
}

export function concreteTexture() {
  return canvasTexture('concrete', 512, 512, c => {
    const rng = random(51)
    c.fillStyle = '#626967'; c.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 11000; i++) {
      c.fillStyle = `rgba(17,25,29,${rng() * .18})`; c.fillRect(rng() * 512, rng() * 512, rng() * 3 + .5, rng() * 30)
    }
    c.strokeStyle = '#363e3f'; c.lineWidth = 2
    for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, i * 64); c.lineTo(512, i * 64); c.stroke() }
    for (let j = 0; j < 8; j++) for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(i * 128 + (j % 2) * 64, j * 64); c.lineTo(i * 128 + (j % 2) * 64, j * 64 + 64); c.stroke() }
  })
}
