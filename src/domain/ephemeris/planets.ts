// SPEC-F-03 行星黄经 → 星座落座 · 黄经映射（0°=白羊）
import type { Sign } from '../../shared/enums'
import { SIGNS } from '../../shared/constants'

// 将黄经归一到 [0, 360)。
export function normalizeLongitude(longitude: number): number {
  const wrapped = longitude % 360
  return wrapped < 0 ? wrapped + 360 : wrapped
}

// 黄经 → 所在星座 + 星座内度数。
// sign = floor(lon/30)，degree = lon % 30；0°=白羊 0°（SPEC-F-03 边界）。
export function longitudeToSign(longitude: number): { sign: Sign; degree: number } {
  const lon = normalizeLongitude(longitude)
  const index = Math.floor(lon / 30) % 12
  const degree = lon - index * 30
  return { sign: SIGNS[index], degree }
}
