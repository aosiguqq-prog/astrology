import type { Config } from 'tailwindcss'

// Tailwind v4：色板令牌定义于 src/index.css 的 @theme（设计令牌）。
// 本文件仅声明内容扫描范围。
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
} satisfies Config
