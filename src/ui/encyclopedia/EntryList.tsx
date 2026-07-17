// 百科词条列表（SPEC-U-08）
import { useEncyclopediaStore } from '../../store/encyclopedia.store'
import { EntryCategory } from '../../shared/enums'
import EmptyState from '../common/EmptyState'

export default function EntryList() {
  const results = useEncyclopediaStore((s) => s.results)
  const setCurrentEntry = useEncyclopediaStore((s) => s.setCurrentEntry)
  const currentEntry = useEncyclopediaStore((s) => s.currentEntry)

  if (results.length === 0) {
    return <EmptyState title="未找到相关词条" />
  }

  return (
    <ul className="grid gap-2">
      {results.map((e) => {
        const active = currentEntry?.id === e.id
        return (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => setCurrentEntry(e)}
              className={[
                'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors',
                active
                  ? 'border-gold bg-gold/10'
                  : 'border-white/10 hover:bg-gold/5',
              ].join(' ')}
            >
              <span className="text-xl text-gold" aria-hidden>
                {e.symbol}
              </span>
              <span className="flex-1 text-text-primary">{e.name}</span>
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-xs',
                  e.category === EntryCategory.星座
                    ? 'bg-gold/15 text-gold'
                    : 'bg-white/10 text-text-secondary',
                ].join(' ')}
              >
                {e.category}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
