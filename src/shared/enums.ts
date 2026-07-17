// 共享枚举 · 严格对齐 SPEC-D 的中文枚举值

export const Sign = {
  白羊: '白羊',
  金牛: '金牛',
  双子: '双子',
  巨蟹: '巨蟹',
  狮子: '狮子',
  处女: '处女',
  天秤: '天秤',
  天蝎: '天蝎',
  射手: '射手',
  摩羯: '摩羯',
  水瓶: '水瓶',
  双鱼: '双鱼',
} as const
export type Sign = (typeof Sign)[keyof typeof Sign]

export const Planet = {
  太阳: '太阳',
  月亮: '月亮',
  水星: '水星',
  金星: '金星',
  火星: '火星',
  木星: '木星',
  土星: '土星',
  天王星: '天王星',
  海王星: '海王星',
  冥王星: '冥王星',
} as const
export type Planet = (typeof Planet)[keyof typeof Planet]

export const EntryCategory = {
  星座: '星座',
  行星: '行星',
} as const
export type EntryCategory = (typeof EntryCategory)[keyof typeof EntryCategory]

export const AspectType = {
  合相: '合相',
  六分相: '六分相',
  四分相: '四分相',
  三分相: '三分相',
  对分相: '对分相',
} as const
export type AspectType = (typeof AspectType)[keyof typeof AspectType]

export type HoroscopePeriod = '每日' | '每周'
