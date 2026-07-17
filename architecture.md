# 技术选型与架构 · astrology（ARCH）

> SDD 阶段 5 产出物。本册基于 `spec/`（SPEC-F/D/A/U/N）做技术选型、模块分解、TDD 单元规划、非功能架构决策与目录结构。
> 决策以式样与 NFR 为依据，不凭喜好；使用者在阶段 5 门禁处确认后方进入阶段 6 实装。
> 相关：`framework/stacks/web-ts/stack.md`（选定 profile）、`requirements.md`（FR/NFR）。

---

## 0. 约束回顾（选型的硬边界）

| 约束 | 来源 | 对架构的影响 |
|------|------|--------------|
| 纯前端、无后端、静态部署 | intake、SPEC-N-03/N-07 | 无服务端；一切逻辑落浏览器；发布产物为静态资源 |
| 星历计算离线、在浏览器端运行 | SPEC-F-03、SPEC-N-01、约束 C-2 | 需纯 JS 星历库；计算不得发外部请求；可能重算，考虑 Web Worker |
| 地理编码内置城市库、离线 | SPEC-F-02、SPEC-D-03、约束 C-3 | 内置 JSON 城市库 + IANA 时区；零网络 |
| 运势接第三方 API、需降级 | SPEC-F-12、SPEC-A-03、SPEC-N-05 | 唯一外部依赖；8s 超时；五类失败降级；板块隔离 |
| 纯确定性星历/地理编码 | SPEC-F-08、SPEC-A-02 | domain 层纯函数，不读 `now()`、不用随机；易单测 |
| 暗色神秘 UI（深紫/深蓝+金） | SPEC-U-01 | 需可深度定制主题的样式方案 |
| 响应式，桌面+移动，≥320px | SPEC-N-02 | 移动优先、断点布局、触控 ≥44px |
| 访客模式、无账号、不持久化 | SPEC-F-14、SPEC-N-03 | 无 localStorage/cookie 存出生信息；状态仅会话内存 |

---

## 1. 技术选型决策

### 1.1 选定 profile：`web-ts`

**理由（对齐可用 profile 与约束）**：
- 产品是**需要图形界面的 Web 应用**，`web-ts`（React + TypeScript + Vite）正是其适用场景；`python` profile 面向数据/后端/CLI，`_generic` 为空模板，均不契合。
- BDD/TDD 工具链齐全：Vitest（单元/集成）+ Playwright（E2E）+ @cucumber/cucumber（跑阶段 2 的三份 `.feature`），与阶段 2~4 产物无缝衔接。
- TypeScript 的判别联合类型天然表达 SPEC-A 的 `Result<T,E>` 契约与 SPEC-D 的枚举（`Sign`/`Planet`/`AspectType`），把式样的类型约束前移到编译期。
- Vite `build` 产出纯静态 `dist/`，直接满足"静态部署、无后端"约束。

> 本产品**仅用 web-ts 的前端子集**：不启用 Node/Express/Next 后端（无服务端需求）。这是 profile 内的裁剪，非偏离。

### 1.2 候选对比（profile 层）

| 候选 | 契合度 | 团队/生态 | 结论 |
|------|--------|-----------|------|
| **web-ts（React+TS+Vite）** | 高：GUI Web、TDD/BDD 齐全、静态构建 | 生态最大、类型安全、Vitest/Playwright 成熟 | **推荐选定** |
| python | 低：面向 CLI/后端/数据，无浏览器 GUI 路线 | 不适合前端渲染星盘 | 排除 |
| _generic | — 空模板 | 需从零填充工具链 | 排除 |

profile 层无实质竞争者；真正的选型工作在下述**关键依赖**层。

### 1.3 关键依赖选型（逐项理由）

对每个"星历/地理/时区/运势/可视化/样式/状态"做候选打分（契合度/离线性/确定性/生态，5 分制），推荐其一。

#### （1）星历计算库 → **`astronomia`**（推荐），`ephemeris` 为备选

| 候选 | 离线纯 JS | 确定性 | 覆盖度 | 备注 |
|------|-----------|--------|--------|------|
| **astronomia** | 是 | 是（纯函数式，输入儒略日→天体位置） | 日月+行星黄经、恒星时→可推 ASC/MC | VSOP87/ELP 实现，模块化按需引入，体积可控 |
| ephemeris | 是 | 是 | 十大行星位置 API 直接 | 接口更"开箱"，但内置星表体积较大、可裁剪性弱 |
| swisseph(wasm) | 是（wasm） | 是 | 精度最高 | 体积大、许可复杂，对"仅供娱乐"精度过剩 |

