// 单元 #8/#10 · 运势 · FR-10~14 / SPEC-F-10/F-12 / SPEC-A-03 / SPEC-D-04
import { describe, it, expect, vi } from 'vitest'
import { createHoroscopeService } from '../../src/domain/horoscope/horoscope-service'
import type { HoroscopeProvider, RawHoroscope } from '../../src/domain/horoscope/provider'
import { createPresetProvider } from '../../src/domain/horoscope/preset-provider'
import { Sign } from '../../src/shared/enums'

// 固定「当前系统日期」为一个已知周三，验证目标日期/周计算。
const FIXED_NOW = new Date('2024-05-15T10:00:00Z') // 2024-05-15 周三

function goodRaw(sign: string): RawHoroscope {
  return {
    sign,
    dimensions: [
      { name: '爱情', text: '桃花运不错' },
      { name: '事业', text: '工作顺利' },
      { name: '健康', text: '注意休息' },
    ],
  }
}

function providerOf(fn: HoroscopeProvider['fetchRaw']): HoroscopeProvider {
  return { fetchRaw: fn }
}

describe('horoscope 成功路径 (SPEC-A-03)', () => {
  it('成功：正确归一化，sign 等于请求星座', async () => {
    const provider = providerOf(async () => goodRaw('白羊'))
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.value.sign).toBe(Sign.白羊)
      expect(r.value.period).toBe('每日')
      expect(r.value.dimensions).toHaveLength(3)
      const names = r.value.dimensions.map((d) => d.name)
      expect(names).toEqual(expect.arrayContaining(['爱情', '事业', '健康']))
    }
  })

  it('每日运势 targetDate = 当前系统日期', async () => {
    const provider = providerOf(async () => goodRaw('金牛'))
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.金牛, period: '每日' })
    if (r.ok) expect(r.value.targetDate).toBe('2024-05-15')
  })

  it('每周运势 weekStart/weekEnd = 本周周一至周日', async () => {
    const provider = providerOf(async () => goodRaw('双子'))
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.双子, period: '每周' })
    if (r.ok) {
      expect(r.value.weekStart).toBe('2024-05-13') // 周一
      expect(r.value.weekEnd).toBe('2024-05-19') // 周日
    }
  })

  it('星座严格对应：请求白羊 → 结果 sign=白羊', async () => {
    const provider = providerOf(async () => goodRaw('白羊'))
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    if (r.ok) expect(r.value.sign).toBe(Sign.白羊)
  })
})

describe('horoscope 五类失败降级 (SPEC-F-12)', () => {
  it('network：provider 抛网络错误 → HoroscopeUnavailable network', async () => {
    const provider = providerOf(async () => {
      throw new Error('network down')
    })
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.reason).toBe('network')
  })

  it('bad_status：provider 返回错误状态标记 → bad_status', async () => {
    const provider = providerOf(async () => ({ __badStatus: 500 }) as unknown as RawHoroscope)
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.reason).toBe('bad_status')
  })

  it('incomplete：缺健康维度 → incomplete', async () => {
    const provider = providerOf(async () => ({
      sign: '白羊',
      dimensions: [
        { name: '爱情', text: 'a' },
        { name: '事业', text: 'b' },
      ],
    }))
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.reason).toBe('incomplete')
  })

  it('parse_error：响应结构不可解析 → parse_error', async () => {
    const provider = providerOf(async () => ({ garbage: true }) as unknown as RawHoroscope)
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.reason).toBe('parse_error')
  })

  it('timeout：provider 超过 8s → timeout', async () => {
    vi.useFakeTimers()
    const provider = providerOf(
      () => new Promise<RawHoroscope>(() => {}), // 永不 resolve
    )
    const service = createHoroscopeService(provider, {
      now: () => FIXED_NOW,
      timeoutMs: 8000,
    })
    const promise = service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    await vi.advanceTimersByTimeAsync(8001)
    const r = await promise
    vi.useRealTimers()
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.reason).toBe('timeout')
  })
})

describe('[I5补测] 每周运势 incomplete (SPEC-F-12 / horoscope-service.ts:107-109)', () => {
  it('每周运势：维度过滤后为空 → incomplete', async () => {
    const provider = providerOf(async () => ({
      sign: '白羊',
      dimensions: [], // 空维度数组
    }))
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.白羊, period: '每周' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.reason).toBe('incomplete')
  })

  it('每周运势：维度全为空文本 → incomplete', async () => {
    const provider = providerOf(async () => ({
      sign: '双子',
      dimensions: [
        { name: '运势', text: '   ' }, // 纯空白，过滤后为空
      ],
    }))
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.双子, period: '每周' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error.reason).toBe('incomplete')
  })

  it('每周运势：有非空维度 → 成功（不要求三维度）', async () => {
    const provider = providerOf(async () => ({
      sign: '天蝎',
      dimensions: [{ name: '本周运势', text: '本周整体运势平稳，适合休养。' }],
    }))
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const r = await service.fetchHoroscope({ sign: Sign.天蝎, period: '每周' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.dimensions).toHaveLength(1)
  })
})

