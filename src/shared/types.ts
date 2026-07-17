// 领域数据结构 · 严格对齐 SPEC-D
import type { Sign, Planet, AspectType, EntryCategory, HoroscopePeriod } from './enums'
import type { Unavailable } from './constants'

// SPEC-D-03 城市库条目
export interface CityEntry {
  id: string
  name: string
  aliases: string[]
  province?: string
  longitude: number
  latitude: number
  timezone: string
}

// SPEC-D-02 星盘结果
export interface PlanetPlacement {
  planet: Planet
  sign: Sign
  degree: number // [0, 30)
  longitude: number // [0, 360)
  house: number | Unavailable // 完整盘 1..12；降级盘「不可用」
}

export interface Ascendant {
  sign: Sign
  longitude: number
}

export interface Point {
  sign: Sign
  longitude: number
}

export interface HouseCusp {
  houseNumber: number // 1..12
  longitude: number
}

export interface Aspect {
  planetA: Planet
  planetB: Planet
  type: AspectType
  orb: number
}

export interface NatalChart {
  hasTime: boolean
  sunSign: Sign
  planets: PlanetPlacement[]
  ascendant: Ascendant | Unavailable
  midheaven: Point | Unavailable
  houses: HouseCusp[] | Unavailable
  aspects: Aspect[]
  ascendantAvailable: boolean
  housesAvailable: boolean
}

export interface ChartInput {
  date: string
  time?: string
  timeUnknown: boolean
  city: CityEntry
}

export type EphemerisError = 'invalid_date' | 'missing_city'

// SPEC-A-01 地理编码
export type GeocodeResolved =
  | { kind: 'exact'; city: CityEntry }
  | { kind: 'candidates'; candidates: CityEntry[] }

export type GeocodeError = 'empty_input' | 'unrecognized'

// SPEC-D-04 运势内容
export interface HoroscopeDimension {
  name: string
  text: string
  score?: number // 1..5
}

export interface HoroscopeContent {
  sign: Sign
  period: HoroscopePeriod
  targetDate?: string
  weekStart?: string
  weekEnd?: string
  dimensions: HoroscopeDimension[]
  summary?: string
}

export interface HoroscopeRequest {
  sign: Sign
  period: HoroscopePeriod
}

export type HoroscopeUnavailableReason =
  | 'timeout'
  | 'network'
  | 'bad_status'
  | 'incomplete'
  | 'parse_error'

export interface HoroscopeUnavailable {
  reason: HoroscopeUnavailableReason
}

// SPEC-D-05 百科词条
export interface EncyclopediaEntry {
  id: string
  name: string
  category: EntryCategory
  symbol: string
  symbolism: string
  keywords: string[]
  explanation: string
}