**决策**：选 `astronomia`。SPEC-F-03 只需十大行星黄经、上升/中天、Placidus 宫头与相位；astronomia 提供 planetposition（VSOP87）+ sidereal（恒星时）+ nutation 等模块，可按需引入控制体积；纯函数满足 SPEC-F-08 确定性（不读时钟/随机）。

> **注意**：冥王星不在经典 VSOP87 主集。实装需为冥王星补一套低阶轨道根数/近似历表（对"仅供娱乐参考"精度足够，见 SPEC-N-04），或引入 astronomia 的 pluto 模块；此点在 ADR-002 记录为已知取舍。
> **Placidus 宫位与相位**由本项目 `domain/ephemeris` 内的算法实现（基于 astronomia 提供的恒星时/黄赤交角），不依赖外部宫位库——保证可测、可复现。

#### （2）地理编码 → **自建精简 JSON 城市库**（内置），不引第三方大库

| 候选 | 离线 | 体积 | 含时区 | 备注 |
|------|------|------|--------|------|
| **自建精简 `cities.zh.json`** | 是 | 小（数百条国内主要城市） | 内嵌 IANA `timezone` | 契合 SPEC-D-03 字段（id/name/aliases/province/经纬/timezone），面向国内用户 |
| cities.json(npm 全球库) | 是 | 大（数万条）| 多含 | 体积过大、需裁剪、字段不完全对齐 SPEC-D-03 |
| 在线 geocoding API | 否 | — | — | 违反 C-3 离线约束，排除 |

**决策**：自建精简城市库 `src/domain/geocoding/data/cities.zh.json`，字段严格对齐 SPEC-D-03，含 `id`（同名消歧）、`aliases`（候选匹配）、`timezone`（IANA）。这是 SPEC-N-06 要求的"内容与逻辑解耦"的数据文件，改数据不改代码。中国大陆城市时区多为 `Asia/Shanghai`，但字段保留 IANA 名以支持通用性与未来扩展。

#### （3）时区处理 → **`luxon`**（推荐），`Intl` 为兜底

| 候选 | IANA 时区→UTC | 确定性 | 备注 |
|------|----------------|--------|------|
| **luxon** | 是（`DateTime.fromObject({...},{zone})`） | 是（显式传入时区与固定输入，不隐式读 now） | API 清晰，处理历史时区偏移（1900+）稳健 |
| 原生 Intl | 部分（无直接"本地时刻→UTC"构造） | — | 单靠 Intl 做"某时区本地时间→UTC"较繁琐易错 |

**决策**：用 `luxon` 将"出生本地日期时间 + 城市 IANA 时区"转换为 UTC（进而儒略日），供 astronomia。SPEC-F-03 时刻构造的核心一步；luxon 对 1900 年起的历史时区规则处理稳健，且转换纯由显式输入决定，满足 SPEC-F-08。

#### （4）第三方运势 API → **抽象 `HoroscopeProvider` 接口 + 可替换实现（首版对接 aztro 风格 API）**

- 现状：公开免费运势 API（如 aztro `/?sign=&day=`）存在可用性波动，且多为英文星座名/英文文案。SPEC-N-06 明确要求"来源切换不影响其它板块"。
- **决策**：`domain/horoscope` 内定义 `HoroscopeProvider` 接口（`fetchRaw(sign, period): Promise<RawResponse>`），`HoroscopeService`（SPEC-A-03）负责**星座名映射（中↔API）、8s 超时、维度归一化（爱情/事业/健康）、五类失败判定与降级**。首版提供一个 `AztroLikeProvider` 实现对接选定 API，另提供 `MockProvider` 供测试注入。
  - **接口约定**：请求参数仅 `{sign, 派生日期/周}`，不含任何个人身份信息（SPEC-N-03）；超时 8s（SPEC-N-05）；每日响应须含爱情/事业/健康否则判 `incomplete`（SPEC-A-03）。
  - **可替换性**：切换真实来源 = 换一个 `HoroscopeProvider` 实现，`HoroscopeService` 与 UI 不变（SPEC-N-06 验收点 2）。
- 备选 API：horoscope-app-api、any.ml/horoscope 等，均可作为另一 Provider 实现，门禁确认后由实装期选定具体端点。

