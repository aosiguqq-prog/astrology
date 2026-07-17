// 运势 store · 会话内存
import { create } from 'zustand'
import type { Sign, HoroscopePeriod } from '../shared/enums'
import type { HoroscopeContent, HoroscopeUnavailable } from '../shared/types'

export type HoroscopeStatus = 'idle' | 'loading' | 'error' | 'done'

interface HoroscopeState {
  selectedSign: Sign | null
  period: HoroscopePeriod
  content: HoroscopeContent | null
  status: HoroscopeStatus
  error: HoroscopeUnavailable | null
  setSign: (sign: Sign) => void
  setPeriod: (period: HoroscopePeriod) => void
  setLoading: () => void
  setContent: (content: HoroscopeContent) => void
  setError: (error: HoroscopeUnavailable) => void
}

export const useHoroscopeStore = create<HoroscopeState>((set) => ({
  selectedSign: null,
  period: '每日',
  content: null,
  status: 'idle',
  error: null,
  setSign: (sign) => set({ selectedSign: sign }),
  setPeriod: (period) => set({ period }),
  setLoading: () => set({ status: 'loading', error: null }),
  setContent: (content) => set({ content, status: 'done', error: null }),
  setError: (error) => set({ status: 'error', error, content: null }),
}))
