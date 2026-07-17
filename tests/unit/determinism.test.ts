// 单元 #11 · 确定性可复现 · FR-23 / SPEC-F-08 / SPEC-A-01/A-02
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
import { computeChart } from '../../src/domain/ephemeris/compute-chart'
import { resolvePlace } from '../../src/domain/geocoding/geocoder'
import type { CityEntry } from '../../src/shared/types'

const beijing: CityEntry = {
  id: 'beijing',
  name: '北京',
  aliases: [],
  longitude: 116.4074,
  latitude: 39.9042,
  timezone: 'Asia/Shanghai',
}

describe('确定性 (SPEC-F-08)', () => {
  it('相同输入 computeChart 两次 → 所有字段完全相等（完整盘）', () => {
    const inp = { date: '1990-08-15', time: '14:30', timeUnknown: false, city: beijing }
    const a = computeChart(inp)
    const b = computeChart(inp)
    expect(a).toEqual(b)
  })

  it('相同输入 computeChart 两次 → 完全相等（降级盘）', () => {
    const inp = { date: '1990-08-15', timeUnknown: true, city: beijing }
    const a = computeChart(inp)
    const b = computeChart(inp)
    expect(a).toEqual(b)
  })

  it('相同城市名 resolvePlace 两次 → 完全相等', () => {
    const a = resolvePlace('上海')
    const b = resolvePlace('上海')
    expect(a).toEqual(b)
  })

  it('星历/地理编码层不引用 Date.now() / Math.random()（静态检查, SPEC-F-08）', () => {
    // SPEC-F-08：当前时间仅用于运势子域（horoscope），不进入星历计算；
    // 故确定性静态检查排除 horoscope 子域。
    const domainDir = join(__dirname, '../../src/domain')
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
          if (entry.name === 'horoscope') continue
          walk(full)
        } else if (entry.name.endsWith('.ts')) {
          const src = readFileSync(full, 'utf8')
          if (/Date\.now\s*\(/.test(src)) offenders.push(`${full}: Date.now`)
          if (/Math\.random\s*\(/.test(src)) offenders.push(`${full}: Math.random`)
          // new Date() 无参数亦读时钟；允许 new Date(<arg>)
          if (/new\s+Date\s*\(\s*\)/.test(src)) offenders.push(`${full}: new Date()`)
        }
      }
    }
    walk(domainDir)
    expect(offenders).toEqual([])
  })

  it('shared/time 与 ephemeris 不读系统时钟', () => {
    const timeSrc = readFileSync(join(__dirname, '../../src/shared/time.ts'), 'utf8')
    expect(/Date\.now\s*\(/.test(timeSrc)).toBe(false)
    expect(/DateTime\.now\s*\(/.test(timeSrc)).toBe(false)
  })
})
