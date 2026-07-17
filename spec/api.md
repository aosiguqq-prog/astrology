# 接口式样书 · astrology（SPEC-A）

> SDD 阶段 4 产出物之一。本册规定**前端内部模块接口契约**（函数签名级别），非 HTTP API。
> 编号前缀 `SPEC-A-xx`。签名采用抽象记法 `name(参数: 类型): 返回类型`，类型引用 `data.md` 的实体（SPEC-D）。
> 结果统一用「判别联合」表达成功/失败：`Result<T, E> = { ok: true, value: T } | { ok: false, error: E }`。
> 相关分册：行为见 `functional.md`（SPEC-F），数据见 `data.md`（SPEC-D）。

---

## SPEC-A-01 地理编码模块 Geocoder
- **来源**：FR-02、FR-04；SPEC-F-02；实体 CityEntry（SPEC-D-03）
- **描述**：将出生地点文本解析为城市条目（含经纬度、时区），全程离线，无外部网络请求。

**接口**
```
resolvePlace(placeName: string): Result<GeocodeResolved, GeocodeError>
```
- `GeocodeResolved = { kind: "exact", city: CityEntry } | { kind: "candidates", candidates: array<CityEntry> }`
- `GeocodeError = "empty_input" | "unrecognized"`

**输入约定**
- `placeName`：调用前不强制去空白；模块内部先规范化（去首尾空白、全角转半角）。

**输出/错误情形**
| 情形 | 返回 |
|------|------|
| 规范化后为空 | `{ ok:false, error:"empty_input" }` |
| 精确命中唯一城市 | `{ ok:true, value:{ kind:"exact", city } }` |
| 命中多个同名/别名候选 | `{ ok:true, value:{ kind:"candidates", candidates } }` |
| 无命中且无候选 | `{ ok:false, error:"unrecognized" }` |

**验收/可测点**
1. 城市库存在的城市名 → `exact`，`city` 字段与 SPEC-D-03 约束一致；调用零外部网络请求。
2. 同名城市 → `candidates`，`candidates.length ≥ 2`，各含不同 `id`。
3. 不存在的地点 → `error:"unrecognized"`（对应 SPEC-F-06 拒绝生成）。
4. 同一 `placeName` 两次调用返回一致（纯函数，支撑 SPEC-F-08）。

**边界与异常**：`empty_input` 与 `unrecognized` 区分处理（前者由表单必填拦截，后者显示「无法识别」提示）。

## SPEC-A-02 星历计算模块 EphemerisEngine
- **来源**：FR-06、FR-03、FR-07、FR-08、FR-23；SPEC-F-03/F-04/F-05/F-08；实体 NatalChart（SPEC-D-02）
- **描述**：给定出生信息（已解析城市），本地计算星盘结果；纯确定性，无外部网络、无随机、不读系统时钟。

**接口**
```
computeChart(input: ChartInput): Result<NatalChart, EphemerisError>
```
- `ChartInput = { date: string, time: string?, timeUnknown: boolean, city: CityEntry }`
- `EphemerisError = "invalid_date" | "missing_city"`

**输出/错误情形**
| 情形 | 返回 |
|------|------|
| `date` 非法或超范围 | `{ ok:false, error:"invalid_date" }` |
| `city` 缺失 | `{ ok:false, error:"missing_city" }` |
| `timeUnknown=false` 且入参合法 | `{ ok:true, value: <完整 NatalChart> }` |
| `timeUnknown=true` 且入参合法 | `{ ok:true, value: <降级 NatalChart> }` |

**辅助接口（太阳星座，供表单即时提示与降级）**
```
sunSignByDate(date: string): Result<Sign, "invalid_date">
```
- 依据 C-SUN 边界日期表返回太阳星座（SPEC-F-05 场景 1）。

**验收/可测点**
1. 完整入参 → 完整 NatalChart：`planets` 10 项、`ascendant`/`houses` 可用、`aspects` 按 C-ASPECT 计算。
2. `timeUnknown=true` → 降级 NatalChart（SPEC-D-02 降级约束），不报错。
3. `sunSignByDate` 逐条通过场景大纲：3月21日→白羊、6月22日→巨蟹、8月15日→狮子、11月10日→天蝎、12月25日→摩羯。
4. 同一 `ChartInput` 两次调用返回逐字段相等（SPEC-F-08）；实现不引用 `now()`/随机源。
5. 全程零外部网络请求。

**边界与异常**：`invalid_date` 与 `missing_city` 分别对应表单校验与地点未解析；相位/宫位边界见 SPEC-F-03。

