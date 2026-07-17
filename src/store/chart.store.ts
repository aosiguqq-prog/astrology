// 星盘 store · 会话内存（不持久化, SPEC-N-03）
import { create } from 'zustand'
import type { NatalChart, CityEntry } from '../shared/types'

export type ChartStatus = 'idle' | 'loading' | 'error' | 'done'

export interface BirthFormValues {
  date: string
  time: string
  timeUnknown: boolean
  placeName: string
  resolvedCity: CityEntry | null
}

interface ChartState {
  form: BirthFormValues
  natalChart: NatalChart | null
  status: ChartStatus
  errorMessage: string
  setForm: (patch: Partial<BirthFormValues>) => void
  setResolvedCity: (city: CityEntry | null) => void
  setNatalChart: (chart: NatalChart) => void
  setStatus: (status: ChartStatus) => void
  setError: (message: string) => void
  reset: () => void
}

const initialForm: BirthFormValues = {
  date: '',
  time: '',
  timeUnknown: false,
  placeName: '',
  resolvedCity: null,
}

export const useChartStore = create<ChartState>((set) => ({
  form: initialForm,
  natalChart: null,
  status: 'idle',
  errorMessage: '',
  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  setResolvedCity: (city) =>
    set((s) => ({ form: { ...s.form, resolvedCity: city } })),
  setNatalChart: (chart) =>
    set({ natalChart: chart, status: 'done', errorMessage: '' }),
  setStatus: (status) => set({ status }),
  setError: (message) => set({ status: 'error', errorMessage: message }),
  reset: () =>
    set({ form: initialForm, natalChart: null, status: 'idle', errorMessage: '' }),
}))
