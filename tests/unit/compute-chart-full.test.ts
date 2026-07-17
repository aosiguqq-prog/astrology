// 单元 #2/#3 集成 · 完整 computeChart · FR-06/FR-08 / SPEC-F-03/F-07 / SPEC-D-02
import { describe, it, expect } from 'vitest'
import { computeChart } from '../../src/domain/ephemeris/compute-chart'
import { PLANETS, UNAVAILABLE } from '../../src/shared/constants'
import { Sign } from '../../src/shared/enums'
import type { CityEntry } from '../../src/shared/types'

const beijing: CityEntry = {
  id: 'beijing',
  name: '北京',
  aliases: [],
  longitude: 116.4074,
  latitude: 39.9042,
  timezone: 'Asia/Shanghai',
}

const input = {
  date: '1990-08-15',
  time: '14:30',
  timeUnknown: false,
  city: beijing,
}

describe('computeChart 完整路径 (SPEC-F-03 完整盘)', () => {
  it('完整盘：hasTime=true, ascendantAvailable=true, housesAvailable=true', () => {
    const r = computeChart(input)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.value.hasTime).toBe(true)
    expect(r.value.ascendantAvailable).toBe(true)
    expect(r.value.housesAvailable).toBe(true)
  })

  it('完整盘：10 行星落座，行星不重复，各含 sign/degree/longitude', () => {
    const r = computeChart(input)
    if (!r.ok) throw new Error('unexpected error')
    expect(r.value.planets).toHaveLength(10)
    const planetSet = new Set(r.value.planets.map((p) => p.planet))
    expect(planetSet.size).toBe(10)
    for (const p of PLANETS) expect(planetSet.has(p)).toBe(true)
    for (const pl of r.value.planets) {
      expect(Object.values(Sign)).toContain(pl.sign)
      expect(pl.degree).toBeGreaterThanOrEqual(0)
      expect(pl.degree).toBeLessThan(30)
      expect(pl.longitude).toBeGreaterThanOrEqual(0)
      expect(pl.longitude).toBeLessThan(360)
    }
  })

  it('完整盘：每颗行星宫位在 1..12 且为整数 (SPEC-F-03 验收点3)', () => {
    const r = computeChart(input)
    if (!r.ok) throw new Error('unexpected error')
    for (const pl of r.value.planets) {
      expect(pl.house).not.toBe(UNAVAILABLE)
      expect(Number.isInteger(pl.house)).toBe(true)
      expect(pl.house as number).toBeGreaterThanOrEqual(1)
      expect(pl.house as number).toBeLessThanOrEqual(12)
    }
  })

  it('完整盘：上升点与中天可用且落座星座有效', () => {
    const r = computeChart(input)
    if (!r.ok) throw new Error('unexpected error')
    expect(r.value.ascendant).not.toBe(UNAVAILABLE)
    expect(r.value.midheaven).not.toBe(UNAVAILABLE)
    if (r.value.ascendant !== UNAVAILABLE) {
      expect(Object.values(Sign)).toContain(r.value.ascendant.sign)
      expect(r.value.ascendant.longitude).toBeGreaterThanOrEqual(0)
      expect(r.value.ascendant.longitude).toBeLessThan(360)
    }
  })

  it('完整盘：十二宫宫头 12 个，houseNumber 1..12 唯一', () => {
    const r = computeChart(input)
    if (!r.ok) throw new Error('unexpected error')
    expect(r.value.houses).not.toBe(UNAVAILABLE)
    if (r.value.houses !== UNAVAILABLE) {
      expect(r.value.houses).toHaveLength(12)
      const nums = r.value.houses.map((h) => h.houseNumber).sort((a, b) => a - b)
      expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      for (const h of r.value.houses) {
        expect(h.longitude).toBeGreaterThanOrEqual(0)
        expect(h.longitude).toBeLessThan(360)
      }
    }
  })

  it('完整盘：第一宫宫头 = 上升点 (C-HOUSE)', () => {
    const r = computeChart(input)
    if (!r.ok) throw new Error('unexpected error')
    if (r.value.houses !== UNAVAILABLE && r.value.ascendant !== UNAVAILABLE) {
      const house1 = r.value.houses.find((h) => h.houseNumber === 1)!
      expect(house1.longitude).toBeCloseTo(r.value.ascendant.longitude, 6)
    }
  })

  it('完整盘：aspects 每条 orb ≤ 对应上限，行星两端不同', () => {
    const r = computeChart(input)
    if (!r.ok) throw new Error('unexpected error')
    for (const a of r.value.aspects) {
      expect(a.planetA).not.toBe(a.planetB)
      expect(a.orb).toBeGreaterThanOrEqual(0)
      expect(a.orb).toBeLessThanOrEqual(8)
    }
  })

  it('完整盘：sunSign 由星历太阳黄经落座得出', () => {
    const r = computeChart(input)
    if (!r.ok) throw new Error('unexpected error')
    const sun = r.value.planets.find((p) => p.planet === '太阳')!
    expect(r.value.sunSign).toBe(sun.sign)
  })
})
