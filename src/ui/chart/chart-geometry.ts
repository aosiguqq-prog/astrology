// 星盘几何 · 纯函数（黄经→SVG 坐标）· 可单测（架构 §1.3-5）
// 约定：黄经 0° 置于星盘左侧（东方，上升点惯例），逆时针增加。
// 但为通用性提供参数化：默认 0°=左（180° 屏幕角），可覆盖。

export interface Point2D {
  x: number
  y: number
}

// 黄经 → SVG 坐标。lon 逆时针增长，0° 在屏幕左侧（西/东方位惯例见渲染层）。
// screenAngle(度) = 180 - lon（左为 0°，逆时针）。
export function lonToPoint(
  lon: number,
  radius: number,
  cx: number,
  cy: number,
): Point2D {
  const screenDeg = 180 - lon
  const rad = (screenDeg * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  }
}

// 星座刻度分隔角（每 30° 一格），返回 12 条分隔线的两端点。
export function signTicks(
  rInner: number,
  rOuter: number,
  cx: number,
  cy: number,
): { inner: Point2D; outer: Point2D; labelAt: Point2D; sign: number }[] {
  const ticks = []
  for (let i = 0; i < 12; i++) {
    const lon = i * 30
    ticks.push({
      inner: lonToPoint(lon, rInner, cx, cy),
      outer: lonToPoint(lon, rOuter, cx, cy),
      // 标签置于该星座段中点（+15°）。
      labelAt: lonToPoint(lon + 15, (rInner + rOuter) / 2, cx, cy),
      sign: i,
    })
  }
  return ticks
}

// 宫头分隔线端点（从圆心到外圈）。
export function houseLine(
  lon: number,
  rOuter: number,
  cx: number,
  cy: number,
): { from: Point2D; to: Point2D } {
  return {
    from: { x: cx, y: cy },
    to: lonToPoint(lon, rOuter, cx, cy),
  }
}
