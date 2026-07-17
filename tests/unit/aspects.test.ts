// 单元 #4 · 相位计算 · FR-06 / SPEC-F-03 (C-ASPECT) / SPEC-D-02
import { describe, it, expect } from 'vitest'
import { calcAspects, angularSeparation } from '../../src/domain/ephemeris/aspects'
import { Planet, AspectType } from '../../src/shared/enums'

describe('angularSeparation 最小角差 (SPEC-F-03: 超过180°折算)', () => {
  it('0° 差为 0', () => {
    expect(angularSeparation(10, 10)).toBeCloseTo(0, 6)
  })
  it('350° 与 10° → 20°（折算，不取 340°）', () => {
    expect(angularSeparation(350, 10)).toBeCloseTo(20, 6)
  })
  it('0° 与 180° → 180°', () => {
    expect(angularSeparation(0, 180)).toBeCloseTo(180, 6)
  })
  it('0° 与 270° → 90°（折算）', () => {
    expect(angularSeparation(0, 270)).toBeCloseTo(90, 6)
  })
})

describe('calcAspects 相位判定 (C-ASPECT)', () => {
  it('合相：两行星相差 0° → 合相', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 100 },
      { planet: Planet.月亮, longitude: 100 },
    ])
    expect(aspects).toHaveLength(1)
    expect(aspects[0].type).toBe(AspectType.合相)
    expect(aspects[0].orb).toBeCloseTo(0, 6)
  })

  it('合相 orb 边界：7.9° → 合相', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 7.9 },
    ])
    expect(aspects).toHaveLength(1)
    expect(aspects[0].type).toBe(AspectType.合相)
  })

  it('合相 orb 边界：恰好 8.0° → 合相（闭区间）', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 8.0 },
    ])
    expect(aspects).toHaveLength(1)
    expect(aspects[0].type).toBe(AspectType.合相)
  })

  it('合相 orb 边界：8.1° → 无相位', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 8.1 },
    ])
    expect(aspects).toHaveLength(0)
  })

  it('六分相：60°（orb 6°）', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 60 },
    ])
    expect(aspects).toHaveLength(1)
    expect(aspects[0].type).toBe(AspectType.六分相)
  })

  it('六分相 orb 边界：66.1° → 无相位（超出 6°）', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 66.1 },
    ])
    expect(aspects).toHaveLength(0)
  })

  it('四分相：90°（orb 8°）', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 90 },
    ])
    expect(aspects[0].type).toBe(AspectType.四分相)
  })

  it('三分相：120°（orb 8°）', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 120 },
    ])
    expect(aspects[0].type).toBe(AspectType.三分相)
  })

  it('对分相：180° → 对分相', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 180 },
    ])
    expect(aspects[0].type).toBe(AspectType.对分相)
  })

  it('对分相：172°（8°内）→ 对分相', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 172 },
    ])
    expect(aspects).toHaveLength(1)
    expect(aspects[0].type).toBe(AspectType.对分相)
  })

  it('多相位候选时取最近者（角差最小）', () => {
    // 差 3° 同时 <合相orb(8)，但只应判合相（最近精确角度 0）
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 3 },
    ])
    expect(aspects).toHaveLength(1)
    expect(aspects[0].type).toBe(AspectType.合相)
    expect(aspects[0].orb).toBeCloseTo(3, 6)
  })

  it('无相位：差 30°（不落任何区间）→ 空', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 30 },
    ])
    expect(aspects).toHaveLength(0)
  })

  it('遍历所有行星对：3 行星两两 → 至多 3 对', () => {
    const aspects = calcAspects([
      { planet: Planet.太阳, longitude: 0 },
      { planet: Planet.月亮, longitude: 60 },
      { planet: Planet.水星, longitude: 120 },
    ])
    // 太阳-月亮=60(六分), 月亮-水星=60(六分), 太阳-水星=120(三分)
    expect(aspects).toHaveLength(3)
  })
})
