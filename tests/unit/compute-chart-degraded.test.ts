// 单元 #5 · 降级路径 · FR-03/FR-08 / SPEC-F-04 / SPEC-D-02 / SPEC-A-02
import { describe, it, expect } from 'vitest'
import { computeChart } from '../../src/domain/ephemeris/compute-chart'
import { PLANETS, UNAVAILABLE } from '../../src/shared/constants'
import type { CityEntry } from '../../src/shared/types'

const beijing: CityEntry = {
  id: 'beijing',
  name: '北京',
  aliases: [],
  longitude: 116.4074,
  latitude: 39.9042,
  timezone: 'Asia/Shanghai',
}

describe('computeChart 降级路径 timeUnknown=true (SPEC-F-04)', () => {
  it('降级盘：hasTime=false, ascendantAvailable=false, housesAvailable=false, aspects=[]', () => {
    const r = computeChart({
      date: '1990-08-15',
      timeUnknown: true,
      city: beijing,
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const chart = r.value
    expect(chart.hasTime).toBe(false)
    expect(chart.ascendantAvailable).toBe(false)
    expect(chart.housesAvailable).toBe(false)
    expect(chart.aspects).toEqual([])
  })

  it('降级盘：上升/中天/宫位标注为「不可用」', () => {
    const r = computeChart({
      date: '1990-08-15',
      timeUnknown: true,
      city: beijing,
    })
    if (!r.ok) throw new Error('unexpected error')
    expect(r.value.ascendant).toBe(UNAVAILABLE)
    expect(r.value.midheaven).toBe(UNAVAILABLE)
    expect(r.value.houses).toBe(UNAVAILABLE)
  })

  it('降级盘：仍有 10 个行星落座，每个 house 为「不可用」', () => {
    const r = computeChart({
      date: '1990-08-15',
      timeUnknown: true,
      city: beijing,
    })
    if (!r.ok) throw new Error('unexpected error')
    expect(r.value.planets).toHaveLength(10)
    const planetSet = new Set(r.value.planets.map((p) => p.planet))
    for (const p of PLANETS) expect(planetSet.has(p)).toBe(true)
    for (const placement of r.value.planets) {
      expect(placement.house).toBe(UNAVAILABLE)
      expect(placement.degree).toBeGreaterThanOrEqual(0)
      expect(placement.degree).toBeLessThan(30)
      expect(placement.longitude).toBeGreaterThanOrEqual(0)
      expect(placement.longitude).toBeLessThan(360)
    }
  })

  it('降级盘：sunSign 非空', () => {
    const r = computeChart({
      date: '1990-08-15',
      timeUnknown: true,
      city: beijing,
    })
    if (!r.ok) throw new Error('unexpected error')
    expect(r.value.sunSign).toBeTruthy()
  })

  it('降级盘：time 字段被忽略（提供 time 但 timeUnknown=true 仍降级）', () => {
    const r = computeChart({
      date: '1990-08-15',
      time: '14:30',
      timeUnknown: true,
      city: beijing,
    })
    if (!r.ok) throw new Error('unexpected error')
    expect(r.value.hasTime).toBe(false)
  })

  it('非法日期 → invalid_date', () => {
    const r = computeChart({
      date: '1990-13-40',
      timeUnknown: true,
      city: beijing,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('invalid_date')
  })

  it('非闰年 2月29日 → invalid_date', () => {
    const r = computeChart({
      date: '1991-02-29',
      timeUnknown: true,
      city: beijing,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('invalid_date')
  })

  it('缺城市 → missing_city', () => {
    const r = computeChart({
      date: '1990-08-15',
      timeUnknown: true,
      // @ts-expect-error 故意传 undefined 测试防御
      city: undefined,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('missing_city')
  })
})
