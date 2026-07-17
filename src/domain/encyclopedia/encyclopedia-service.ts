// SPEC-A-04 百科查询模块 · 纯本地、纯确定性
import { ok, err, type Result } from '../../shared/result'
import type { EncyclopediaEntry } from '../../shared/types'
import rawEntries from './data/entries.json'

const ENTRIES: EncyclopediaEntry[] = rawEntries as EncyclopediaEntry[]

export function listEntries(): EncyclopediaEntry[] {
  return ENTRIES
}

export function getEntry(id: string): Result<EncyclopediaEntry, 'not_found'> {
  const entry = ENTRIES.find((e) => e.id === id)
  return entry ? ok(entry) : err('not_found')
}

export function getEntryByName(name: string): Result<EncyclopediaEntry, 'not_found'> {
  const key = name.trim()
  const entry = ENTRIES.find((e) => e.name === key)
  return entry ? ok(entry) : err('not_found')
}

// 子串、不区分大小写、去首尾空白；空关键词返回全部 22 条（SPEC-F-11）。
export function search(keyword: string): EncyclopediaEntry[] {
  const key = keyword.trim().toLowerCase()
  if (key === '') return ENTRIES

  return ENTRIES.filter((e) => {
    if (e.name.toLowerCase().includes(key)) return true
    return e.keywords.some((k) => k.toLowerCase().includes(key))
  })
}
