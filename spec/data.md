# 数据式样书 · astrology（SPEC-D）

> SDD 阶段 4 产出物之一。本册规定领域模型、实体字段、类型、约束与数据来源标注。
> 编号前缀 `SPEC-D-xx`。类型采用抽象记法（`string`/`number`/`integer`/`boolean`/`enum`/`array<T>`/`T?` 表可空），不绑定具体语言。
> 相关分册：行为见 `functional.md`（SPEC-F），接口见 `api.md`（SPEC-A）。术语遵循 `discovery.md § 7`。

---

## 数据来源分类（全册标注基准）
| 来源标记 | 含义 |
|----------|------|
| **[离线本地]** | 内置于应用、离线可用的静态资源或本地计算结果，无外部网络依赖 |
| **[会话内存]** | 仅存活于当前浏览器会话内存，不做任何持久化（呼应 SPEC-F-14 / SPEC-N-03） |
| **[第三方 API]** | 运行时从第三方运势 API 获取（呼应 SPEC-A-03 / SPEC-F-12） |
| **[预置静态]** | 随应用发布的预置静态内容数据文件，与代码逻辑解耦（呼应 SPEC-N-06） |

### 共享枚举
- `Sign`（星座）：白羊|金牛|双子|巨蟹|狮子|处女|天秤|天蝎|射手|摩羯|水瓶|双鱼（C-SIGN，共 12）。
- `Planet`（行星）：太阳|月亮|水星|金星|火星|木星|土星|天王星|海王星|冥王星（C-PLANET，共 10）。
- `EntryCategory`（词条类别）：星座|行星。
- `AspectType`（相位）：合相|六分相|四分相|三分相|对分相（C-ASPECT）。

---

## SPEC-D-01 出生信息 BirthInfo
- **来源**：FR-01；SPEC-F-01
- **来源标记**：[会话内存]
- **描述**：用户输入的出生三要素，仅存活于当前会话内存，用于生成星盘后不持久化。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `date` | string | 必填；格式 `YYYY-MM-DD`；范围 `1900-01-01` ~ 当前系统日期 | 出生日期（公历） |
| `time` | string? | 可选；格式 `HH:mm`（24h，00:00–23:59） | 出生时间；`timeUnknown=true` 时忽略/为空 |
| `timeUnknown` | boolean | 必填，默认 `false` | 「时间未知」开关；`true` 触发降级盘 |
| `placeName` | string | 必填，非空 | 用户输入的出生地点文本 |
| `resolvedCity` | CityEntry? | 生成前必须非空（除非无法识别则拒绝生成） | 由 SPEC-A-01 解析并（同名时）用户选定的城市条目 |

- **验收/可测点**：
  1. `timeUnknown=true` 时 `time` 不参与计算（视为未提供）。
  2. `date` 不满足格式/范围约束时对象非法，不可用于生成（SPEC-F-01）。
  3. 该对象无 `userId`/`name` 等身份字段（隐私，SPEC-N-03）。
- **边界与异常**：闰年 2月29日合法；`resolvedCity` 为空且地点无法识别时不生成星盘（SPEC-F-06）。

## SPEC-D-02 星盘结果 NatalChart
- **来源**：FR-06、FR-03、FR-08、FR-23；SPEC-F-03/F-04/F-07/F-08
- **来源标记**：[离线本地]（本地星历计算结果）+ [会话内存]（不持久化）
- **描述**：星历计算的完整输出，供渲染与解读使用。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `hasTime` | boolean | 必填 | `false` 表示降级盘 |
| `sunSign` | enum Sign | 必填 | 太阳星座（SPEC-F-05） |
| `planets` | array<PlanetPlacement> | 必填，长度 = 10，覆盖全部 C-PLANET | 十大行星落座 |
| `ascendant` | Ascendant? | 完整盘必填；降级盘为「不可用」 | 上升点 |
| `midheaven` | Point? | 完整盘必填；降级盘为「不可用」 | 中天 MC |
| `houses` | array<HouseCusp>? | 完整盘长度 = 12；降级盘为「不可用」 | 十二宫宫头 |
| `aspects` | array<Aspect> | 必填；降级盘为空数组 `[]` | 主要相位列表 |
| `ascendantAvailable` | boolean | 必填 | 上升/中天是否可用 |
| `housesAvailable` | boolean | 必填 | 宫位是否可用 |

