// SPEC-A-01 地理编码模块 · resolvePlace
// 纯本地、零网络、纯确定性（SPEC-F-02 / SPEC-F-08）。
import { ok, err, type Result } from '../../shared/result'
import type { CityEntry, GeocodeResolved, GeocodeError } from '../../shared/types'
import { normalizePlaceName, matchKey } from './normalize'
import rawCities from './data/cities.json'

const CITIES: CityEntry[] = rawCities as CityEntry[]

export function resolvePlace(
  placeName: string,
): Result<GeocodeResolved, GeocodeError> {
  const normalized = normalizePlaceName(placeName)
  if (normalized === '') {
    return err('empty_input')
  }

  const key = matchKey(placeName)

  // 精确匹配：名称或别名（忽略大小写与空白）。
  const exactMatches = CITIES.filter((city) => {
    if (matchKey(city.name) === key) return true
    return city.aliases.some((alias) => matchKey(alias) === key)
  })

  if (exactMatches.length === 1) {
    return ok({ kind: 'exact', city: exactMatches[0] })
  }
  if (exactMatches.length >= 2) {
    // 同名/别名命中多条 → 候选列表，由用户选定（SPEC-F-02 / SPEC-U-04）。
    return ok({ kind: 'candidates', candidates: exactMatches })
  }

  // 无精确命中：单向前缀候选——城市名/别名以用户输入为前缀（SPEC-F-02 步骤 3）。
  // 只允许 nameKey.startsWith(key)，不允许反向 key.startsWith(nameKey)，
  // 避免「上海人民广场」被误判为「上海」的候选（SPEC-A-01 验收点 3 / B1 修复）。
  const prefixCandidates = key.length < 1 ? [] : CITIES.filter((city) => {
    const nameKey = matchKey(city.name)
    if (nameKey.startsWith(key)) return true
    return city.aliases.some((alias) => matchKey(alias).startsWith(key))
  })

  if (prefixCandidates.length >= 1) {
    return ok({ kind: 'candidates', candidates: prefixCandidates })
  }

  return err('unrecognized')
}
