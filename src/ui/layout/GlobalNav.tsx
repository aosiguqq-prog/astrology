// 全局导航（SPEC-U-02）：星盘 / 运势 / 百科，当前项金色高亮
import { useNavStore, type Panel } from '../../store/nav.store'

const ITEMS: { key: Panel; label: string; symbol: string }[] = [
  { key: 'chart', label: '星盘', symbol: '✦' },
  { key: 'horoscope', label: '运势', symbol: '☽' },
  { key: 'encyclopedia', label: '百科', symbol: '☿' },
]

export default function GlobalNav() {
  const currentPanel = useNavStore((s) => s.currentPanel)
  const setPanel = useNavStore((s) => s.setPanel)

  return (
    <nav
      aria-label="全局导航"
      className="flex items-center justify-center gap-2 sm:gap-6"
    >
      {ITEMS.map((item) => {
        const active = currentPanel === item.key
        return (
          <button
            key={item.key}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => setPanel(item.key)}
            className={[
              'min-h-[44px] px-4 py-2 text-sm sm:text-base transition-colors border-b-2',
              active
                ? 'text-gold border-gold'
                : 'text-text-secondary border-transparent hover:text-text-primary',
            ].join(' ')}
          >
            <span className="mr-1" aria-hidden>
              {item.symbol}
            </span>
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
