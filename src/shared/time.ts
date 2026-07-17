// luxon 封装：本地时刻 + IANA 时区 → UTC → 儒略日
// 纯确定性：完全由显式输入决定，不读系统时钟（SPEC-F-08）。
import { DateTime } from 'luxon'

export interface DateParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

// 解析 'YYYY-MM-DD' + 可选 'HH:mm'（无时间时用 12:00 正午，SPEC-F-03 降级）。
export function parseBirthDateTime(
  date: string,
  time: string | undefined,
): DateParts | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!dateMatch) return null
  const year = Number(dateMatch[1])
  const month = Number(dateMatch[2])
  const day = Number(dateMatch[3])

  let hour = 12
  let minute = 0
  if (time !== undefined && time !== '') {
    const timeMatch = /^(\d{2}):(\d{2})$/.exec(time)
    if (!timeMatch) return null
    hour = Number(timeMatch[1])
    minute = Number(timeMatch[2])
    if (hour > 23 || minute > 59) return null
  }

  // 用 luxon 严格校验日期真实性（含闰年）。
  const dt = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: 'utc' },
  )
  if (!dt.isValid) return null

  return { year, month, day, hour, minute }
}

// 本地时刻 + IANA 时区 → 儒略日（UT）。
export function toJulianDay(parts: DateParts, timezone: string): number | null {
  const dt = DateTime.fromObject(
    {
      year: parts.year,
      month: parts.month,
      day: parts.day,
      hour: parts.hour,
      minute: parts.minute,
    },
    { zone: timezone },
  )
  if (!dt.isValid) return null

  const utc = dt.toUTC()
  // 儒略日：Unix 毫秒 / 86400000 + 2440587.5。
  return utc.toMillis() / 86400000 + 2440587.5
}
