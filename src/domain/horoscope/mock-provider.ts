// 测试/开发用 Mock Provider（SPEC-A-03 / ADR-003）
import type {
  HoroscopeProvider,
  RawHoroscope,
  RawHoroscopeRequest,
} from './provider'

// 返回一份完整的合成运势，星座严格回显请求值。
export function createMockProvider(): HoroscopeProvider {
  return {
    async fetchRaw(req: RawHoroscopeRequest): Promise<RawHoroscope> {
      return {
        sign: req.sign,
        summary: '整体运势平稳，宜保持乐观。',
        dimensions: [
          { name: '爱情', text: '与人交流顺畅，感情升温。', score: 4 },
          { name: '事业', text: '专注当下任务，稳步推进。', score: 3 },
          { name: '健康', text: '注意作息规律，适度运动。', score: 4 },
        ],
      }
    },
  }
}