> 说明：因免费运势 API 稳定性不受控，**降级路径（SPEC-F-12）本身即是第一类公民**，不是异常兜底——这与 SPEC-N-05/N-07 的板块隔离一致。

#### （5）星盘可视化 → **手写 SVG（React 组件）**，不引 d3 渲染层

| 候选 | 契合度 | 体积 | 可测性 | 备注 |
|------|--------|------|--------|------|
| **手写 SVG + 少量三角函数定位** | 高 | 极小 | 高（纯计算函数产出坐标可单测） | 星盘是固定结构（12 刻度/10 符号/12 宫/相位连线），SVG 声明式即可 |
| d3.js | 中 | 大 | 中 | d3 强在数据驱动动态可视化；本星盘结构固定，用 d3 属过度设计 |

**决策**：手写 SVG。SPEC-U-05 的元素（黄道刻度、行星符号、宫位分隔线、上升点标记、相位连线+图例）都是由"黄经→极坐标"确定的静态几何。抽出**纯函数** `chartGeometry`（黄经→SVG 坐标/角度）单独单测，React 组件只做声明式渲染。避免 d3 体积与命令式 DOM 操作，利于 SPEC-N-01 性能与可测性。降级盘（SPEC-U-05）只需在渲染层按 `hasTime` 跳过上升点/宫位分隔线。

#### （6）UI 样式 → **Tailwind CSS**（暗色主题 + 设计令牌）

- **决策**：Tailwind CSS。SPEC-U-01 的固定色板（`#1A1033`/`#0D1B3E`/`#241640`/`#EDE9F5`/`#A99FC7`/`#E8C36B`/`#F5E7C4`/`#F0868B`）落为 `tailwind.config` 的自定义 `theme.colors`（设计令牌），全站暗色一致；响应式断点（SPEC-N-02：移动<768 / 平板768-1023 / 桌面≥1024）用 Tailwind 断点表达；触控 ≥44px 由工具类约束。星盘 SVG 的金色刻度亦引用同一令牌，保证术语/视觉一致。

#### （7）状态管理 → **Zustand**（轻量全局 store），局部态用组件内 state

| 候选 | 契合度 | 备注 |
|------|--------|------|
| **Zustand** | 高 | 三板块需"切换后状态保持"（SPEC-F-15/SPEC-U-02）：已生成星盘、已选运势星座、已浏览词条须跨切换存活。Zustand 以会话内存全局 store 承载，天然满足，无需 Provider 嵌套 |
| React Context | 中 | 可行但多板块共享 + 频繁更新时 re-render 面较大；样板偏多 |

**决策**：Zustand。用三个 slice（chart/horoscope/encyclopedia）保存各板块会话状态于**内存**（不写 localStorage/cookie，满足 SPEC-N-03/F-14）；导航当前板块也入 store（SPEC-F-15 默认"星盘"）。加载/错误/降级态随各 slice 表达（SPEC-U-09）。

### 1.4 依赖清单汇总

| 领域 | 选定 | 关键理由（式样锚点） |
|------|------|----------------------|
| 框架 | React + TypeScript + Vite | web-ts profile；静态构建 |
| 星历 | astronomia | 离线纯 JS、确定性（SPEC-F-03/F-08） |
| 时区 | luxon | 本地时间→UTC，1900+ 稳健（SPEC-F-03） |
| 地理编码 | 自建 cities.zh.json | 离线、字段对齐 SPEC-D-03、内容解耦（SPEC-N-06） |
| 运势 | HoroscopeProvider 抽象 + aztro 风格实现 | 来源可替换、降级优先（SPEC-A-03/N-05/N-06） |
| 可视化 | 手写 SVG + chartGeometry 纯函数 | 结构固定、体积小、可测（SPEC-U-05/N-01） |
| 样式 | Tailwind CSS + 设计令牌 | 暗色色板/断点/触控（SPEC-U-01/N-02） |
| 状态 | Zustand（分 slice，纯内存） | 板块状态保持、无持久化（SPEC-F-15/N-03） |
| 测试 | Vitest + Playwright + Cucumber | web-ts profile TDD/BDD |

---

## 2. 模块分解（对应 SPEC-A 四模块）

### 2.1 分层与依赖方向

