// 运势服务默认实例
// v1.1.0 起默认使用本地预设 provider（离线、永远可用；替代不可用的 aztro API，见 review M1/M2）。
// aztro-provider 保留导出，作为日后换回真实 API 的备选（ADR-003：来源可替换）。
import { createHoroscopeService } from './horoscope-service'
import { createPresetProvider } from './preset-provider'

export const horoscopeService = createHoroscopeService(createPresetProvider(), {
  now: () => new Date(),
})

export { createHoroscopeService } from './horoscope-service'
export { createMockProvider } from './mock-provider'
export { createPresetProvider } from './preset-provider'
export { createAztroProvider } from './aztro-provider'
