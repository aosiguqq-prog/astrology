// 百科板块容器（SPEC-U-08）
import { useEncyclopediaStore } from '../../store/encyclopedia.store'
import SearchBar from './SearchBar'
import EntryList from './EntryList'
import EntryDetail from './EntryDetail'
import EmptyState from '../common/EmptyState'

export default function EncyclopediaPanel() {
  const currentEntry = useEncyclopediaStore((s) => s.currentEntry)

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
      <section className="grid gap-3">
        <SearchBar />
        <EntryList />
      </section>

      <section>
        {currentEntry ? (
          <EntryDetail entry={currentEntry} />
        ) : (
          <EmptyState title="选择一个词条" hint="点击左侧列表查看星座或行星详情" />
        )}
      </section>
    </div>
  )
}
