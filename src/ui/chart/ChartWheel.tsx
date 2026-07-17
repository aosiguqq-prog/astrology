// 圆形星盘 SVG（SPEC-U-05）
import type { NatalChart } from '../../shared/types'
import { UNAVAILABLE, SIGNS } from '../../shared/constants'
import { PLANET_GLYPH, SIGN_GLYPH, ASPECT_STYLE } from './glyphs'
import { lonToPoint, signTicks } from './chart-geometry'

const CX = 200
const CY = 200
const R_OUTER = 190
const R_ZODIAC_INNER = 160
const R_PLANET = 130
const R_ASPECT = 110

export default function ChartWheel({ chart }: { chart: NatalChart }) {
  const ticks = signTicks(R_ZODIAC_INNER, R_OUTER, CX, CY)
  const hasTime = chart.hasTime
  const houses = chart.houses !== UNAVAILABLE ? chart.houses : null
  const ascendant = chart.ascendant !== UNAVAILABLE ? chart.ascendant : null

  return (
    <div className="mx-auto w-full max-w-md">
      <svg viewBox="0 0 400 400" role="img" aria-label="本命盘" className="w-full">
        {/* 外圈 */}
        <circle cx={CX} cy={CY} r={R_OUTER} fill="none" stroke="#E8C36B" strokeWidth={1.5} opacity={0.6} />
        <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#E8C36B" strokeWidth={1} opacity={0.35} />
        <circle cx={CX} cy={CY} r={R_ASPECT} fill="none" stroke="#A99FC7" strokeWidth={0.75} opacity={0.2} />

        {/* 黄道十二星座刻度 */}
        {ticks.map((t) => (
          <g key={`sign-${t.sign}`}>
            <line x1={t.inner.x} y1={t.inner.y} x2={t.outer.x} y2={t.outer.y} stroke="#E8C36B" strokeWidth={1} opacity={0.5} />
            <text
              x={t.labelAt.x}
              y={t.labelAt.y}
              fill="#F5E7C4"
              fontSize={14}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {SIGN_GLYPH[SIGNS[t.sign]]}
            </text>
          </g>
        ))}

        {/* 十二宫分隔线（完整盘） */}
        {hasTime &&
          houses?.map((h) => {
            const p = lonToPoint(h.longitude, R_ZODIAC_INNER, CX, CY)
            const label = lonToPoint(h.longitude + 3, R_ASPECT - 12, CX, CY)
            return (
              <g key={`house-${h.houseNumber}`}>
                <line x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#A99FC7" strokeWidth={0.5} opacity={0.3} />
                <text x={label.x} y={label.y} fill="#A99FC7" fontSize={9} textAnchor="middle" dominantBaseline="central">
                  {h.houseNumber}
                </text>
              </g>
            )
          })}

        {/* 相位连线（完整盘） */}
        {hasTime &&
          chart.aspects.map((a, i) => {
            const pa = chart.planets.find((p) => p.planet === a.planetA)
            const pb = chart.planets.find((p) => p.planet === a.planetB)
            if (!pa || !pb) return null
            const from = lonToPoint(pa.longitude, R_ASPECT, CX, CY)
            const to = lonToPoint(pb.longitude, R_ASPECT, CX, CY)
            const style = ASPECT_STYLE[a.type]
            return (
              <line
                key={`aspect-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={style.color}
                strokeWidth={1}
                strokeDasharray={style.dash || undefined}
                opacity={0.55}
              />
            )
          })}

        {/* 十大行星符号 */}
        {chart.planets.map((p, i) => {
          // 简单避让：奇偶行星半径略偏移，缓解重叠。
          const pt = lonToPoint(p.longitude, R_PLANET - (i % 2 === 0 ? 0 : 14), CX, CY)
          return (
            <text
              key={p.planet}
              x={pt.x}
              y={pt.y}
              fill="#EDE9F5"
              fontSize={13}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {PLANET_GLYPH[p.planet]}
            </text>
          )
        })}

        {/* 上升点标记（完整盘） */}
        {hasTime && ascendant && (
          <>
            {(() => {
              const p = lonToPoint(ascendant.longitude, R_OUTER, CX, CY)
              return (
                <g>
                  <circle cx={p.x} cy={p.y} r={4} fill="#E8C36B" />
                  <text x={p.x} y={p.y - 10} fill="#E8C36B" fontSize={10} textAnchor="middle">
                    ASC
                  </text>
                </g>
              )
            })()}
          </>
        )}
      </svg>

      {/* 相位图例（完整盘且有相位） */}
      {hasTime && chart.aspects.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs text-text-secondary">
          {Object.values(ASPECT_STYLE).map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1">
              <svg width={18} height={6}>
                <line x1={0} y1={3} x2={18} y2={3} stroke={s.color} strokeWidth={1.5} strokeDasharray={s.dash || undefined} />
              </svg>
              {s.label}
            </span>
          ))}
        </div>
      )}

      {/* 降级说明 */}
      {!hasTime && (
        <p className="mt-3 text-center text-sm text-accent-red">
          ⚠ 出生时间未知，上升星座与宫位不可用
        </p>
      )}
    </div>
  )
}