```
                 ┌────────────────────────────────────────────┐
                 │                    ui/                      │
                 │  (React 组件树 · Tailwind · SVG 渲染)        │
                 └───────────────┬────────────────────────────┘
                                 │ 仅依赖 domain 的接口(Result 契约)
        ┌────────────────────────┼───────────────────────────────────┐
        ▼                        ▼                 ▼                   ▼
 domain/geocoding         domain/ephemeris   domain/horoscope   domain/encyclopedia
 (SPEC-A-01 纯本地)        (SPEC-A-02 纯本地)  (SPEC-A-03 外部+降级) (SPEC-A-04 纯本地)
        │                        │
        └──────────┬─────────────┘
                   ▼
         shared/（Result 类型、Sign/Planet 枚举、时区工具、几何常量）
```

**依赖铁律**：
- `ui → domain`，`domain` 不反向依赖 `ui`（domain 可脱离浏览器 DOM 独立单测）。
- 四个 domain 模块**互不依赖**（板块隔离，SPEC-N-07）；仅共享 `shared/`（类型/枚举/常量）。
- 唯一"生成本命盘"的跨模块编排（geocoding→ephemeris）在 `ui` 的星盘容器组件或一个 `domain/chart-flow` 用例函数里串联，两个 domain 模块自身仍解耦。

### 2.2 各模块职责边界

| 模块 | SPEC | 输入→输出 | 职责 | 明确不做 |
|------|------|-----------|------|----------|
| **domain/geocoding** | A-01 | `resolvePlace(placeName) → Result<GeocodeResolved, GeocodeError>` | 文本规范化（去空白/全角转半角）、精确匹配、别名候选、时区返回；纯本地零网络 | 不做星历；不缓存跨会话；不发网络 |
| **domain/ephemeris** | A-02 | `computeChart(ChartInput) → Result<NatalChart, EphemerisError>`；`sunSignByDate(date) → Result<Sign,...>` | 时刻构造（luxon→UTC→儒略日）、行星黄经（astronomia）、ASC/MC、Placidus 宫头、相位、降级路径；纯确定性 | 不读 now()、不用随机；不发网络；不渲染 |
| **domain/horoscope** | A-03 | `fetchHoroscope(HoroscopeRequest) → Promise<Result<HoroscopeContent, HoroscopeUnavailable>>` | 依系统日期算目标日期/周、星座名映射、8s 超时、维度归一、五类失败降级；封装 Provider | 不携带个人身份信息；不做通知；不自动无限重试；失败不返回陈旧内容 |
| **domain/encyclopedia** | A-04 | `listEntries()`/`getEntry`/`getEntryByName`/`search` | 22 条预置词条的浏览/取条/搜索（子串、不区分大小写、去空白）；纯本地 | 不含宫位/相位词条；改数据不改逻辑 |

### 2.3 数据来源与隔离

- **纯本地离线**：geocoding、ephemeris、encyclopedia → 断网可用（SPEC-N-07 验收 1）。
- **唯一外部依赖**：horoscope → 故障被局部捕获，仅该板块降级，不扩散（SPEC-N-05/N-07）。
- **会话内存**：BirthInfo / NatalChart / 各板块 UI 态存于 Zustand，不落 localStorage/cookie（SPEC-F-14/N-03）。

---

## 3. TDD 实现单元清单

顺序：**核心业务规则 > 边界处理 > 集成 > 周边**。测试类型：单元(U)/集成(I)/E2E。数量为粗估。

