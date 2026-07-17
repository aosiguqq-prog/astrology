// 运势板块（SPEC-U-07）
import { useCallback } from 'react'
import { Sign, type HoroscopePeriod } from '../../shared/enums'
import { SIGNS } from '../../shared/constants'
import { useHoroscopeStore } from '../../store/horoscope.store'
import { horoscopeService } from '../../domain/horoscope'
import DimensionCard from './DimensionCard'
import HoroscopeFallback from './HoroscopeFallback'
import Loading from '../common/Loading'
import EmptyState from '../common/EmptyState'
import Disclaimer from '../common/Disclaimer'

export default function HoroscopePanel() {
  const { selectedSign, period, content, status, setSign, setPeriod, setLoading, setContent, setError } =
    useHoroscopeStore()

  const load = useCallback(
    async (sign: Sign, p: HoroscopePeriod) => {
      setLoading()
      const r = await horoscopeService.fetchHoroscope({ sign, period: p })
      if (r.ok) setContent(r.value)
      else setError(r.error)
    },
    [setLoading, setContent, setError],
  )

  const onSelectSign = (sign: Sign) => {
    setSign(sign)
    void load(sign, period)
  }

  const onSelectPeriod = (p: HoroscopePeriod) => {
    setPeriod(p)
    if (selectedSign) void load(selectedSign, p)
  }

  return (
    <div className="grid gap-5">
      {/* 星座选择 */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {SIGNS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSelectSign(s)}
            className={[
              'min-h-[44px] rounded-lg border px-2 py-2 text-sm transition-colors',
              selectedSign === s
                ? 'border-gold bg-gold/15 text-gold'
                : 'border-white/10 text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 周期切换 */}
      <div className="flex gap-2">
        {(['每日', '每周'] as HoroscopePeriod[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onSelectPeriod(p)}
            className={[
              'min-h-[44px] flex-1 rounded-lg border px-3 py-2 text-sm',
              period === p ? 'border-gold text-gold' : 'border-white/10 text-text-secondary',
            ].join(' ')}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      {!selectedSign && status === 'idle' && (
        <EmptyState title="请选择一个星座" hint="选择星座后查看当期运势" />
      )}

      {status === 'loading' && <Loading label="正在获取运势…" />}

      {status === 'error' && (
        <HoroscopeFallback onRetry={() => selectedSign && load(selectedSign, period)} />
      )}

      {status === 'done' && content && (
        <div className="grid gap-4">
          <p className="text-sm text-text-secondary">
            {content.sign} ·{' '}
            {content.period === '每日'
              ? content.targetDate
              : `${content.weekStart} ~ ${content.weekEnd}`}
          </p>
          {content.summary && (
            <div className="rounded-xl border border-gold/25 bg-bg-panel/70 p-4 text-sm text-text-primary">
              {content.summary}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            {content.dimensions.map((d) => (
              <DimensionCard key={d.name} dimension={d} />
            ))}
          </div>
          <Disclaimer />
        </div>
      )}
    </div>
  )
}
