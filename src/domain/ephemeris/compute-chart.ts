// SPEC-A-02 星历计算模块 · computeChart
// 纯确定性、无网络、不读系统时钟（SPEC-F-03/F-08）。
import { ok, err, type Result } from '../../shared/result'
import type {
  ChartInput,
  NatalChart,
  EphemerisError,
  PlanetPlacement,
} from '../../shared/types'
import { Planet } from '../../shared/enums'
import { UNAVAILABLE } from '../../shared/constants'
import { parseBirthDateTime, toJulianDay } from '../../shared/time'
import { longitudeToSign } from './planets'
import { planetLongitudes } from './planet-longitudes'
import { calcAspects } from './aspects'
import {
  localSiderealTime,
  computeAscendant,
  computeMidheaven,
  computeHouses,
  houseOfLongitude,
  ascendantResult,
  midheavenResult,
} from './houses'

export function computeChart(input: ChartInput): Result<NatalChart, EphemerisError> {
  if (!input || !input.city) {
    return err('missing_city')
  }

  // 校验日期（含范围 1900-01-01 起、闰年真实性）。
  const dateParts = parseBirthDateTime(input.date, undefined)
  if (dateParts === null) {
    return err('invalid_date')
  }
  if (dateParts.year < 1900) {
    return err('invalid_date')
  }

  const degraded = input.timeUnknown || input.time === undefined || input.time === ''

  // 时刻构造：降级用正午 12:00，否则用给定时间。
  const parts = degraded
    ? { ...dateParts, hour: 12, minute: 0 }
    : parseBirthDateTime(input.date, input.time)

  if (parts === null) {
    return err('invalid_date')
  }

  const jd = toJulianDay(parts, input.city.timezone)
  if (jd === null) {
    return err('invalid_date')
  }

  // 行星黄经 → 落座。
  const longitudes = planetLongitudes(jd)
  const sun = longitudes.find((p) => p.planet === Planet.太阳)!
  const sunSign = longitudeToSign(sun.longitude).sign

  if (degraded) {
    const planets: PlanetPlacement[] = longitudes.map((p) => {
      const { sign, degree } = longitudeToSign(p.longitude)
      return {
        planet: p.planet,
        sign,
        degree,
        longitude: p.longitude,
        house: UNAVAILABLE,
      }
    })
    return ok({
      hasTime: false,
      sunSign,
      planets,
      ascendant: UNAVAILABLE,
      midheaven: UNAVAILABLE,
      houses: UNAVAILABLE,
      aspects: [],
      ascendantAvailable: false,
      housesAvailable: false,
    })
  }

  // 完整路径：ASC/MC/宫位/相位。
  const lst = localSiderealTime(jd, input.city.longitude)
  const ascLon = computeAscendant(lst, input.city.latitude)
  const mcLon = computeMidheaven(lst)
  const houses = computeHouses(ascLon)

  const planets: PlanetPlacement[] = longitudes.map((p) => {
    const { sign, degree } = longitudeToSign(p.longitude)
    return {
      planet: p.planet,
      sign,
      degree,
      longitude: p.longitude,
      house: houseOfLongitude(p.longitude, houses),
    }
  })

  const aspects = calcAspects(longitudes)

  return ok({
    hasTime: true,
    sunSign,
    planets,
    ascendant: ascendantResult(ascLon),
    midheaven: midheavenResult(mcLon),
    houses,
    aspects,
    ascendantAvailable: true,
    housesAvailable: true,
  })
}