describe('[I5补测] aztro-provider 分支覆盖', () => {
  it('非 2xx 响应 → 返回 __badStatus 字段', async () => {
    // aztro-provider 在 !res.ok 时返回 { sign, __badStatus: res.status }
    // 测试该分支的结构是否符合 provider 约定
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({}),
    } as unknown as Response)
    const { createAztroProvider } = await import('../../src/domain/horoscope/aztro-provider')
    const provider = createAztroProvider('/api/horoscope')
    const raw = await provider.fetchRaw({ sign: '白羊', period: '每日' })
    expect(raw.__badStatus).toBe(429)
    vi.restoreAllMocks()
  })

  it('正常 2xx → 返回三维度映射结构', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        description: '今日运势不错',
        compatibility: '天蝎',
        lucky_time: '下午',
        mood: '开心',
      }),
    } as unknown as Response)
    const { createAztroProvider } = await import('../../src/domain/horoscope/aztro-provider')
    const provider = createAztroProvider('/api/horoscope')
    const raw = await provider.fetchRaw({ sign: '白羊', period: '每日' })
    expect(raw.dimensions).toHaveLength(3)
    expect(raw.dimensions!.map((d) => d.name)).toEqual(
      expect.arrayContaining(['爱情', '事业', '健康']),
    )
    vi.restoreAllMocks()
  })
})

describe('horoscope 不返回陈旧内容 (SPEC-F-12)', () => {
  it('每次降级都返回新的 unavailable，非缓存旧值', async () => {
    let call = 0
    const provider = providerOf(async () => {
      call++
      if (call === 1) return goodRaw('白羊')
      throw new Error('network down')
    })
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    const ok1 = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    expect(ok1.ok).toBe(true)
    const fail2 = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    expect(fail2.ok).toBe(false)
    if (!fail2.ok) expect(fail2.error.reason).toBe('network')
  })

  it('运势失败不抛异常，恒返回 Result', async () => {
    const provider = providerOf(async () => {
      throw new Error('boom')
    })
    const service = createHoroscopeService(provider, { now: () => FIXED_NOW })
    await expect(
      service.fetchHoroscope({ sign: Sign.白羊, period: '每日' }),
    ).resolves.toHaveProperty('ok', false)
  })
})

// v1.1.0：默认来源改为本地预设 provider（离线、永远可用；SPEC-A-03 来源可替换）
describe('preset-provider 预设运势 (v1.1.0)', () => {
  const ALL_SIGNS = Object.values(Sign)

  it('12 星座 × 每日：均产出完整三维度、绝不降级', async () => {
    const service = createHoroscopeService(createPresetProvider(), {
      now: () => FIXED_NOW,
    })
    for (const sign of ALL_SIGNS) {
      const r = await service.fetchHoroscope({ sign, period: '每日' })
      expect(r.ok).toBe(true)
      if (r.ok) {
        expect(r.value.sign).toBe(sign)
        const names = r.value.dimensions.map((d) => d.name)
        expect(names).toEqual(expect.arrayContaining(['爱情', '事业', '健康']))
        r.value.dimensions.forEach((d) => {
          expect(d.text.trim()).not.toBe('')
          expect(typeof d.score).toBe('number')
        })
      }
    }
  })

  it('12 星座 × 每周：均产出非空维度、绝不降级', async () => {
    const service = createHoroscopeService(createPresetProvider(), {
      now: () => FIXED_NOW,
    })
    for (const sign of ALL_SIGNS) {
      const r = await service.fetchHoroscope({ sign, period: '每周' })
      expect(r.ok).toBe(true)
      if (r.ok) expect(r.value.dimensions.length).toBeGreaterThan(0)
    }
  })

  it('每日与每周内容不同（周期区分）', async () => {
    const service = createHoroscopeService(createPresetProvider(), {
      now: () => FIXED_NOW,
    })
    const daily = await service.fetchHoroscope({ sign: Sign.白羊, period: '每日' })
    const weekly = await service.fetchHoroscope({ sign: Sign.白羊, period: '每周' })
    if (daily.ok && weekly.ok) {
      expect(daily.value.summary).not.toBe(weekly.value.summary)
    }
  })
})
