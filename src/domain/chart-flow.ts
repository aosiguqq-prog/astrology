// 用例编排：geocoding → ephemeris → NatalChart（架构 §2.1）
// 两 domain 模块自身仍解耦，此处仅做串联。
import { ok, err, type Result } from '../shared/result'
import type { NatalChart, CityEntry } from '../shared/types'
import { computeChart } from './ephemeris/compute-chart'

export type ChartFlowError =
  | 'invalid_date'
  | 'missing_city' // 地点未解析/无法识别
  | 'unrecognized_place'

export interface ChartFlowInput {
  date: string
  time?: string
  timeUnknown: boolean
  city: CityEntry | null
}

// 已由表单完成地点解析（用户选定 city），此处生成星盘。
export function generateChart(
  input: ChartFlowInput,
): Result<NatalChart, ChartFlowError> {
  if (!input.city) {
    return err('unrecognized_place')
  }
  const result = computeChart({
    date: input.date,
    time: input.timeUnknown ? undefined : input.time,
    timeUnknown: input.timeUnknown,
    city: input.city,
  })
  if (!result.ok) {
    return err(result.error)
  }
  return ok(result.value)
}
