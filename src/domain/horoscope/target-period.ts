// SPEC-F-10 目标日期/目标周计算
// 依「当前系统日期」派生；now 由外部注入以保持可测（真实运行传 () => new Date()）。

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

// 以 UTC 日历日格式化 YYYY-MM-DD（确定性，不随运行时区漂移）。
export function formatDate(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

// 目标日期 = 当前系统日期。
export function targetDate(now: Date): string {
  return formatDate(now)
}

// 目标周 = 当前系统日期所在自然周（周一起始，周日结束）。
export function targetWeek(now: Date): { weekStart: string; weekEnd: string } {
  const day = now.getUTCDay() // 0=周日,1=周一,...6=周六
  const offsetToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + offsetToMonday)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return { weekStart: formatDate(monday), weekEnd: formatDate(sunday) }
}
