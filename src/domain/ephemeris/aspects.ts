// SPEC-F-03 相位计算（C-ASPECT）
// 两行星黄经差落入「精确角度 ± orb」即判定；多区间时取角差最小者。
import type { Planet } from '../../shared/enums'
import type { Aspect } from '../../shared/types'
import { ASPECTS } from '../../shared/constants'

// 两黄经的最小角差（0..180）。超过 180° 折算。
export function angularSeparation(lonA: number, lonB: number): number {
  let diff = Math.abs(lonA - lonB) % 360
  if (diff > 180) diff = 360 - diff
  return diff
}

interface PlanetLongitude {
  planet: Planet
  longitude: number
}

// 遍历所有行星对，判定相位。
export function calcAspects(planets: PlanetLongitude[]): Aspect[] {
  const result: Aspect[] = []

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const sep = angularSeparation(planets[i].longitude, planets[j].longitude)

      // 在所有相位定义中，找出「落入 orb 区间」且「角差最小」者。
      let best: { type: Aspect['type']; orb: number } | null = null
      for (const def of ASPECTS) {
        const orb = Math.abs(sep - def.angle)
        if (orb <= def.orb) {
          if (best === null || orb < best.orb) {
            best = { type: def.type, orb }
          }
        }
      }

      if (best !== null) {
        result.push({
          planetA: planets[i].planet,
          planetB: planets[j].planet,
          type: best.type,
          orb: best.orb,
        })
      }
    }
  }

  return result
}
