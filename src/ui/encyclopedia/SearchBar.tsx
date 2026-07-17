// 百科搜索框（SPEC-U-08）
import { useEncyclopediaStore } from '../../store/encyclopedia.store'

export default function SearchBar() {
  const query = useEncyclopediaStore((s) => s.query)
  const setQuery = useEncyclopediaStore((s) => s.setQuery)

  return (
    <input
      type="search"
      value={query}
      placeholder="搜索行星或星座"
      onChange={(e) => setQuery(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-gold"
    />
  )
}