| # | 实现单元 | 对应 FR / SPEC | 类型 | 预计测试数 |
|---|----------|----------------|------|------------|
| **核心业务规则** |
| 1 | `sunSignByDate` 太阳星座判定（C-SUN 表，含摩羯跨年、各边界日） | FR-07 / SPEC-F-05, A-02 | U | 18 |
| 2 | `ephemeris.computeChart` 完整路径：十行星黄经→星座+度数（黄经映射、0°归白羊） | FR-06 / SPEC-F-03, D-02, A-02 | U | 14 |
| 3 | ASC/MC 计算 + Placidus 十二宫宫头 + 行星宫位定位（1..12 唯一映射） | FR-06/08 / SPEC-F-03/F-07 | U | 12 |
| 4 | 相位计算（C-ASPECT orb 区间、闭区间边界、多区间取最小角差） | FR-06 / SPEC-F-03 (C-ASPECT), D-02 | U | 12 |
| 5 | 降级路径（timeUnknown）：仅落座星座、ASC/宫位「不可用」、aspects=[] | FR-03/08 / SPEC-F-04, D-02, A-02 | U | 8 |
| 6 | `geocoding.resolvePlace` 精确命中/候选/无法识别（规范化、别名、零网络） | FR-02/04 / SPEC-F-02, A-01, D-03 | U | 12 |
| 7 | `encyclopedia` 数据完整性 + list/get/getByName/search（22 条、子串/大小写/空词、类别） | FR-15~18/09/19 / SPEC-F-11, A-04, D-05 | U | 16 |
| 8 | `horoscope.HoroscopeService` 目标日期/周计算 + 成功归一 + 星座严格对应 | FR-10/11/14 / SPEC-F-10, A-03, D-04 | U | 12 |
| **边界处理** |
| 9 | BirthInfo 表单校验（日期必填/范围/闰年/时间格式/地点必填、开关禁用时间） | FR-01/05 / SPEC-F-01, U-03, D-01 | U | 16 |
| 10 | 运势五类失败降级（timeout 8s / network / bad_status / incomplete / parse_error），不返回陈旧内容 | FR-12/13 / SPEC-F-12, A-03, N-05 | U | 10 |
| 11 | 确定性可复现：同输入两次 computeChart/resolvePlace 逐字段相等；不引用 now()/随机 | FR-23 / SPEC-F-08, A-01, A-02 | U | 6 |
| 12 | `chartGeometry` 纯函数：黄经→SVG 极坐标、刻度/宫位分隔角度（含降级不出宫线） | FR-08 / SPEC-F-07, U-05 | U | 10 |
| **集成** |
| 13 | 生成本命盘流程编排（geocoding→ephemeris→NatalChart）+ 地点无法识别拒绝生成 | FR-02/04/06 / SPEC-F-02/F-03/F-06 | I | 8 |
| 14 | 星座解读联动与百科同源一致（getEntryByName.explanation == 解读卡文本 + 免责声明） | FR-09/19/22 / SPEC-F-09/F-13, U-06 | I | 6 |
| **周边 / E2E（BDD 落地）** |
| 15 | 三板块导航 + 状态保持 + 默认星盘 + 单页不整页刷新 | FR-21 / SPEC-F-15, U-02, navigation.feature | E2E | 6 |
| 16 | 端到端 BDD：natal-chart / horoscope / encyclopedia 三份 feature 走通（含断网星盘/百科可用、运势降级空态） | 阶段2三feature / SPEC-N-07, U-05/07/08/09 | E2E(Cucumber+Playwright) | 12 |

> 合计约 **16 个实现单元、~190 条测试**（粗估）。核心 domain 单元先写测试后写实现（TDD 红-绿-重构）；覆盖率按 web-ts profile 阈值：行 ≥80% / 核心分支 ≥90%（domain 层应更高）。

---

## 4. 非功能架构决策

### 4.1 性能（SPEC-N-01）— 星盘计算是否上 Web Worker

- **决策：首版在主线程同步计算，预留 Worker 接口，按实测决定是否启用。**
- 依据：SPEC-N-01 要求"提交→渲染 ≤ 3 秒"且"交互后无 >100ms 长任务"。单次本命盘计算（10 行星 VSOP87 + 宫位 + 相位）在现代设备通常为几十毫秒级，远低于 3s，且计算发生在"提交"这一次性动作而非高频交互中。
- 但为**避免主线程长任务风险**（尤其低端移动设备），`domain/ephemeris` 设计为**纯函数、可序列化输入输出**，从而可零成本迁移到 Web Worker（`computeChart` 用例通过一个 `EphemerisRunner` 抽象调用，同步实现与 Worker 实现可互换）。若实装期基准测试发现单次计算 >100ms 或触发交互卡顿，则切换 Worker 实现，UI 与 domain 逻辑不改。
- 星盘 SVG 渲染由 React 声明式完成，交互（缩放/开合解读卡）不触发重算（星盘数据已在 store），保证 ≥30 FPS。

### 4.2 错误边界设计（SPEC-N-05/N-07 板块隔离）

- **React ErrorBoundary 分板块包裹**：星盘 / 运势 / 百科各自包一层 ErrorBoundary，任一板块运行时异常被局部捕获、显示暗色错误态，不整页白屏（SPEC-N-07 验收 3）。
- **domain 层用 `Result<T,E>` 而非抛异常**表达业务失败（SPEC-A 契约）：地点无法识别、日期非法、运势各类失败都是**值**，由 UI 显式分支渲染对应文案（SPEC-U-09），不进入 ErrorBoundary。ErrorBoundary 只兜"预期外"的程序崩溃。
- **运势降级是常规值路径**：`HoroscopeUnavailable` 五类原因映射到统一降级空态「运势内容暂时无法获取，请稍后再试」+ 重试（SPEC-F-12/U-07），与星盘/百科完全隔离。
- **加载态超时归宿**：运势加载 8s 后必进降级空态（SPEC-N-05/U-09）。

