// 行星/星座符号映射（C-PLANET / C-SIGN 符号，SPEC-U-05）
import type { Planet, Sign, AspectType } from '../../shared/enums'

export const PLANET_GLYPH: Record<Planet, string> = {
  太阳: '☉',
  月亮: '☽',
  水星: '☿',
  金星: '♀',
  火星: '♂',
  木星: '♃',
  土星: '♄',
  天王星: '♅',
  海王星: '♆',
  冥王星: '♇',
}

export const SIGN_GLYPH: Record<Sign, string> = {
  白羊: '♈',
  金牛: '♉',
  双子: '♊',
  巨蟹: '♋',
  狮子: '♌',
  处女: '♍',
  天秤: '♎',
  天蝎: '♏',
  射手: '♐',
  摩羯: '♑',
  水瓶: '♒',
  双鱼: '♓',
}

// 相位线型/颜色（SPEC-U-05：彼此可区分 + 图例）
export const ASPECT_STYLE: Record<
  AspectType,
  { color: string; dash: string; label: string }
> = {
  合相: { color: '#E8C36B', dash: '', label: '合相' },
  三分相: { color: '#7FC8F8', dash: '', label: '三分相' },
  六分相: { color: '#B49CE0', dash: '2 3', label: '六分相' },
  四分相: { color: '#F0A868', dash: '5 4', label: '四分相' },
  对分相: { color: '#F0868B', dash: '6 4', label: '对分相' },
}
