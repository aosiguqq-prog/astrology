// 出生信息表单（SPEC-U-03/04 / SPEC-F-01）
import { useState } from 'react'
import type { CityEntry } from '../../shared/types'
import { resolvePlace } from '../../domain/geocoding/geocoder'
import { generateChart } from '../../domain/chart-flow'
import { useChartStore } from '../../store/chart.store'

// 当前系统年（仅用于表单上限校验，非星历计算 —— 允许 SPEC-F-01）。
const CURRENT_YEAR = new Date().getFullYear()

function isValidDate(date: string): 'ok' | 'empty' | 'range' {
  if (!date) return 'empty'
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return 'range'
  const year = Number(m[1])
  const d = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return 'range'
  const today = new Date()
  if (year < 1900) return 'range'
  if (d.getTime() > today.getTime()) return 'range'
  return 'ok'
}

export default function BirthForm() {
  const form = useChartStore((s) => s.form)
  const setForm = useChartStore((s) => s.setForm)
  const setResolvedCity = useChartStore((s) => s.setResolvedCity)
  const setNatalChart = useChartStore((s) => s.setNatalChart)
  const setStatus = useChartStore((s) => s.setStatus)
  const setError = useChartStore((s) => s.setError)

  const [dateError, setDateError] = useState('')
  const [placeError, setPlaceError] = useState('')
  const [candidates, setCandidates] = useState<CityEntry[]>([])

  const onPlaceInput = (value: string) => {
    setForm({ placeName: value })
    setResolvedCity(null)
    setCandidates([])
    setPlaceError('')
    if (value.trim() === '') return
    const r = resolvePlace(value)
    if (r.ok) {
      if (r.value.kind === 'exact') {
        setResolvedCity(r.value.city)
      } else {
        setCandidates(r.value.candidates)
      }
    } else if (r.error === 'unrecognized') {
      setPlaceError('出生地点无法识别，请重新选择城市')
    }
  }

  const chooseCandidate = (city: CityEntry) => {
    setResolvedCity(city)
    setForm({ placeName: city.name })
    setCandidates([])
    setPlaceError('')
  }

  const onSubmit = () => {
    setDateError('')
    setPlaceError('')

    const dateStatus = isValidDate(form.date)
    if (dateStatus === 'empty') {
      setDateError('出生日期为必填项')
      return
    }
    if (dateStatus === 'range') {
      setDateError('出生日期超出可用范围')
      return
    }
    if (!form.resolvedCity) {
      setPlaceError('请选择出生地点')
      return
    }

    setStatus('loading')
    const result = generateChart({
      date: form.date,
      time: form.time || undefined,
      timeUnknown: form.timeUnknown,
      city: form.resolvedCity,
    })
    if (result.ok) {
      setNatalChart(result.value)
    } else if (result.error === 'invalid_date') {
      setError('出生日期超出可用范围')
      setDateError('出生日期超出可用范围')
    } else {
      setError('出生地点无法识别，请重新选择城市')
      setPlaceError('出生地点无法识别，请重新选择城市')
    }
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-bg-panel/60 p-5">
      <div className="grid gap-4">
        {/* 出生日期 */}
        <label className="block">
          <span className="text-sm text-text-secondary">
            出生日期 <span className="text-accent-red">*</span>
          </span>
          <input
            type="date"
            min="1900-01-01"
            max={`${CURRENT_YEAR}-12-31`}
            value={form.date}
            onChange={(e) => setForm({ date: e.target.value })}
            className="mt-1 w-full rounded-lg border border-white/10 bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-gold"
          />
          {dateError && <span className="mt-1 block text-sm text-accent-red">{dateError}</span>}
        </label>

        {/* 出生时间 + 时间未知 */}
        <div>
          <span className="text-sm text-text-secondary">出生时间</span>
          <div className="mt-1 flex items-center gap-3">
            <input
              type="time"
              value={form.time}
              disabled={form.timeUnknown}
              onChange={(e) => setForm({ time: e.target.value })}
              className="flex-1 rounded-lg border border-white/10 bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-gold disabled:opacity-40"
            />
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={form.timeUnknown}
                onChange={(e) => setForm({ timeUnknown: e.target.checked })}
                className="h-4 w-4 accent-gold"
              />
              时间未知
            </label>
          </div>
          {form.timeUnknown && (
            <p className="mt-1 text-xs text-text-secondary">
              将生成不含上升与宫位的降级星盘
            </p>
          )}
        </div>

        {/* 出生地点 */}
        <div>
          <span className="text-sm text-text-secondary">
            出生地点 <span className="text-accent-red">*</span>
          </span>
          <input
            type="text"
            value={form.placeName}
            placeholder="如：北京 / 上海 / 东京"
            onChange={(e) => onPlaceInput(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-gold"
          />
          {form.resolvedCity && candidates.length === 0 && (
            <p className="mt-1 text-xs text-gold">
              已选定：{form.resolvedCity.name}
              {form.resolvedCity.province ? ` · ${form.resolvedCity.province}` : ''}
            </p>
          )}
          {candidates.length > 0 && (
            <ul className="mt-1 max-h-40 overflow-auto rounded-lg border border-white/10 bg-bg-primary">
              {candidates.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => chooseCandidate(c)}
                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-gold/10"
                  >
                    {c.name}
                    {c.province ? ` · ${c.province}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {placeError && <span className="mt-1 block text-sm text-accent-red">{placeError}</span>}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          className="min-h-[44px] rounded-lg bg-gold px-4 py-2 font-medium text-bg-primary transition-opacity hover:opacity-90"
        >
          生成本命盘
        </button>
      </div>
    </div>
  )
}