### 4.3 隐私与无持久化架构（SPEC-F-14/N-03）

- 全应用**不写 localStorage / cookie / IndexedDB** 存出生信息或星盘；状态仅在 Zustand 内存 store，刷新即失。
- 运势请求只出 `{sign, 派生日期/周}`；封装在 `HoroscopeService` 内，UI 无法旁路传入个人信息。
- 无账号/登录代码路径与 UI 入口（SPEC-F-14 验收 2）。

### 4.4 静态部署方案（无后端）

- **构建**：`pnpm build`（Vite）→ 纯静态 `dist/`（HTML/JS/CSS + 内置 `cities.zh.json`、百科数据、星历数据随包）。
- **托管**：任意静态托管（Netlify / Vercel / GitHub Pages / 对象存储+CDN 皆可），无服务端进程。
- **运势跨域**：第三方运势 API 若无 CORS 许可，部署侧可选加一层"仅转发运势请求"的轻量静态代理/边缘函数（不改变"无自有后端业务"的定性，且不触碰个人数据）；此为部署期备选，阶段 9 决定。
- **离线核心**：星盘/百科为纯静态资源 + 本地计算，首屏加载后断网仍可用（呼应 SPEC-N-07）。

---

## 5. 目录结构（`src/`）

按 web-ts profile 约定（`domain/` 先行便于 TDD、`ui/` 组件、`tests/` 分层、`features/steps/` BDD）裁剪落地：

