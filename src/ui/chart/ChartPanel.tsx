// 星盘板块容器（SPEC-U-05）
import { useState } from 'react'
import { useChartStore } from '../../store/chart.store'
import type { PlanetPlacement } from '../../shared/types'
import BirthForm from './BirthForm'
import ChartWheel from './ChartWheel'
import PlacementList from './PlacementList'
import InterpretationCard from './InterpretationCard'
import Loading from '../common/Loading'
import EmptyState from '../common/EmptyState'

export default function ChartPanel() {
  const status = useChartStore((s) => s.status)
  const natalChart = useChartStore((s) => s.natalChart)
  const [selected, setSelected] = useState<PlanetPlacement | null>(null)

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
      <section>
        <h2 className="mb-3 text-base text-gold-light">出生信息</h2>
        <BirthForm />
      </section>

      <section>
        <h2 className="mb-3 text-base text-gold-light">本命盘</h2>
        {status === 'loading' && <Loading label="正在推算星盘…" />}

        {status !== 'loading' && !natalChart && (
          <EmptyState
            title="尚未生成星盘"
            hint="填写左侧出生信息并点击「生成本命盘」"
          />
        )}

        {natalChart && status !== 'loading' && (
          <div className="grid gap-5">
            <ChartWheel chart={natalChart} />
            <PlacementList chart={natalChart} onSelect={setSelected} />
          </div>
        )}
      </section>

      {selected && (
        <InterpretationCard
          planet={selected.planet}
          sign={selected.sign}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
