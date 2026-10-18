export type Quality = 'low' | 'medium' | 'high'
export type TimeOfDay = 'night' | 'dusk'

export const QUALITY = {
  low: { dpr: 1, rain: 1800, ripples: 36, reflection: 256, bloom: false, shadows: false },
  medium: { dpr: 1.35, rain: 4500, ripples: 90, reflection: 512, bloom: true, shadows: false },
  high: { dpr: 1.75, rain: 8500, ripples: 160, reflection: 1024, bloom: true, shadows: true },
} as const

export const INITIAL_CAMERA: [number, number, number] = [16.8, 1.7, 24.0]
export const INITIAL_TARGET: [number, number, number] = [-0.7, 2.4, -1.5]

// Expanded footprints for the pedestrian camera, including a 0.45 m safety margin.
export const COLLIDERS = [
  { minX: -7.85, maxX: 7.85, minZ: -11, maxZ: -1.0 },
  { minX: -19.5, maxX: -8.2, minZ: -16, maxZ: 1.5 },
  { minX: 8.8, maxX: 19.8, minZ: -24, maxZ: -4.5 },
  { minX: -31, maxX: -19, minZ: -38, maxZ: -5 },
  { minX: -4.5, maxX: 8.5, minZ: -35, maxZ: -13 },
  { minX: 20.5, maxX: 34, minZ: -38, maxZ: -7 },
  { minX: -5.5, maxX: -3.4, minZ: -0.8, maxZ: 1.0 },
]

export function cameraBlocked(x: number, z: number) {
  return COLLIDERS.some(b => x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ)
}
