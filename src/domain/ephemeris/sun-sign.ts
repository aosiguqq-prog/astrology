// SPEC-F-05 太阳星座判定（场景 1：仅按月/日，C-SUN 表）
// 快速判断，不调用星历（SPEC-F-05 注）。纯函数、确定性。
import type { Sign } from '../../shared/enums'
import { SUN_SIGN_BOUNDARIES } from '../../shared/constants'
import { ok, err, type Result } from '../../shared/result'

// 将 (month, day) 编码为一个可比较的序数（month*100 + day）。
function ordinal(month: number, day: number): number {
  return month * 100 + day
}

// 内部实现：按月/日判定太阳星座。
function sunSignByMonthDay(month: number, day: number): Sign | null {
  const value = ordinal(month, day)
  for (const b of SUN_SIGN_BOUNDARIES) {
    const start = ordinal(b.start.month, b.start.day)
    const end = ordinal(b.end.month, b.end.day)
    if (start <= end) {
      if (value >= start && value <= end) return b.sign
    } else {
      // 跨年区间（摩羯：12月22日 ~ 次年1月19日）。
      if (value >= start || value <= end) return b.sign
    }
  }
  // C-SUN 表覆盖全年（1月1日起）；此分支在合法 month/day 下不可达。
  throw new Error(`unreachable: sunSignByMonthDay(${month}, ${day})`)
}

// SPEC-A-02 公开接口：接收 "YYYY-MM-DD" 字符串，返回 Result。（I1 修复）
export function sunSignByDate(date: string): Result<Sign, 'invalid_date'> {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!m) return err('invalid_date')
  const month = parseInt(m[2], 10)
  const day = parseInt(m[3], 10)
  if (month < 1 || month > 12 || day < 1 || day > 31) return err('invalid_date')
  try {
    const sign = sunSignByMonthDay(month, day)
    if (sign === null) return err('invalid_date')
    return ok(sign)
  } catch {
    return err('invalid_date')
  }
}

// 向后兼容：供测试与内部调用的 (month, day) 形式。
export function sunSignByMonthDayRaw(month: number, day: number): Sign {
  return sunSignByMonthDay(month, day)!
}