**PlanetPlacement（行星落座）**
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `planet` | enum Planet | 必填，唯一 | 行星 |
| `sign` | enum Sign | 必填 | 所在星座 |
| `degree` | number | `[0, 30)` | 星座内度数 |
| `longitude` | number | `[0, 360)` | 黄经 |
| `house` | integer? | 完整盘 `1..12`；降级盘为「不可用」 | 所在宫位 |

**Ascendant / Point / HouseCusp**
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| Ascendant.`sign` | enum Sign | 完整盘必填 | 上升星座 |
| Ascendant.`longitude` | number | `[0,360)` | 上升点黄经 |
| Point.`sign` | enum Sign | | 落座星座（中天用） |
| Point.`longitude` | number | `[0,360)` | 黄经 |
| HouseCusp.`houseNumber` | integer | `1..12` | 宫序号 |
| HouseCusp.`longitude` | number | `[0,360)` | 宫头黄经 |

**Aspect（相位）**
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `planetA` | enum Planet | 必填 | 相位一端 |
| `planetB` | enum Planet | 必填，`≠ planetA` | 相位另一端 |
| `type` | enum AspectType | 必填 | 相位类型（C-ASPECT） |
| `orb` | number | `≥ 0`，`≤` 对应 orb 上限 | 实际偏离精确角度的度数 |

- **验收/可测点**：
  1. 完整盘：`planets` 恰 10 项且行星不重复，每项 `house ∈ 1..12`；`ascendant`/`houses` 非「不可用」；`ascendantAvailable = housesAvailable = true`。
  2. 降级盘：`hasTime=false`；`ascendant`/`midheaven`/`houses` 标注「不可用」；`aspects = []`；`ascendantAvailable = housesAvailable = false`；`planets` 各项 `house` 为「不可用」。
  3. `aspects` 中每条 `orb ≤` C-ASPECT 对应上限。
- **边界与异常**：「不可用」以显式标识值表达（非静默 null 数值），供 UI 渲染「不可用」文案（SPEC-U-05）。

## SPEC-D-03 城市库条目 CityEntry
- **来源**：FR-02；SPEC-F-02
- **来源标记**：[离线本地]（内置城市库）
- **描述**：内置离线城市库的单条记录，用于地理编码与时区判定。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | string | 必填，全库唯一 | 条目主键（区分同名城市） |
| `name` | string | 必填，非空 | 城市中文名 |
| `aliases` | array<string> | 可空，默认 `[]` | 别名/常见写法（供候选匹配） |
| `province` | string? | 可空 | 所属省/州（用于同名消歧展示） |
| `longitude` | number | `[-180, 180]` | 经度（东经为正） |
| `latitude` | number | `[-90, 90]` | 纬度（北纬为正） |
| `timezone` | string | 必填，IANA 时区名（如 `Asia/Shanghai`） | 时区标识 |

- **验收/可测点**：
  1. `id` 全库唯一；同名不同地的城市以不同 `id` 区分。
  2. 每条 `longitude`/`latitude` 在有效地理范围内，`timezone` 为合法 IANA 名。
  3. 同一 `id` 的经纬度与时区固定不变（支撑 SPEC-F-08 可复现）。
- **边界与异常**：至少覆盖国内主要城市（呼应 discovery「面向国内用户」）；`aliases` 用于精确匹配失败时生成候选（SPEC-F-02）。

