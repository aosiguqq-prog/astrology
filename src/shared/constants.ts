// 共享常量 · 严格对齐 spec/functional.md 的 C-SUN / C-PLANET / C-SIGN / C-ASPECT / C-HOUSE
import { Sign, Planet, AspectType } from './enums'

// C-SIGN 黄道十二星座（固定顺序，起点白羊 0°），每星座占黄经 30°
export const SIGNS: Sign[] = [
  Sign.白羊,
  Sign.金牛,
  Sign.双子,
  Sign.巨蟹,
  Sign.狮子,
  Sign.处女,
  Sign.天秤,
  Sign.天蝎,
  Sign.射手,
  Sign.摩羯,
  Sign.水瓶,
  Sign.双鱼,
]

// C-PLANET 十大行星（固定顺序）
export const PLANETS: Planet[] = [
  Planet.太阳,
  Planet.月亮,
  Planet.水星,
  Planet.金星,
  Planet.火星,
  Planet.木星,
  Planet.土星,
  Planet.天王星,
  Planet.海王星,
  Planet.冥王星,
]

// C-SUN 太阳星座边界日期表（回归黄道，公历）
// 每个星座给出起始 { month, day }（含）；结束日 = 下一星座起始日的前一天。
export interface SunSignBoundary {
  sign: Sign
  start: { month: number; day: number }
  end: { month: number; day: number }
}

export const SUN_SIGN_BOUNDARIES: SunSignBoundary[] = [
  { sign: Sign.白羊, start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
  { sign: Sign.金牛, start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
  { sign: Sign.双子, start: { month: 5, day: 21 }, end: { month: 6, day: 21 } },
  { sign: Sign.巨蟹, start: { month: 6, day: 22 }, end: { month: 7, day: 22 } },
  { sign: Sign.狮子, start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
  { sign: Sign.处女, start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
  { sign: Sign.天秤, start: { month: 9, day: 23 }, end: { month: 10, day: 23 } },
  { sign: Sign.天蝎, start: { month: 10, day: 24 }, end: { month: 11, day: 22 } },
  { sign: Sign.射手, start: { month: 11, day: 23 }, end: { month: 12, day: 21 } },
  { sign: Sign.摩羯, start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
  { sign: Sign.水瓶, start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
  { sign: Sign.双鱼, start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
]

// C-ASPECT 主要相位与容许角度（orb）
export interface AspectDefinition {
  type: AspectType
  angle: number
  orb: number
}

export const ASPECTS: AspectDefinition[] = [
  { type: AspectType.合相, angle: 0, orb: 8 },
  { type: AspectType.六分相, angle: 60, orb: 6 },
  { type: AspectType.四分相, angle: 90, orb: 8 },
  { type: AspectType.三分相, angle: 120, orb: 8 },
  { type: AspectType.对分相, angle: 180, orb: 8 },
]

// 「不可用」显式标识值（SPEC-D-02：以显式标识值表达降级，非静默 null）
export const UNAVAILABLE = '不可用' as const
export type Unavailable = typeof UNAVAILABLE
