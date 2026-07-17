// 应用外壳（SPEC-U-01）：暗色布局 + 顶部标题栏 + 全局导航 + 内容区
import type { ReactNode } from 'react'
import GlobalNav from './GlobalNav'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <header className="sticky top-0 z-10 border-b border-white/5 bg-bg-primary/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-3">
          <h1 className="text-lg font-semibold tracking-wide text-gold-light">
            ✦ 星语 · 占星
          </h1>
          <GlobalNav />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-4xl px-4 pb-8 pt-4 text-center text-xs text-text-secondary">
        ⚠️ 仅供娱乐参考，不构成任何专业建议 · 访客模式，无需注册登录
      </footer>
    </div>
  )
}