## SPEC-D-04 运势内容 HoroscopeContent
- **来源**：FR-10、FR-11、FR-12、FR-14；SPEC-F-10/F-12
- **来源标记**：[第三方 API]
- **描述**：第三方运势 API 返回并经系统规范化后的运势内容。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `sign` | enum Sign | 必填，须等于请求星座 | 运势对应星座 |
| `period` | enum {每日,每周} | 必填 | 运势周期 |
| `targetDate` | string | 每日：`YYYY-MM-DD` = 当前系统日期 | 目标日期（每日用） |
| `weekStart` | string? | 每周：本周周一 `YYYY-MM-DD` | 目标周起始（每周用） |
| `weekEnd` | string? | 每周：本周周日 `YYYY-MM-DD` | 目标周结束（每周用） |
| `dimensions` | array<HoroscopeDimension> | 每日必含爱情/事业/健康三项；可含更多 | 运势维度列表 |
| `summary` | string? | 可空 | 整体运势概述（每周主要用） |

**HoroscopeDimension**
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `name` | string | 必填，非空 | 维度名（爱情/事业/健康/…） |
| `text` | string | 必填，非空 | 该维度运势文案 |
| `score` | integer? | 可空，`1..5` | 评分（若 API 提供） |

- **验收/可测点**：
  1. `sign` 与请求星座一致（SPEC-F-10 星座严格对应）。
  2. 每日运势 `dimensions` 至少含名称为「爱情」「事业」「健康」的三项且 `text` 非空。
  3. `targetDate`（每日）等于当前系统日期；`weekStart`~`weekEnd`（每周）覆盖当前系统日期。
  4. 缺任一必需维度时视为内容不完整，触发降级（不构造有效 HoroscopeContent，见 SPEC-F-12）。
- **边界与异常**：额外维度（财运/幸运色等）按 API 实际返回透传展示（假设 A-4）；该对象不持久化缓存跨日复用。

## SPEC-D-05 百科词条 EncyclopediaEntry
- **来源**：FR-15、FR-16、FR-17、FR-18、FR-09、FR-19；SPEC-F-09/F-11
- **来源标记**：[预置静态]（静态内容数据文件，无后台，假设 A-2 / SPEC-N-06）
- **描述**：行星或星座的百科知识条目，全库共 22 条（12 星座 + 10 行星）。

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| `id` | string | 必填，全库唯一 | 条目主键 |
| `name` | string | 必填，非空 | 词条名（如「天蝎」「太阳」） |
| `category` | enum EntryCategory | 必填 | 类别：星座/行星 |
| `symbol` | string | 必填，非空 | 符号（如 ♏ / ☉） |
| `symbolism` | string | 必填，非空 | 象征 |
| `keywords` | array<string> | 必填，长度 ≥ 1，每项非空 | 关键词 |
| `explanation` | string | 必填，非空 | 解释（星盘解读联动同源，SPEC-F-09） |

- **验收/可测点**：
  1. 全库恰 22 条：`category=星座` 12 条（覆盖 C-SIGN）、`category=行星` 10 条（覆盖 C-PLANET），无缺无重。
  2. 每条 `symbol`/`symbolism`/`explanation` 非空，`keywords` 至少 1 项。
  3. 星座词条的 `explanation` 即星盘要素解读所引用的文本（SPEC-F-09 一致性）。
  4. 搜索匹配基于 `name` 与 `keywords` 的子串、不区分大小写匹配（SPEC-F-11）。
- **边界与异常**：宫位/相位不单列词条（假设 A-1），其解释作为解读卡内联文案（不属本实体）；内容修改仅改静态数据文件，不改计算/渲染代码（SPEC-N-06）。

## SPEC-D-06 术语字典 GlossaryReference（一致性基准，非独立实体）
- **来源**：NFR-03；discovery.md § 7
- **来源标记**：[离线本地]
- **描述**：界面与内容所用占星术语的唯一权威来源为 `discovery.md § 7` 术语表。所有分册文案、枚举显示名、词条名称须与之逐字一致，不得同义混用（如「上升星座」不写作「命宫星座」）。
- **验收/可测点**：抽查星盘、运势、百科三板块文案，术语与 § 7 逐项一致，无未定义或冲突术语（对应 SPEC-N-03）。

---

## 本册 FR 覆盖自检
FR-01→D-01；FR-02→D-03；FR-03→D-02；FR-06→D-02；FR-08→D-02；FR-23→D-02；FR-09/19→D-05；FR-10/11/12/14→D-04；FR-15/16/17/18→D-05；NFR-03→D-06。