```
astrology/
├─ index.html
├─ vite.config.ts
├─ tailwind.config.ts              # SPEC-U-01 色板令牌 + SPEC-N-02 断点
├─ tsconfig.json
├─ package.json
├─ src/
│  ├─ main.tsx                     # 应用入口，挂载 <App/>
│  ├─ App.tsx                      # 全局布局 + 三板块 ErrorBoundary 容器 (SPEC-U-01)
│  │
│  ├─ shared/                      # 跨模块基础（domain 与 ui 共享，无副作用）
│  │  ├─ result.ts                 # Result<T,E> 判别联合 (SPEC-A 契约)
│  │  ├─ enums.ts                  # Sign / Planet / AspectType / EntryCategory (SPEC-D)
│  │  ├─ constants.ts              # C-SUN/C-PLANET/C-SIGN/C-ASPECT/C-HOUSE 常量
│  │  └─ time.ts                   # luxon 封装：本地时刻+IANA时区→UTC→儒略日
│  │
│  ├─ domain/                      # 纯业务逻辑，先于 UI 实现（TDD）
│  │  ├─ geocoding/                # SPEC-A-01
│  │  │  ├─ geocoder.ts            # resolvePlace()
│  │  │  ├─ normalize.ts           # 去空白/全角转半角
│  │  │  └─ data/cities.zh.json    # 内置城市库 (SPEC-D-03, [离线本地])
│  │  ├─ ephemeris/                # SPEC-A-02
│  │  │  ├─ compute-chart.ts       # computeChart() 完整+降级路径
│  │  │  ├─ sun-sign.ts            # sunSignByDate() (C-SUN)
│  │  │  ├─ planets.ts             # astronomia 行星黄经→落座
│  │  │  ├─ houses.ts              # ASC/MC + Placidus 宫头 + 行星宫位
│  │  │  ├─ aspects.ts             # C-ASPECT 相位计算
│  │  │  ├─ pluto.ts               # 冥王星近似历表 (ADR-002)
│  │  │  └─ runner.ts              # EphemerisRunner 抽象（同步/Worker 可换, §4.1）
│  │  ├─ horoscope/                # SPEC-A-03
│  │  │  ├─ horoscope-service.ts   # fetchHoroscope()：超时/降级/归一
│  │  │  ├─ provider.ts            # HoroscopeProvider 接口
│  │  │  ├─ aztro-provider.ts      # 首版第三方 API 实现
│  │  │  ├─ sign-map.ts            # 中↔API 星座名映射
│  │  │  └─ target-period.ts       # 依系统日期算 目标日/目标周 (SPEC-F-10)
│  │  ├─ encyclopedia/             # SPEC-A-04
│  │  │  ├─ encyclopedia-service.ts# list/get/getByName/search
│  │  │  └─ data/entries.json      # 22 词条 (SPEC-D-05, [预置静态])
│  │  └─ chart-flow.ts             # 用例编排：geocoding→ephemeris→NatalChart (§2.1)
│  │
│  ├─ store/                       # Zustand 会话内存状态（无持久化, SPEC-N-03）
│  │  ├─ nav.store.ts              # 当前板块（默认「星盘」, SPEC-F-15）
│  │  ├─ chart.store.ts            # BirthInfo / NatalChart / 校验态
│  │  ├─ horoscope.store.ts        # 所选星座/周期/内容/降级态
│  │  └─ encyclopedia.store.ts     # 搜索词/结果/当前词条
│  │
│  └─ ui/                          # React 组件树（Tailwind + SVG）
│     ├─ layout/
│     │  ├─ AppShell.tsx           # 暗色布局外壳 (SPEC-U-01)
│     │  └─ GlobalNav.tsx          # 三项导航 星盘/运势/百科 (SPEC-U-02)
│     ├─ chart/
│     │  ├─ BirthForm.tsx          # 出生信息表单 + 校验 (SPEC-U-03)
│     │  ├─ CityCandidates.tsx     # 同名候选选择 (SPEC-U-04)
│     │  ├─ ChartWheel.tsx         # 圆形星盘 SVG (SPEC-U-05)
│     │  ├─ chart-geometry.ts      # 黄经→SVG 坐标 纯函数（可单测, §1.3-5）
│     │  ├─ PlacementList.tsx      # 行星落座清单 (SPEC-U-05)
│     │  ├─ AspectLegend.tsx       # 相位线型图例
│     │  └─ InterpretationCard.tsx # 要素解读卡 + 免责声明 (SPEC-U-06)
│     ├─ horoscope/
│     │  ├─ HoroscopePanel.tsx     # 星座选择 + 每日/每周切换 (SPEC-U-07)
│     │  ├─ DimensionCard.tsx      # 维度卡（爱情/事业/健康…）
│     │  └─ HoroscopeFallback.tsx  # 降级空态 + 重试 (SPEC-F-12/U-07)
│     ├─ encyclopedia/
│     │  ├─ SearchBar.tsx          # 搜索框 (SPEC-U-08)
│     │  ├─ EntryList.tsx          # 22 词条列表 + 类别徽标
│     │  └─ EntryDetail.tsx        # 详情（符号/象征/关键词/解释）
│     └─ common/
│        ├─ ErrorBoundary.tsx      # 分板块错误边界 (§4.2)
│        ├─ Loading.tsx            # 暗色加载态 (SPEC-U-09)
│        ├─ EmptyState.tsx         # 空态 (SPEC-U-09)
│        └─ Disclaimer.tsx         # 「仅供娱乐参考」(SPEC-F-13/N-04)
│
├─ tests/
│  ├─ unit/                        # Vitest：domain 逐单元（清单 §3 #1~12,14）
│  └─ e2e/                         # Playwright（清单 §3 #15~16）
└─ features/                       # 阶段 2 Gherkin（已存在）
   ├─ natal-chart.feature
   ├─ horoscope.feature
   ├─ encyclopedia.feature
   ├─ navigation.feature
   └─ steps/                       # Cucumber 步骤定义（BDD 落地）
```

---

## 6. 测试与覆盖率策略

- **框架**（web-ts profile）：Vitest（单元/集成）+ Playwright（E2E）+ @cucumber/cucumber（跑 `features/*.feature`）。
- **TDD 节奏**：先 domain（geocoding/ephemeris/horoscope/encyclopedia）红-绿-重构，UI 后续；纯函数（sun-sign、aspects、chart-geometry、target-period）优先高覆盖。
- **覆盖率阈值**：行 ≥ 80% / 核心分支 ≥ 90%（domain 层目标更高）。命令：`pnpm vitest run --coverage`。
- **确定性保证**：ephemeris/geocoding 测试断言"同输入两次结果逐字段相等"，并静态检查 domain 层不引用 `Date.now()`/`Math.random()`（SPEC-F-08）。
- **离线断言**：星盘/地理编码/百科相关测试断言零外部网络请求（SPEC-F-02/F-03、SPEC-N-01）。
- **降级与隔离**：以 `MockProvider` 注入 timeout/error/incomplete，验证降级空态与板块隔离（SPEC-F-12/N-05/N-07）。
- **BDD 追溯**：三份 feature 的每个场景经 `features/steps/` 落成可执行 E2E，闭合 `FR ⇄ 场景 ⇄ SPEC ⇄ TEST`（CLAUDE.md 第 6 条红线）。