## SPEC-A-03 运势获取模块 HoroscopeService
- **来源**：FR-10、FR-11、FR-12、FR-13、FR-14；NFR-07；SPEC-F-10/F-12；实体 HoroscopeContent（SPEC-D-04）
- **描述**：按星座与周期从第三方运势 API 获取当期运势；封装超时、错误与降级判定，对外只暴露「内容」或「降级」。

**接口**
```
fetchHoroscope(req: HoroscopeRequest): Promise<Result<HoroscopeContent, HoroscopeUnavailable>>
```
- `HoroscopeRequest = { sign: Sign, period: "每日" | "每周" }`
- `HoroscopeUnavailable = { reason: "timeout" | "network" | "bad_status" | "incomplete" | "parse_error" }`

**行为约定**
- 目标日期/目标周由模块内部依「当前系统日期」计算（SPEC-F-10），调用方不传日期。
- 请求超时上限 8 秒（SPEC-N-05）；超时归为 `timeout`。
- 请求参数不含任何用户个人身份信息，仅星座 + 派生日期（SPEC-N-03）。
- 每日运势响应缺爱情/事业/健康任一维度 → `incomplete`。

**输出/错误情形**
| 情形 | 返回 |
|------|------|
| 成功且内容完整 | `{ ok:true, value: HoroscopeContent }` |
| 超时（>8s） | `{ ok:false, error:{ reason:"timeout" } }` |
| 网络错误 | `{ ok:false, error:{ reason:"network" } }` |
| 非成功响应状态 | `{ ok:false, error:{ reason:"bad_status" } }` |
| 必需维度缺失 | `{ ok:false, error:{ reason:"incomplete" } }` |
| 响应不可解析 | `{ ok:false, error:{ reason:"parse_error" } }` |

**验收/可测点**
1. 成功路径返回的 `HoroscopeContent.sign` 等于 `req.sign`；每日含爱情/事业/健康三维度。
2. 五类失败情形均返回 `ok:false`，调用方据此显示「运势内容暂时无法获取，请稍后再试」（SPEC-F-12），不展示任何内容。
3. 超时阈值可测：Mock 响应延迟 >8 秒 → `timeout`。
4. 模块不触发任何通知类出站（邮件/短信/push）。

**边界与异常**：任一失败均不返回过期内容；调用方重试即再次调用本接口（手动触发）。

## SPEC-A-04 百科查询模块 EncyclopediaService
- **来源**：FR-15、FR-16、FR-17、FR-18、FR-09、FR-19；SPEC-F-09/F-11；实体 EncyclopediaEntry（SPEC-D-05）
- **描述**：对预置静态百科数据提供浏览、单条获取与关键词搜索；纯本地、纯确定性。

**接口**
```
listEntries(): array<EncyclopediaEntry>
getEntry(id: string): Result<EncyclopediaEntry, "not_found">
getEntryByName(name: string): Result<EncyclopediaEntry, "not_found">
search(keyword: string): array<EncyclopediaEntry>
```

**行为约定**
- `search`：对 `keyword` 去首尾空白后，匹配 `name` 或任一 `keywords` 项的子串（不区分大小写）；空关键词返回全部 22 条。
- 结果条目自带 `category`，供 UI 标识类别（SPEC-F-11 场景大纲）。
- `getEntryByName` 供星盘要素解读联动按星座名取词条（SPEC-F-09）。

**输出/错误情形**
| 情形 | 返回 |
|------|------|
| `listEntries` | 22 条（12 星座 + 10 行星） |
| `getEntry`/`getEntryByName` 命中 | `{ ok:true, value: entry }` |
| `getEntry`/`getEntryByName` 未命中 | `{ ok:false, error:"not_found" }` |
| `search` 有匹配 | 非空 `array<EncyclopediaEntry>` |
| `search` 无匹配（非空关键词） | `[]`（空数组 → UI 显示「未找到相关词条」） |
| `search` 空关键词 | 全部 22 条 |

**验收/可测点**
1. `listEntries().length === 22`，类别分布 12/10。
2. `search` 场景大纲逐条：`太阳`→含行星词条、`月亮`→行星、`水星`→行星、`天蝎`→星座、`摩羯`→星座（结果条目 `category` 正确）。
3. `search("<无匹配词>")` 返回 `[]`。
4. `getEntryByName("天蝎")` 返回的 `explanation` 与星盘解读联动所示一致（SPEC-F-09）。

**边界与异常**：修改静态数据后接口返回随之变化，无需改动模块代码（SPEC-N-06）。

---

## 本册 FR 覆盖自检
FR-02/04→A-01；FR-06/03/07/08/23→A-02；FR-10/11/12/13/14→A-03；FR-15/16/17/18/09/19→A-04。
