// 行星落座清单（SPEC-U-05）：行星 | 星座 | 宫位；点击行触发解读卡
import type { NatalChart, PlanetPlacement } from '../../shared/types'
import { UNAVAILABLE } from '../../shared/constants'
import { PLANET_GLYPH } from './glyphs'

export default function PlacementList({
  chart,
  onSelect,
}: {
  chart: NatalChart
  onSelect: (placement: PlanetPlacement) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-panel/80 text-text-secondary">
            <th className="px-3 py-2 text-left font-medium">行星</th>
            <th className="px-3 py-2 text-left font-medium">星座</th>
            <th className="px-3 py-2 text-left font-medium">度数</th>
            <th className="px-3 py-2 text-left font-medium">宫位</th>
          </tr>
        </thead>
        <tbody>
          {chart.planets.map((p) => (
            <tr
              key={p.planet}
              className="cursor-pointer border-t border-white/5 hover:bg-gold/5"
              onClick={() => onSelect(p)}
            >
              <td className="px-3 py-2">
                <span className="mr-1.5 text-gold" aria-hidden>
                  {PLANET_GLYPH[p.planet]}
                </span>
                {p.planet}
              </td>
              <td className="px-3 py-2">{p.sign}</td>
              <td className="px-3 py-2 text-text-secondary">
                {p.degree.toFixed(1)}°
              </td>
              <td className="px-3 py-2">
                {p.house === UNAVAILABLE ? (
                  <span className="text-text-secondary">不可用</span>
                ) : (
                  <span>{p.house} 宫</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