---

## 7. 关键架构决策记录（ADR）

### ADR-001 · 纯前端静态架构，无自有后端
- **背景**：intake 定"纯前端网页应用"；SPEC-N-03/N-07 要求无用户数据上传/无服务端持久化，星盘/地理/百科离线。
- **决策**：全部逻辑落浏览器，Vite 构建静态 `dist/`，静态托管发布。
- **取舍**：得 — 部署简单、隐私天然、离线可用、成本低；失 — 运势第三方 API 的 CORS/稳定性需在客户端处理（靠降级 + 可选边缘代理）。
- **备选**：加 Node/Next 后端代理运势与做缓存 → 被否，违背"无后端/无数据上传"定性、增运维。

### ADR-002 · 星历用 astronomia，冥王星走近似历表
- **背景**：SPEC-F-03 需十行星黄经/ASC/MC/宫位/相位，离线且确定；面向"仅供娱乐参考"（SPEC-N-04）。
- **决策**：astronomia（VSOP87/恒星时）为主引擎；冥王星不在 VSOP87 主集，用低阶近似历表补足。宫位/相位在本项目内基于恒星时/黄赤交角实现。
- **取舍**：得 — 纯 JS、模块化控体积、确定性；失 — 冥王星与高精度星历库相比有角秒~角分级误差，对娱乐场景可接受。
- **备选**：Swiss Ephemeris(wasm) → 否（体积大、许可复杂、精度过剩）；ephemeris(npm) → 备选（星表体积大、可裁剪性弱）。

### ADR-003 · 运势用 Provider 抽象 + 降级优先
- **背景**：免费运势 API 稳定性不受控；SPEC-N-06 要求来源可切换、SPEC-N-05/N-07 要求隔离降级。
- **决策**：`HoroscopeProvider` 接口 + `HoroscopeService`（超时/归一/降级）+ 首版 aztro 风格实现 + `MockProvider` 测试。降级为一等值路径。
- **取舍**：得 — 换源零波及、易测、故障隔离；失 — 需自建星座名映射与维度归一逻辑。

### ADR-004 · 星盘手写 SVG，不引 d3
- **背景**：星盘结构固定（12/10/12/相位），SPEC-N-01 重性能与流畅、SPEC-U-05 元素明确。
- **决策**：手写 SVG + 纯函数 `chartGeometry`（黄经→坐标）；React 声明式渲染，降级盘按 `hasTime` 跳过上升/宫线。
- **取舍**：得 — 体积极小、几何可单测、无命令式 DOM；失 — 复杂动态动画需自行实现（本产品不需要）。

### ADR-005 · 状态用 Zustand，纯会话内存
- **背景**：SPEC-F-15 板块切换状态保持；SPEC-F-14/N-03 无账号、无持久化。
- **决策**：Zustand 三 slice + nav slice，全部内存态，不写 localStorage/cookie。
- **取舍**：得 — 跨板块状态保持简单、隐私合规、样板少；失 — 刷新即失（符合"会话结束不可恢复"式样，非缺陷）。

### ADR-006 · 星历同步计算 + Worker 就绪
- **背景**：SPEC-N-01 提交→渲染 ≤3s 且交互无 >100ms 长任务；低端移动设备风险。
- **决策**：首版主线程同步计算；`EphemerisRunner` 抽象使同步/Worker 实现可互换，实测超阈再切 Worker。
- **取舍**：得 — 简单、避免过早优化、留升级口；失 — 需在实装期做一次基准计时确认。

---

## 8. 门禁提示

- 阶段 5 输出物 `architecture.md` 已就绪。`sdd-state.json` 将置 `5-architecture.status=done`、`stack=web-ts`。
- **待人工/门禁确认项**（选型依据已给，请在门禁处拍板）：
  1. 冥王星近似历表的精度对"仅供娱乐"是否可接受（ADR-002）。
  2. 首版运势 API 具体端点（aztro / horoscope-app-api / any.ml）与是否需部署侧边缘代理解 CORS（ADR-001/003）。
  3. 城市库覆盖范围（首版国内主要城市清单规模）。
- 确认通过后进入阶段 6-implement（TDD 实装，先 domain 后 ui）。**本阶段不写实现代码**。
