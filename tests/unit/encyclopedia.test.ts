// 单元 #7 · 百科 · FR-15~19 / SPEC-F-11 / SPEC-A-04 / SPEC-D-05
import { describe, it, expect } from 'vitest'
import {
  listEntries,
  getEntry,
  getEntryByName,
  search,
} from '../../src/domain/encyclopedia/encyclopedia-service'
import { EntryCategory } from '../../src/shared/enums'
import { SIGNS, PLANETS } from '../../src/shared/constants'

describe('encyclopedia 数据完整性 (SPEC-D-05)', () => {
  it('listEntries 返回 22 条（12 星座 + 10 行星）', () => {
    const entries = listEntries()
    expect(entries).toHaveLength(22)
    const signs = entries.filter((e) => e.category === EntryCategory.星座)
    const planets = entries.filter((e) => e.category === EntryCategory.行星)
    expect(signs).toHaveLength(12)
    expect(planets).toHaveLength(10)
  })

  it('覆盖全部 12 星座与 10 行星名，无缺无重', () => {
    const entries = listEntries()
    const names = new Set(entries.map((e) => e.name))
    for (const s of SIGNS) expect(names.has(s)).toBe(true)
    for (const p of PLANETS) expect(names.has(p)).toBe(true)
    expect(new Set(entries.map((e) => e.id)).size).toBe(22)
  })

  it('每条 symbol/symbolism/explanation 非空，keywords ≥ 1，解释 ≥ 20 字', () => {
    for (const e of listEntries()) {
      expect(e.symbol.trim()).not.toBe('')
      expect(e.symbolism.trim()).not.toBe('')
      expect(e.explanation.trim().length).toBeGreaterThanOrEqual(20)
      expect(e.keywords.length).toBeGreaterThanOrEqual(1)
      for (const k of e.keywords) expect(k.trim()).not.toBe('')
    }
  })
})

describe('encyclopedia getEntry / getEntryByName (SPEC-A-04)', () => {
  it('getEntry(id) 命中返回正确词条', () => {
    const first = listEntries()[0]
    const r = getEntry(first.id)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.id).toBe(first.id)
  })

  it('getEntry(未知 id) → not_found', () => {
    const r = getEntry('__missing__')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('not_found')
  })

  it('getEntryByName("太阳") → 行星词条', () => {
    const r = getEntryByName('太阳')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.name).toBe('太阳')
      expect(r.value.category).toBe(EntryCategory.行星)
    }
  })

  it('getEntryByName 场景大纲：按名称查到对应类别', () => {
    const cases: [string, string][] = [
      ['太阳', EntryCategory.行星],
      ['月亮', EntryCategory.行星],
      ['水星', EntryCategory.行星],
      ['天蝎', EntryCategory.星座],
      ['摩羯', EntryCategory.星座],
    ]
    for (const [name, cat] of cases) {
      const r = getEntryByName(name)
      expect(r.ok).toBe(true)
      if (r.ok) expect(r.value.category).toBe(cat)
    }
  })

  it('getEntryByName(未知) → not_found', () => {
    const r = getEntryByName('不存在')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('not_found')
  })
})

describe('encyclopedia search (SPEC-F-11)', () => {
  it('search("火") 返回含「火」的词条（含火星）', () => {
    const results = search('火')
    expect(results.length).toBeGreaterThanOrEqual(1)
    expect(results.some((e) => e.name === '火星')).toBe(true)
  })

  it('search 子串匹配 name 或 keywords', () => {
    // 太阳的关键词应含可搜索项；此处以名称子串验证
    const results = search('星')
    expect(results.every((e) => e.name.includes('星') || e.keywords.some((k) => k.includes('星')))).toBe(true)
  })

  it('search("不存在XYZ") → 空数组', () => {
    expect(search('不存在XYZ')).toEqual([])
  })

  it('search("") → 全部 22 条', () => {
    expect(search('')).toHaveLength(22)
  })

  it('search 纯空白 → 全部 22 条（去空白后为空 = 浏览全部）', () => {
    expect(search('   ')).toHaveLength(22)
  })

  it('search 不区分大小写、去首尾空白', () => {
    // 关键词中的英文别名（若有）忽略大小写；这里以中文关键词 + 空白验证
    const a = search(' 火 ')
    const b = search('火')
    expect(a).toEqual(b)
  })
})
