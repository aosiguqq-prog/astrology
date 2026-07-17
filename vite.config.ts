/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/astrology/',
  server: {
    proxy: {
      // 运势 API 走 dev 代理解决 CORS（ADR-001/003）。
      '/api/horoscope': {
        target: 'https://aztro.sameerkumar.website',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/horoscope/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      // 统计已 TDD 的 domain/shared 逻辑层与已单测的纯函数几何；
      // 其余 UI 组件由后续 UI 单元/E2E 覆盖。
      include: ['src/domain/**', 'src/shared/**', 'src/ui/chart/chart-geometry.ts'],
      exclude: [
        'src/shared/types.ts', // 纯类型声明，无可执行代码
        'src/domain/horoscope/provider.ts', // 纯接口声明
        'src/domain/horoscope/mock-provider.ts', // 开发/集成用注入实现（UI 阶段接线）
        'src/domain/horoscope/aztro-provider.ts', // 真实 API 适配器（网络，UI/集成阶段验证）
        'src/domain/horoscope/index.ts', // 生产实例接线（组合根）
        'src/domain/horoscope/sign-map.ts', // 纯静态映射表（由 aztro-provider 使用）
      ],
      thresholds: { lines: 80, branches: 80 },
    },
  },
})
