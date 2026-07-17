// 运势降级空态（SPEC-F-12 / SPEC-U-07）
import EmptyState from '../common/EmptyState'

export default function HoroscopeFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      title="运势内容暂时无法获取，请稍后再试"
      action={
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[44px] rounded-lg border border-gold/50 px-4 py-2 text-sm text-gold hover:bg-gold/10"
        >
          重试
        </button>
      }
    />
  )
}
