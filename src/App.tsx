import { useNavStore } from './store/nav.store'
import AppShell from './ui/layout/AppShell'
import ErrorBoundary from './ui/common/ErrorBoundary'
import ChartPanel from './ui/chart/ChartPanel'
import HoroscopePanel from './ui/horoscope/HoroscopePanel'
import EncyclopediaPanel from './ui/encyclopedia/EncyclopediaPanel'

export default function App() {
  const currentPanel = useNavStore((s) => s.currentPanel)

  // 各板块以 ErrorBoundary 隔离（SPEC-N-07）；用 hidden 保留状态而非卸载，
  // 满足「切换后再切回状态保持」（SPEC-F-15）。
  return (
    <AppShell>
      <div hidden={currentPanel !== 'chart'}>
        <ErrorBoundary>
          <ChartPanel />
        </ErrorBoundary>
      </div>
      <div hidden={currentPanel !== 'horoscope'}>
        <ErrorBoundary>
          <HoroscopePanel />
        </ErrorBoundary>
      </div>
      <div hidden={currentPanel !== 'encyclopedia'}>
        <ErrorBoundary>
          <EncyclopediaPanel />
        </ErrorBoundary>
      </div>
    </AppShell>
  )
}
