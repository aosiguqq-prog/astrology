// 文本规范化 · SPEC-F-02：去首尾空白 + 全角转半角
// 纯函数，无副作用，供地理编码精确/别名匹配使用。

// 全角字符（U+FF01–U+FF5E）转半角（U+0021–U+007E），全角空格（U+3000）转普通空格。
function fullWidthToHalfWidth(input: string): string {
  let out = ''
  for (const ch of input) {
    const code = ch.codePointAt(0)!
    if (code === 0x3000) {
      out += ' '
    } else if (code >= 0xff01 && code <= 0xff5e) {
      out += String.fromCodePoint(code - 0xfee0)
    } else {
      out += ch
    }
  }
  return out
}

// 规范化：全角转半角 → 折叠内部多余空白 → 去首尾空白。
export function normalizePlaceName(input: string): string {
  return fullWidthToHalfWidth(input).replace(/\s+/g, ' ').trim()
}

// 用于不区分大小写、忽略空白的匹配键。
export function matchKey(input: string): string {
  return normalizePlaceName(input).toLowerCase().replace(/\s+/g, '')
}
