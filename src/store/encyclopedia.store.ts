// 百科 store · 会话内存
import { create } from 'zustand'
import type { EncyclopediaEntry } from '../shared/types'
import { listEntries, search } from '../domain/encyclopedia/encyclopedia-service'

interface EncyclopediaState {
  query: string
  results: EncyclopediaEntry[]
  currentEntry: EncyclopediaEntry | null
  setQuery: (query: string) => void
  setCurrentEntry: (entry: EncyclopediaEntry | null) => void
}

export const useEncyclopediaStore = create<EncyclopediaState>((set) => ({
  query: '',
  results: listEntries(),
  currentEntry: null,
  setQuery: (query) => set({ query, results: search(query) }),
  setCurrentEntry: (entry) => set({ currentEntry: entry }),
}))
