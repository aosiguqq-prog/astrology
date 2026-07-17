// 单元 #13（部分）· 生成本命盘编排 · FR-02/04/06 / SPEC-F-02/F-03/F-06
import { describe, it, expect } from 'vitest'
import { generateChart } from '../../src/domain/chart-flow'
import type { CityEntry } from '../../src/shared/types'

const beijing: CityEntry = {
  id: 'beijing',
  name: '北京',
  aliases: [],
  longitude: 116.4074,
  latitude: 39.9042,
  timezone: 'Asia/Shanghai',
}

describe('generateChart 编排 (geocoding→ephemeris)', () => {
  it('city 已解析 + 合法输入 → 完整盘', () => {
    const r = generateChart({
      date: '1990-08-15',
      time: '14:30',
      timeUnknown: false,
      city: beijing,
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.planets).toHaveLength(10)
  })

  it('city 为 null（地点无法识别）→ 拒绝生成 unrecognized_place (SPEC-F-06)', () => {
    const r = generateChart({
      date: '1990-08-15',
      timeUnknown: false,
      city: null,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('unrecognized_place')
  })

  it('timeUnknown=true → 降级盘（忽略 time）', () => {
    const r = generateChart({
      date: '1990-08-15',
      time: '14:30',
      timeUnknown: true,
      city: beijing,
    })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.hasTime).toBe(false)
  })

  it('非法日期 → invalid_date', () => {
    const r = generateChart({
      date: '1899-12-31',
      timeUnknown: false,
      city: beijing,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('invalid_date')
  })
})
