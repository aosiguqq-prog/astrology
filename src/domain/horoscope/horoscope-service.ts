// SPEC-A-03 运势获取模块 · 超时 / 归一 / 五类降级
// 对外只暴露「内容」或「降级」，任一失败均不抛异常、不返回陈旧内容。
import { ok, err, type Result } from '../../shared/result'
import type {
  HoroscopeContent,
  HoroscopeRequest,
  HoroscopeUnavailable,
  HoroscopeDimension,
} from '../../shared/types'
import type { HoroscopeProvider, RawHoroscope } from './provider'
import { targetDate, targetWeek } from './target-period'

const REQUIRED_DIMENSIONS = ['爱情', '事业', '健康']
const DEFAULT_TIMEOUT_MS = 8000 // SPEC-N-05

export interface HoroscopeServiceOptions {
  now?: () => Date
  timeoutMs?: number
}

export interface HoroscopeService {
  fetchHoroscope(
    req: HoroscopeRequest,
  ): Promise<Result<HoroscopeContent, HoroscopeUnavailable>>
}

const TIMEOUT = Symbol('timeout')

export function createHoroscopeService(
  provider: HoroscopeProvider,
  options: HoroscopeServiceOptions = {},
): HoroscopeService {
  const now = options.now ?? (() => new Date())
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

  return {
    async fetchHoroscope(req) {
      const nowDate = now()

      // 依系统日期派生目标日期/周（SPEC-F-10）。
      const isDaily = req.period === '每日'
      const date = targetDate(nowDate)
      const week = targetWeek(nowDate)

      // 超时竞速（SPEC-N-05：8s）。
      let raw: RawHoroscope
      try {
        let timer: ReturnType<typeof setTimeout>
        const timeoutPromise = new Promise<typeof TIMEOUT>((resolve) => {
          timer = setTimeout(() => resolve(TIMEOUT), timeoutMs)
        })
        const result = await Promise.race([
          provider.fetchRaw({
            sign: req.sign,
            period: req.period,
            targetDate: isDaily ? date : undefined,
            weekStart: isDaily ? undefined : week.weekStart,
            weekEnd: isDaily ? undefined : week.weekEnd,
          }),
          timeoutPromise,
        ])
        clearTimeout(timer!)
        if (result === TIMEOUT) {
          return err<HoroscopeUnavailable>({ reason: 'timeout' })
        }
        raw = result
      } catch {
        // Provider 抛出 → 网络错误。
        return err<HoroscopeUnavailable>({ reason: 'network' })
      }

      // 非成功响应状态。
      if (raw && typeof raw === 'object' && typeof raw.__badStatus === 'number') {
        return err<HoroscopeUnavailable>({ reason: 'bad_status' })
      }

      // 结构不可解析。
      if (!raw || typeof raw !== 'object' || typeof raw.sign !== 'string') {
        return err<HoroscopeUnavailable>({ reason: 'parse_error' })
      }
      if (!Array.isArray(raw.dimensions)) {
        return err<HoroscopeUnavailable>({ reason: 'parse_error' })
      }

      // 归一化维度。
      const dimensions: HoroscopeDimension[] = raw.dimensions
        .filter(
          (d) =>
            d &&
            typeof d.name === 'string' &&
            typeof d.text === 'string' &&
            d.text.trim() !== '',
        )
        .map((d) => ({
          name: d.name,
          text: d.text,
          ...(typeof d.score === 'number' ? { score: d.score } : {}),
        }))

      // 每日必含爱情/事业/健康三项（SPEC-A-03 / D-04）。
      if (isDaily) {
        const names = new Set(dimensions.map((d) => d.name))
        const complete = REQUIRED_DIMENSIONS.every((n) => names.has(n))
        if (!complete) {
          return err<HoroscopeUnavailable>({ reason: 'incomplete' })
        }
      } else if (dimensions.length === 0) {
        return err<HoroscopeUnavailable>({ reason: 'incomplete' })
      }

      // 星座严格对应：以请求星座为准（SPEC-F-10）。
      const content: HoroscopeContent = {
        sign: req.sign,
        period: req.period,
        dimensions,
        ...(raw.summary ? { summary: raw.summary } : {}),
        ...(isDaily
          ? { targetDate: date }
          : { weekStart: week.weekStart, weekEnd: week.weekEnd }),
      }

      return ok(content)
    },
  }
}
