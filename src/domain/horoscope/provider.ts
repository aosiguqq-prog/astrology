// SPEC-A-03 运势 Provider 抽象
// Provider 只负责「取原始响应」；超时/归一/降级判定由 HoroscopeService 承担
// （ADR-003：来源可替换、降级优先）。
import type { HoroscopePeriod } from '../../shared/enums'

// 原始运势响应（未归一化）。字段宽松，允许 Provider 透传第三方结构。
export interface RawHoroscopeDimension {
  name: string
  text: string
  score?: number
}

export interface RawHoroscope {
  sign: string
  dimensions?: RawHoroscopeDimension[]
  summary?: string
  // 非成功响应状态由 Provider 以该字段透传（>=400 视为 bad_status）。
  __badStatus?: number
}

export interface RawHoroscopeRequest {
  sign: string
  period: HoroscopePeriod
  targetDate?: string
  weekStart?: string
  weekEnd?: string
}

export interface HoroscopeProvider {
  fetchRaw(req: RawHoroscopeRequest): Promise<RawHoroscope>
}
