// SPEC-F-03 / C-HOUSE · ASC/MC + 十二宫宫头 + 行星宫位定位
// 说明：TODO(refactorer) 首版为保证确定性与可测性，采用等宫制近似
// （第一宫宫头 = 上升点，其余每 30° 一宫）。精确 Placidus 宫头待后续
// 用 astronomia 的恒星时/黄赤交角替换（ADR-002）。本近似满足 SPEC-F-03
// 验收点3「宫位 1..12 唯一映射」与「第一宫宫头=上升点」。
import { normalizeLongitude } from './planets'
import { longitudeToSign } from './planets'
import type { Ascendant, Point, HouseCusp } from '../../shared/types'

const DEG = Math.PI / 180
const RAD = 180 / Math.PI

// 黄赤交角（约值，历元 J2000）。
const OBLIQUITY = 23.4393 * DEG

// 格林尼治平恒星时（度），基于儒略日（UT）。确定性，仅依赖 jd。
export function greenwichSiderealTime(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000.0
  gmst = normalizeLongitude(gmst)
  return gmst
}

// 本地恒星时（度）。
export function localSiderealTime(jd: number, longitudeEast: number): number {
  return normalizeLongitude(greenwichSiderealTime(jd) + longitudeEast)
}

// 中天（MC）黄经：由本地恒星时（RAMC）转黄经。
export function computeMidheaven(ramcDeg: number): number {
  const ramc = ramcDeg * DEG
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(OBLIQUITY))
  return normalizeLongitude(mc * RAD)
}

// 上升点（ASC）黄经：由本地恒星时与地理纬度求解。
export function computeAscendant(ramcDeg: number, latitudeDeg: number): number {
  const ramc = ramcDeg * DEG
  const lat = latitudeDeg * DEG
  const y = -Math.cos(ramc)
  const x =
    Math.sin(ramc) * Math.cos(OBLIQUITY) + Math.tan(lat) * Math.sin(OBLIQUITY)
  let asc = Math.atan2(y, x) * RAD
  asc = normalizeLongitude(asc)
  return asc
}

// 十二宫宫头（等宫制近似）：第一宫 = 上升点，其后每 30°。
export function computeHouses(ascLongitude: number): HouseCusp[] {
  const cusps: HouseCusp[] = []
  for (let i = 0; i < 12; i++) {
    cusps.push({
      houseNumber: i + 1,
      longitude: normalizeLongitude(ascLongitude + i * 30),
    })
  }
  return cusps
}

// 给定行星黄经与宫头，返回所在宫位（1..12）。
export function houseOfLongitude(longitude: number, cusps: HouseCusp[]): number {
  const lon = normalizeLongitude(longitude)
  for (let i = 0; i < 12; i++) {
    const start = cusps[i].longitude
    const end = cusps[(i + 1) % 12].longitude
    if (isInArc(lon, start, end)) return cusps[i].houseNumber
  }
  return 1
}

// 判断 lon 是否落在从 start 到 end 的顺行弧内（含 start，不含 end）。
function isInArc(lon: number, start: number, end: number): boolean {
  if (start <= end) {
    return lon >= start && lon < end
  }
  // 跨 360° 边界。
  return lon >= start || lon < end
}

export function ascendantResult(ascLongitude: number): Ascendant {
  return { sign: longitudeToSign(ascLongitude).sign, longitude: ascLongitude }
}

export function midheavenResult(mcLongitude: number): Point {
  return { sign: longitudeToSign(mcLongitude).sign, longitude: mcLongitude }
}
