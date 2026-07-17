// 十大行星地心黄经估算（简化、确定性）
// TODO(refactorer): 首版为让测试稳定通过并保证确定性（SPEC-F-08），采用
// 基于平轨道根数的低精度近似（太阳/月亮/行星）。精度对「仅供娱乐参考」
// （SPEC-N-04 / ADR-002）足够。后续可用 astronomia 的 planetposition(VSOP87)
// + moonposition + pluto 模块替换本文件，保持 computeChart 接口不变。
import { Planet } from '../../shared/enums'
import { normalizeLongitude } from './planets'

const DEG = Math.PI / 180

// 太阳地心黄经（低精度，Meeus 简化式）。
function sunLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0
  const l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t
  const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t
  const mr = m * DEG
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(mr) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * mr) +
    0.000289 * Math.sin(3 * mr)
  return normalizeLongitude(l0 + c)
}

// 月亮地心黄经（低精度主项）。
function moonLongitude(jd: number): number {
  const t = (jd - 2451545.0) / 36525.0
  const lp = 218.3164477 + 481267.88123421 * t
  const d = 297.8501921 + 445267.1114034 * t
  const m = 357.5291092 + 35999.0502909 * t
  const mp = 134.9633964 + 477198.8675055 * t
  const f = 93.272095 + 483202.0175233 * t
  const lon =
    lp +
    6.288774 * Math.sin(mp * DEG) +
    1.274027 * Math.sin((2 * d - mp) * DEG) +
    0.658314 * Math.sin(2 * d * DEG) +
    0.213618 * Math.sin(2 * mp * DEG) -
    0.185116 * Math.sin(m * DEG) -
    0.114332 * Math.sin(2 * f * DEG)
  return normalizeLongitude(lon)
}

// 行星平轨道根数（历元 J2000）：日心黄经 L、近日点经度 varpi、偏心率 e、
// 半长轴 a（AU）、每儒略世纪的黄经速率（度）。低精度线性模型。
interface OrbitalElements {
  L0: number // J2000 平黄经（度）
  rate: number // 度/世纪
  varpi: number // 近日点黄经（度）
  e: number // 偏心率
  a: number // 半长轴（AU）
}

// 地球轨道根数（内部使用，地球非十大行星之一，不进入落座列表）。
const EARTH: OrbitalElements = {
  L0: 100.46435,
  rate: 35999.3728519,
  varpi: 102.94719,
  e: 0.01671,
  a: 1.0,
}

const ELEMENTS: Record<string, OrbitalElements> = {
  [Planet.水星]: { L0: 252.25084, rate: 149472.6746358, varpi: 77.45645, e: 0.20563, a: 0.38710 },
  [Planet.金星]: { L0: 181.97973, rate: 58517.8156760, varpi: 131.53298, e: 0.00677, a: 0.72333 },
  [Planet.火星]: { L0: 355.45332, rate: 19140.2993039, varpi: 336.04084, e: 0.09340, a: 1.52368 },
  [Planet.木星]: { L0: 34.40438, rate: 3034.9056606, varpi: 14.75385, e: 0.04849, a: 5.20260 },
  [Planet.土星]: { L0: 49.94432, rate: 1222.1138488, varpi: 92.43194, e: 0.05551, a: 9.55491 },
  [Planet.天王星]: { L0: 313.23218, rate: 428.4670365, varpi: 170.96424, e: 0.04630, a: 19.21845 },
  [Planet.海王星]: { L0: 304.88003, rate: 218.4862002, varpi: 44.97135, e: 0.00899, a: 30.11039 },
  [Planet.冥王星]: { L0: 238.92881, rate: 145.2078, varpi: 224.06676, e: 0.24883, a: 39.48168 },
}

// 由平黄经与近日点解开普勒方程，返回日心黄经（黄道面近似）。
function heliocentricLongitude(el: OrbitalElements, t: number): number {
  const L = el.L0 + el.rate * t
  const M = normalizeLongitude(L - el.varpi) * DEG
  // 解开普勒方程 E - e sinE = M。
  let E = M
  for (let i = 0; i < 8; i++) {
    E = E - (E - el.e * Math.sin(E) - M) / (1 - el.e * Math.cos(E))
  }
  // 真近点角。
  const xv = Math.cos(E) - el.e
  const yv = Math.sqrt(1 - el.e * el.e) * Math.sin(E)
  const v = Math.atan2(yv, xv)
  const lon = normalizeLongitude((v * 180) / Math.PI + el.varpi)
  return lon
}

// 由日心黄经/半长轴，近似地心黄经（忽略黄纬，平面近似）。
function geocentricLongitude(el: OrbitalElements, t: number): number {
  const helioP = heliocentricLongitude(el, t) * DEG
  const helioE = heliocentricLongitude(EARTH, t) * DEG
  const rP = el.a
  const rE = EARTH.a
  const xp = rP * Math.cos(helioP) - rE * Math.cos(helioE)
  const yp = rP * Math.sin(helioP) - rE * Math.sin(helioE)
  return normalizeLongitude((Math.atan2(yp, xp) * 180) / Math.PI)
}

// 对外：给定儒略日，返回十大行星地心黄经。确定性纯函数。
export function planetLongitudes(jd: number): { planet: Planet; longitude: number }[] {
  const t = (jd - 2451545.0) / 36525.0
  return [
    { planet: Planet.太阳, longitude: sunLongitude(jd) },
    { planet: Planet.月亮, longitude: moonLongitude(jd) },
    { planet: Planet.水星, longitude: geocentricLongitude(ELEMENTS[Planet.水星], t) },
    { planet: Planet.金星, longitude: geocentricLongitude(ELEMENTS[Planet.金星], t) },
    { planet: Planet.火星, longitude: geocentricLongitude(ELEMENTS[Planet.火星], t) },
    { planet: Planet.木星, longitude: geocentricLongitude(ELEMENTS[Planet.木星], t) },
    { planet: Planet.土星, longitude: geocentricLongitude(ELEMENTS[Planet.土星], t) },
    { planet: Planet.天王星, longitude: geocentricLongitude(ELEMENTS[Planet.天王星], t) },
    { planet: Planet.海王星, longitude: geocentricLongitude(ELEMENTS[Planet.海王星], t) },
    { planet: Planet.冥王星, longitude: geocentricLongitude(ELEMENTS[Planet.冥王星], t) },
  ]
}
