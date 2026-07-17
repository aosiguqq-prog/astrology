// 单元 #1 · sunSignByDate 太阳星座判定 · FR-07 / SPEC-F-05 (C-SUN)
// I1修复：sunSignByDate 现符合 SPEC-A-02 (date: string): Result<Sign, 'invalid_date'>
// sunSignByMonthDayRaw 保留内部兼容用途
import { describe, it, expect } from 'vitest'
import { sunSignByDate, sunSignByMonthDayRaw } from '../../src/domain/ephemeris/sun-sign'
import { Sign } from '../../src/shared/enums'
import { SUN_SIGN_BOUNDARIES } from '../../src/shared/constants'

describe('sunSignByDate (SPEC-A-02) 字符串接口', () => {
  it.each([
    ['2000-03-21', Sign.白羊],
    ['2000-06-22', Sign.巨蟹],
    ['2000-08-15', Sign.狮子],
    ['2000-11-10', Sign.天蝎],
    ['2000-12-25', Sign.摩羯],
  ])('%s → %s', (dateStr, expected) => {
    const r = sunSignByDate(dateStr)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value).toBe(expected)
  })

  it('无效格式 → invalid_date', () => {
    const r = sunSignByDate('not-a-date')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('invalid_date')
  })

  it('非法月份 → invalid_date', () => {
    const r = sunSignByDate('2000-13-01')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('invalid_date')
  })
})

describe('sunSignByMonthDayRaw 场景大纲 (SPEC-F-05 验收点)', () => {
  it.each([
    [3, 21, Sign.白羊],
    [6, 22, Sign.巨蟹],
    [8, 15, Sign.狮子],
    [11, 10, Sign.天蝎],
    [12, 25, Sign.摩羯],
  ])('%i月%i日 → %s', (month, day, expected) => {
    expect(sunSignByMonthDayRaw(month, day)).toBe(expected)
  })
})

describe('sunSignByMonthDayRaw 各星座中间日期', () => {
  it.each([
    [4, 5, Sign.白羊],
    [5, 5, Sign.金牛],
    [6, 5, Sign.双子],
    [7, 5, Sign.巨蟹],
    [8, 5, Sign.狮子],
    [9, 5, Sign.处女],
    [10, 5, Sign.天秤],
    [11, 5, Sign.天蝎],
    [12, 5, Sign.射手],
    [1, 5, Sign.摩羯],
    [2, 5, Sign.水瓶],
    [3, 5, Sign.双鱼],
  ])('%i月%i日 → %s', (month, day, expected) => {
    expect(sunSignByMonthDayRaw(month, day)).toBe(expected)
  })
})

describe('sunSignByMonthDayRaw 边界日（起止含端点）', () => {
  it('每个星座起始日与结束日均正确归属', () => {
    for (const b of SUN_SIGN_BOUNDARIES) {
      expect(sunSignByMonthDayRaw(b.start.month, b.start.day)).toBe(b.sign)
      expect(sunSignByMonthDayRaw(b.end.month, b.end.day)).toBe(b.sign)
    }
  })

  it('相邻边界：3月20日→双鱼、3月21日→白羊', () => {
    expect(sunSignByMonthDayRaw(3, 20)).toBe(Sign.双鱼)
    expect(sunSignByMonthDayRaw(3, 21)).toBe(Sign.白羊)
  })
})

describe('sunSignByMonthDayRaw 摩羯跨年 (SPEC-F-05 边界)', () => {
  it.each([
    [12, 22, Sign.摩羯],
    [12, 31, Sign.摩羯],
    [1, 1, Sign.摩羯],
    [1, 19, Sign.摩羯],
    [1, 20, Sign.水瓶],
  ])('%i月%i日 → %s', (month, day, expected) => {
    expect(sunSignByMonthDayRaw(month, day)).toBe(expected)
  })
})

describe('sunSignByMonthDayRaw 闰年', () => {
  it('2月29日 → 双鱼', () => {
    expect(sunSignByMonthDayRaw(2, 29)).toBe(Sign.双鱼)
  })
})

describe('sunSignByMonthDayRaw 全年无空档无重叠', () => {
  it('1月1日至12月31日任一日期均返回一个 Sign', () => {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    for (let m = 1; m <= 12; m++) {
      for (let d = 1; d <= daysInMonth[m - 1]; d++) {
        const s = sunSignByMonthDayRaw(m, d)
        expect(Object.values(Sign)).toContain(s)
      }
    }
  })
})
