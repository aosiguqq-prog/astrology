// 百科词条详情（SPEC-U-08）：名称 + 符号 + 象征 + 关键词 + 解释
import type { EncyclopediaEntry } from '../../shared/types'

export default function EntryDetail({ entry }: { entry: EncyclopediaEntry }) {
  return (
    <div className="rounded-2xl border border-gold/25 bg-bg-panel/70 p-5">
      <div className="flex items-center gap-4">
        <span className="text-4xl text-gold" aria-hidden>
          {entry.symbol}
        </span>
        <div>
          <h3 className="text-xl text-gold-light">{entry.name}</h3>
          <p className="text-sm text-text-secondary">{entry.category}</p>
        </div>
      </div>

      <section className="mt-4">
        <h4 className="text-sm text-text-secondary">象征</h4>
        <p className="text-text-primary">{entry.symbolism}</p>
      </section>

      <section className="mt-4">
        <h4 className="text-sm text-text-secondary">关键词</h4>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {entry.keywords.map((k) => (
            <span key={k} className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-gold">
              {k}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <h4 className="text-sm text-text-secondary">解释</h4>
        <p className="leading-relaxed text-text-primary">{entry.explanation}</p>
      </section>
    </div>
  )
}
