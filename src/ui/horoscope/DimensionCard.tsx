// 运势维度卡（SPEC-U-07）
import type { HoroscopeDimension } from '../../shared/types'

export default function DimensionCard({ dimension }: { dimension: HoroscopeDimension }) {
  return (
    <div className="rounded-xl border border-gold/25 bg-bg-panel/70 p-4">
      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-gold-light">{dimension.name}</h4>
        {typeof dimension.score === 'number' && (
          <span className="text-sm text-gold" aria-label={`评分 ${dimension.score} 分`}>
            {'★'.repeat(dimension.score)}
            <span className="text-text-secondary">{'★'.repeat(Math.max(0, 5 - dimension.score))}</span>
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-text-primary">{dimension.text}</p>
    </div>
  )
}
