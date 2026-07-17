// 单元 #12 · chart-geometry 纯函数 · FR-08 / SPEC-F-07 / SPEC-U-05
import { describe, it, expect } from 'vitest'
import { lonToPoint, signTicks, houseLine } from '../../src/ui/chart/chart-geometry'

const CX = 200
const CY = 200
const R = 180

describe('lonToPoint 黄经→SVG 坐标 (SPEC-U-05)', () => {
  it('黄经 0° → 圆心左侧（x < cx，y ≈ cy）', () => {
    const p = lonToPoint(0, R, CX, CY)
    expect(p.x).toBeCloseTo(CX - R, 6)
    expect(p.y).toBeCloseTo(CY, 6)
  })

  it('黄经 90° → 圆心正上方（y < cy）', () => {
    const p = lonToPoint(90, R, CX, CY)
    expect(p.x).toBeCloseTo(CX, 6)
    expect(p.y).toBeCloseTo(CY - R, 6)
  })

  it('黄经 180° → 圆心右侧（x > cx）', () => {
    const p = lonToPoint(180, R, CX, CY)
    expect(p.x).toBeCloseTo(CX + R, 6)
    expect(p.y).toBeCloseTo(CY, 6)
  })

  it('黄经 270° → 圆心正下方（y > cy）', () => {
    const p = lonToPoint(270, R, CX, CY)
    expect(p.x).toBeCloseTo(CX, 6)
    expect(p.y).toBeCloseTo(CY + R, 6)
  })

  it('半径为 0 时点在圆心', () => {
    const p = lonToPoint(123, 0, CX, CY)
    expect(p.x).toBeCloseTo(CX, 6)
    expect(p.y).toBeCloseTo(CY, 6)
  })

  it('点始终落在半径圆上', () => {
    for (let lon = 0; lon < 360; lon += 13) {
      const p = lonToPoint(lon, R, CX, CY)
      const dist = Math.hypot(p.x - CX, p.y - CY)
      expect(dist).toBeCloseTo(R, 4)
    }
  })
})

describe('signTicks 十二星座刻度', () => {
  it('返回 12 条刻度，sign 索引 0..11', () => {
    const ticks = signTicks(160, 180, CX, CY)
    expect(ticks).toHaveLength(12)
    expect(ticks.map((t) => t.sign)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it('每条刻度 inner 半径 < outer 半径', () => {
    const ticks = signTicks(160, 180, CX, CY)
    for (const t of ticks) {
      const di = Math.hypot(t.inner.x - CX, t.inner.y - CY)
      const dobj = Math.hypot(t.outer.x - CX, t.outer.y - CY)
      expect(di).toBeLessThan(dobj)
    }
  })
})

describe('houseLine 宫头分隔线', () => {
  it('从圆心到外圈', () => {
    const line = houseLine(45, R, CX, CY)
    expect(line.from).toEqual({ x: CX, y: CY })
    const dist = Math.hypot(line.to.x - CX, line.to.y - CY)
    expect(dist).toBeCloseTo(R, 4)
  })
})
