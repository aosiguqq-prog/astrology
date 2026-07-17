// 单元 #6 · domain/geocoding · FR-02/FR-04 / SPEC-F-02 / SPEC-A-01
import { describe, it, expect } from 'vitest'
import { resolvePlace } from '../../src/domain/geocoding/geocoder'

describe('geocoding.resolvePlace (FR-02/FR-04, SPEC-A-01)', () => {
  it('精确命中：已知城市名 → 返回经纬度+时区 (exact)', () => {
    const r = resolvePlace('北京')
    expect(r.ok).toBe(true)
    if (r.ok && r.value.kind === 'exact') {
      expect(r.value.city.name).toBe('北京')
      expect(typeof r.value.city.longitude).toBe('number')
      expect(typeof r.value.city.latitude).toBe('number')
      expect(r.value.city.timezone).toBe('Asia/Shanghai')
    } else {
      throw new Error('expected exact match')
    }
  })

  it('规范化：全角空格/首尾空白 → 命中', () => {
    const r = resolvePlace('　 上海 　')
    expect(r.ok).toBe(true)
    if (r.ok && r.value.kind === 'exact') {
      expect(r.value.city.name).toBe('上海')
    } else {
      throw new Error('expected exact match')
    }
  })

  it('别名命中：输入别名 → 返回主条目 (SPEC-F-02)', () => {
    const r = resolvePlace('Beijing')
    expect(r.ok).toBe(true)
    if (r.ok && r.value.kind === 'exact') {
      expect(r.value.city.name).toBe('北京')
    } else {
      throw new Error('expected exact match via alias')
    }
  })

  it('无法识别：不存在的城市 → error unrecognized', () => {
    const r = resolvePlace('不存在的城市XYZ')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('unrecognized')
  })

  it('规范化后为空 → error empty_input', () => {
    const r = resolvePlace('   　　  ')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toBe('empty_input')
  })

  it('确定性：同输入两次调用完全相等 (SPEC-F-08)', () => {
    const a = resolvePlace('广州')
    const b = resolvePlace('广州')
    expect(a).toEqual(b)
  })

  it('全角字母别名规范化后命中（ＮＥＷ ＹＯＲＫ 风格）', () => {
    // 全角转半角 + 大小写不敏感命中英文别名
    const r = resolvePlace('  new york ')
    expect(r.ok).toBe(true)
    if (r.ok && r.value.kind === 'exact') {
      expect(r.value.city.name).toBe('纽约')
    } else {
      throw new Error('expected exact match via english alias')
    }
  })

  it('城市库零外部网络：resolvePlace 为纯同步函数（无 Promise）', () => {
    const r = resolvePlace('东京')
    expect(r).not.toBeInstanceOf(Promise)
    expect(r.ok).toBe(true)
  })

  it('前缀候选：输入城市名前缀 → 返回候选列表 (SPEC-F-02 步骤3)', () => {
    // 「上」是「上海」名称前缀，无精确命中时应给候选
    const r = resolvePlace('上')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.kind).toBe('candidates')
      if (r.value.kind === 'candidates') {
        expect(r.value.candidates.length).toBeGreaterThanOrEqual(1)
        expect(r.value.candidates.some((c) => c.name === '上海')).toBe(true)
      }
    }
  })

  it('[B1回归] 含城市名的更长无效输入 → unrecognized（非候选）', () => {
    // 修复前：双向 startsWith 导致「北京上海」「上海人民广场」误返回候选
    // 修复后：仅允许「城市名.startsWith(用户输入)」单向前缀（SPEC-A-01 验收点3）
    expect(resolvePlace('北京上海').ok).toBe(false)
    const r1 = resolvePlace('北京上海')
    if (!r1.ok) expect(r1.error).toBe('unrecognized')

    const r2 = resolvePlace('上海人民广场')
    expect(r2.ok).toBe(false)
    if (!r2.ok) expect(r2.error).toBe('unrecognized')

    // 「纽约ABC不存在」也应 unrecognized
    const r3 = resolvePlace('纽约ABC不存在')
    expect(r3.ok).toBe(false)
    if (!r3.ok) expect(r3.error).toBe('unrecognized')
  })

  it('[B1回归] 正确前缀（城市名以输入开头）仍返回候选', () => {
    // 「北」是「北京」的前缀 → 候选（单向正确）
    const r = resolvePlace('北')
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.kind).toBe('candidates')
  })

  it('[v1.1.0] 山东地级市命中：潍坊 → exact', () => {
    const r = resolvePlace('潍坊')
    expect(r.ok).toBe(true)
    if (r.ok && r.value.kind === 'exact') {
      expect(r.value.city.name).toBe('潍坊')
      expect(r.value.city.province).toBe('山东')
    } else {
      throw new Error('expected exact match for 潍坊')
    }
  })

  it('[v1.1.0] 山东县级市命中：胶州/寿光/滕州 → exact', () => {
    for (const name of ['胶州', '寿光', '滕州']) {
      const r = resolvePlace(name)
      expect(r.ok).toBe(true)
      if (r.ok && r.value.kind === 'exact') {
        expect(r.value.city.name).toBe(name)
        expect(r.value.city.province).toBe('山东')
      } else {
        throw new Error(`expected exact match for ${name}`)
      }
    }
  })
})
