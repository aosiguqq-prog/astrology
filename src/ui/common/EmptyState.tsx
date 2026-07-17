// 空态（SPEC-U-09）
import type { ReactNode } from 'react'

export default function EmptyState({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-bg-panel/60 px-6 py-10 text-center">
      <p className="text-text-primary">{title}</p>
      {hint && <p className="text-sm text-text-secondary">{hint}</p>}
      {action}
    </div>
  )
}
