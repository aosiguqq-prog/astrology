// 星盘要素解读卡（SPEC-U-06 / SPEC-F-09）：与百科同源 explanation + 免责声明
import type { Planet, Sign } from '../../shared/enums'
import { getEntryByName } from '../../domain/encyclopedia/encyclopedia-service'
import { PLANET_GLYPH } from './glyphs'
import Disclaimer from '../common/Disclaimer'

export default function InterpretationCard({
  planet,
  sign,
  onClose,
}: {
  planet: Planet
  sign: Sign
  onClose: () => void
}) {
  const entry = getEntryByName(sign)

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gold/30 bg-bg-panel p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg text-gold-light">
            <span className="mr-2" aria-hidden>
              {PLANET_GLYPH[planet]}
            </span>
            {planet} 落 {sign}
          </h3>
          <button
            className="text-text-secondary hover:text-text-primary"
            onClick={onClose}
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {entry.ok ? (
          <>
            <p className="text-sm leading-relaxed text-text-primary">
              {entry.value.explanation}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.value.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-gold/30 px-2 py-0.5 text-xs text-gold"
                >
                  {k}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-text-secondary">暂无该星座解读。</p>
        )}

        <Disclaimer />
      </div>
    </div>
  )
}
