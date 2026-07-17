// 首版第三方运势 Provider（aztro 风格 API，经 dev 代理 /api/horoscope）
// 只负责取原始响应；超时/降级/归一由 HoroscopeService 承担（ADR-003）。
// TODO(refactorer): aztro 仅提供英文每日运势，此处将其映射为爱情/事业/健康
// 三维度的中文占位归一；每周运势 aztro 无原生支持，以每日内容近似（待换源）。
import type {
  HoroscopeProvider,
  RawHoroscope,
  RawHoroscopeRequest,
} from './provider'
import { SIGN_TO_EN } from './sign-map'
import type { Sign } from '../../shared/enums'

interface AztroResponse {
  description?: string
  mood?: string
  color?: string
  lucky_number?: string
  lucky_time?: string
  compatibility?: string
}

export function createAztroProvider(baseUrl = '/api/horoscope'): HoroscopeProvider {
  return {
    async fetchRaw(req: RawHoroscopeRequest): Promise<RawHoroscope> {
      const en = SIGN_TO_EN[req.sign as Sign]
      const day = req.period === '每日' ? 'today' : 'week'
      const res = await fetch(`${baseUrl}/?sign=${en}&day=${day}`, {
        method: 'POST',
      })
      if (!res.ok) {
        return { sign: req.sign, __badStatus: res.status }
      }
      const data = (await res.json()) as AztroResponse
      const desc = data.description ?? ''
      // aztro 只给整体描述；派生三维度以满足 SPEC-D-04（内容为同一描述的分面呈现）。
      return {
        sign: req.sign,
        summary: desc,
        dimensions: [
          { name: '爱情', text: data.compatibility ? `${desc}（速配：${data.compatibility}）` : desc },
          { name: '事业', text: data.lucky_time ? `${desc}（幸运时段：${data.lucky_time}）` : desc },
          { name: '健康', text: data.mood ? `${desc}（心情：${data.mood}）` : desc },
        ],
      }
    },
  }
}
