// 导航 store · 当前板块（默认「星盘」, SPEC-F-15 / SPEC-U-02）
import { create } from 'zustand'

export type Panel = 'chart' | 'horoscope' | 'encyclopedia'

interface NavState {
  currentPanel: Panel
  setPanel: (panel: Panel) => void
}

export const useNavStore = create<NavState>((set) => ({
  currentPanel: 'chart',
  setPanel: (panel) => set({ currentPanel: panel }),
}))
