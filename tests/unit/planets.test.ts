// 单元 #2 · 行星黄经→星座落座 · FR-06 / SPEC-F-03 / SPEC-D-02
import { describe, it, expect } from 'vitest'
import { longitudeToSign } from '../../src/domain/ephemeris/planets'
import { Sign } from '../../src/shared/enums'

describe('longitudeToSign 黄经映射 (SPEC-F-03: 0°=白羊)', () => {
  it('黄经 0° → 白羊 0°', () => {
    const r = longitudeToSign(0)
    expect(r.sign).toBe(Sign.白羊)
    expect(r.degree).toBeCloseTo(0, 6)
  })

  it('黄经 45° → 金牛 15°', () => {
    const r = longitudeToSign(45)
    expect(r.sign).toBe(Sign.金牛)
    expect(r.degree).toBeCloseTo(15, 6)
  })

  it('黄经 359.9° → 双鱼 29.9°', () => {
    const r = longitudeToSign(359.9)
    expect(r.sign).toBe(Sign.双鱼)
    expect(r.degree).toBeCloseTo(29.9, 6)
  })

  it('公式验证：sign = floor(lon/30)，degree = lon % 30（逐 30° 落座）', () => {
    const signs = [
      Sign.白羊, Sign.金牛, Sign.双子, Sign.巨蟹, Sign.狮子, Sign.处女,
      Sign.天秤, Sign.天蝎, Sign.射手, Sign.摩羯, Sign.水瓶, Sign.双鱼,
    ]
    for (let i = 0; i < 12; i++) {
      const lon = i * 30 + 10
      const r = longitudeToSign(lon)
      expect(r.sign).toBe(signs[i])
      expect(r.degree).toBeCloseTo(10, 6)
    }
  })

  it('degree 恒在 [0, 30) 区间', () => {
    for (let lon = 0; lon < 360; lon += 7) {
      const r = longitudeToSign(lon)
      expect(r.degree).toBeGreaterThanOrEqual(0)
      expect(r.degree).toBeLessThan(30)
    }
  })

  it('黄经 360°/负值先归一到 [0,360) 再落座', () => {
    expect(longitudeToSign(360).sign).toBe(Sign.白羊)
    expect(longitudeToSign(360).degree).toBeCloseTo(0, 6)
    expect(longitudeToSign(-30).sign).toBe(Sign.双鱼)
  })
})
