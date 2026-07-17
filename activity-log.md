# Activity Log — astrology

## [2026-07-09] 阶段 0-bootstrap ✅ orchestrator

**动作**：初始化产品目录 `products/astrology/`。

**已完成**：
- 创建目录结构：`features/`、`spec/`、`src/`、`tests/`
- 写入 `PROJECT.md`（产品画像 + 需求摘要来自 intake）
- 写入 `sdd-state.json`（当前阶段 = 1-discovery，所有后续阶段 pending）
- 写入 `activity-log.md`（本文件）

**intake 摘要**：
- 平台：网页版
- 核心功能：星盘生成（本命盘）、每日/每周运势、行星/星座百科
- UI 风格：神秘暗色系（深紫/深蓝+金色星光）
- 技术偏好：由 AI 选定

**下一步**：运行 `/sdd-bdd astrology` → 进入阶段 1-discovery（需求探索）

---

## [2026-07-12] 阶段 1-discovery ✅ discovery-analyst

**动作**：用事件风暴方法梳理占星领域，产出 `discovery.md`。

**方法**：`prompts/clarify-requirements.md` 澄清框架 + `prompts/event-storming.md` 轻量事件风暴。

**已完成**：
- 撰写 `discovery.md`，含全部必需小节：背景与目标 / 用户与角色 / 核心业务事件（事件风暴）/ 外部依赖 / 读模型与界面 / 范围(in & out) / 统一语言术语表 / 关键风险与未决问题。
- 领域划分为三个低耦合子域：**星盘生成 / 运势 / 百科**。
- 三条主流程事件链：A 生成本命盘（出生信息已提交→地点已定位→行星位置已计算→本命盘已生成→要素已解读）、B 查看运势、C 浏览百科。
- 术语表统一 20+ 关键名词（本命盘、上升星座、宫位、相位、星历、地理编码等）。
- 列出 10 项未决问题（UQ-1~UQ-10），每项附默认假设，**未编造业务规则**。

**未决问题（待门禁/使用者确认，优先级最高：UQ-1 账号、UQ-4 运势来源、UQ-2/UQ-3 星历与地理编码）**：
- UQ-1 是否需账号保存历史星盘 / UQ-2 星历精度与来源 / UQ-3 地理编码+时区来源 / UQ-4 运势内容来源与"推送"含义 / UQ-5 百科覆盖范围 / UQ-6 是否需内容后台 / UQ-7 出生时间未知的处理 / UQ-8 是否做分享 / UQ-9 是否仅中文 / UQ-10 免责声明。

**状态**：`1-discovery.status = done`；`gate_passed` 仍为 false，等待门禁评审。

**下一步**：请使用者执行**门禁评审**（确认上述未决问题，尤其 UQ-1/UQ-4/UQ-2/UQ-3），通过后进入阶段 2-bdd（场景编写，gherkin-author）。

---

## [2026-07-12] 阶段 2-bdd ✅ gherkin-author

**动作**：依据 `discovery.md` 与已确认关键决策，为三个子域各产出一个 `.feature` 文件。

**方法**：`skills/bdd-gherkin/SKILL.md` —— 行为优先、声明式、统一语言、一个场景一个行为。

**已确认决策纳入场景**：
- UQ-1 纯访客模式 → 各 Feature 背景统一"以访客模式使用，无需注册登录"。
- UQ-2/UQ-3 离线本地星历 + 内置城市库 → 本命盘背景声明地点由内置城市库离线识别。
- UQ-4 第三方运势 API、打开即见 → 运势背景声明来源与"按当前系统日期自动对应当期内容"。
- UQ-7 出生时间未知 → 反例场景"给出太阳星座与行星落座，标注上升/宫位不可用"。
- UQ-10 免责声明 → 运势与解读相关场景的 Then 均校验"仅供娱乐参考"。

**已完成**：
- `features/natal-chart.feature`（星盘生成）：完整生成 happy-path + 时间未知降级 + 地点无法识别 + 缺日期 + 稳定可复现 + 要素解读，场景大纲覆盖出生日期→太阳星座。
- `features/horoscope.feature`（运势）：每日/每周 happy-path + 跨日自动滚动 + 内容来源不可用降级，场景大纲覆盖按星座呈现当期运势。
- `features/encyclopedia.feature`（百科）：星座/行星词条详情 + 关键词检索 + 空结果提示 + 从星盘要素跳转，场景大纲覆盖名称→类别。

**质量自检**：三份文件均为纯 Gherkin（zh-CN），无 UI/接口/技术细节泄漏；术语严格沿用术语表（本命盘/上升星座/宫位/相位/星历/地理编码/当期运势等）；每场景单一行为、每个"那么"可观察可验证；含反例场景与场景大纲，可映射未来步骤定义。

**状态**：`2-bdd.status = done`（由 orchestrator 写回 sdd-state.json）；`gate_passed` 待门禁评审。

**下一步**：请对三份 `.feature` 做**门禁评审**（追溯链 场景⇄要件覆盖、术语一致性、反例充分性），通过后进入阶段 3（要件定义）。

---

## [2026-07-12] 阶段 3-requirements ✅ requirements-engineer

**动作**：将三份 `.feature` 场景与 `discovery.md` 归纳为带编号、可追溯、可验证的要件，产出 `requirements.md`。

**方法**：场景/探索 → 编号 FR/NFR；每条含描述、验收条件、MoSCoW 优先级、来源；建立 FR/NFR ⇄ 场景 ⇄ discovery 追溯矩阵；主动标注矛盾与缺口。

**已完成**：
- **功能要件 23 条（FR-01~FR-23）**：星盘生成 9 条（输入/离线地理编码/时间未知降级/地点无法识别/缺日期/星历计算/太阳星座判定/可视化渲染/要素解读）、运势 5 条（每日/每周/第三方API对接/降级提示/按日期自动滚动）、百科 5 条（星座词条/行星词条/关键词搜索/空结果/星盘联动跳转）、通用 4 条（访客模式/三板块导航/免责声明/稳定可复现）。
- **非功能要件 7 条（NFR-01~NFR-07）**：性能（首见星盘≤60s、渲染≤3s）、可用性（桌面+移动响应式）、术语一致性、安全隐私（不存用户数据）、合规（免责声明）、可维护（内容与逻辑解耦）、可靠性（外部依赖降级不崩溃）。
- **约束与假设**：已确认决策落为 C-1~C-7（UQ-1/2/3/4/7/9/10），未确认项落为 A-1~A-4 并入未决跟踪。
- **追溯矩阵**：三份 feature 每个场景/场景大纲均被至少一条 FR 覆盖，无孤立场景。

**主动发现的缺口/待决**：
- FR-21（全局导航）有 discovery 读模型依据但缺 BDD 场景 → 标记「待补场景」UQ-R1。
- UQ-4 运势维度完整集合、UQ-2 相位 orb 阈值、UQ-7 是否支持「正午估算」路径、A-4 固定维度集合，均记入 requirements.md § 5 未决问题，留待门禁/阶段 5 确认。

**验证性**：每条 FR 均给可测验收条件（含具体提示文案、场景大纲示例值）；NFR 均带可度量阈值（60s/3s/响应式视口/无持久化），避免不可测表述。

**状态**：`3-requirements.status = done`（由 orchestrator 写回 sdd-state.json）；`gate_passed` 待门禁评审。

**下一步**：请对 `requirements.md` 做**门禁评审**（要件可验证性、FR/NFR ⇄ 场景追溯完整性、UQ-R1 追溯缺口处置），通过后进入阶段 4（式样）或阶段 5（选型 stack-advisor）。

---

## [2026-07-12] 阶段 4-spec ✅ spec-architect

**动作**：将 FR-01~FR-23、NFR-01~NFR-07 展开为五册完整式样书 + 目录索引，建立 SPEC ⇄ FR/NFR 双向追溯。

**方法**：`skills/spec-authoring/SKILL.md` —— 按功能/数据/接口/UI/非功能拆分五册；每条式样含唯一编号、来源、无歧义描述、验收/可测点、边界与异常；先固定跨册共享常量再分册撰写，最后做一致性整合与追溯闭合。因单模型可维持全局一致性，五册由架构师直接撰写而非分派子任务。

**已完成产出**（`spec/`）：
- `functional.md`（SPEC-F-01~15）：表单校验、离线地理编码流程、星历计算流程（完整+降级双路径）、太阳星座判定、星盘渲染、要素解读联动、运势按日期滚动、第三方运势 API 请求与降级、免责声明、访客模式、全局导航与状态保持。
- `data.md`（SPEC-D-01~06）：BirthInfo/NatalChart/CityEntry/HoroscopeContent/EncyclopediaEntry/GlossaryReference，逐字段类型与约束 + 数据来源标注（离线本地/会话内存/第三方API/预置静态）。
- `api.md`（SPEC-A-01~04）：Geocoder/EphemerisEngine/HoroscopeService/EncyclopediaService 四模块函数级契约（输入类型、Result 输出、错误情形枚举）。
- `ui.md`（SPEC-U-01~09）：暗色色板（深紫#1A1033/深蓝#0D1B3E/金#E8C36B，含具体色值与对比度）、导航、表单、星盘视图、解读卡、运势视图、百科视图、空/错/载入态。
- `nfr.md`（SPEC-N-01~07）：性能（≤60s/≤3s/≥30FPS）、响应式断点（320/768/1024）、术语/隐私、合规免责、可靠性（8秒超时降级）、可维护、板块隔离。
- `index.md`：分册目录 + 追溯矩阵 A（FR/NFR→SPEC，正向完整）+ 矩阵 B（SPEC→FR/NFR，无孤儿）+ 遗留问题处置。

**式样阶段新引入的可实现/可测决策（需门禁复核）**：
- C-ASPECT 相位 orb：合/对/三/四相 ±8°、六分相 ±6°（关闭 UQ-2 遗留）。
- C-HOUSE 宫位制：Placidus；降级盘不计宫位。
- C-SUN 太阳星座边界日期表（12 星座闭区间，逐日无空档无重叠）。
- 运势请求超时阈值 8 秒；每日运势基线维度爱情/事业/健康为最小验收集合。
- 降级盘太阳星座以当日正午定位（仅定星座落座，不产上升/宫位）；UQ-7「正午估算完整盘」未采用，如需支持须新增要件。

**质量自检**：FR-01~23、NFR-01~07 全部有 SPEC 对应（正向无悬空）；每条 SPEC 均指向 FR/NFR（反向无孤儿）；五册术语与 discovery §7 一致，跨册共享常量（C-SUN/PLANET/SIGN/ASPECT/HOUSE）与实体引用统一；每条式样描述避免「等/尽量/友好」，验收点均可写测试。未写具体代码、未做技术选型（留阶段 5）。

**状态**：`4-spec.status = done`（由 orchestrator 写回 sdd-state.json）；`gate_passed` 待门禁评审。

**下一步**：请对 `spec/` 五册做**门禁评审**（式样可实现性/可测性、SPEC⇄FR 追溯双向闭合、上述新引入决策 orb/宫位制/超时阈值确认），通过后进入阶段 5（选型 stack-advisor）。

---

## [2026-07-12] 阶段 5-architecture ✅ stack-advisor

**动作**：依据 `spec/`（SPEC-F/D/A/U/N）与已确认约束，选定技术栈、做模块分解与 TDD 规划、写 ADR，产出 `architecture.md`。

**方法**：读式样 + NFR → 对比可用 profile（web-ts/python/_generic）→ 逐关键依赖打分选型 → 模块分解（对齐 SPEC-A 四模块）→ 按「核心规则>边界>集成>周边」列 TDD 单元 → 非功能架构决策 → 目录结构 → ADR。

**选定技术栈**：`web-ts`（React + TypeScript + Vite），仅用其前端子集（无 Node 后端，契合纯前端静态部署）。python/_generic 因不适配 GUI Web 排除。

**关键依赖选型（含理由）**：
- 星历：**astronomia**（离线纯 JS、确定性；冥王星补近似历表——ADR-002）；备选 ephemeris。
- 时区：**luxon**（本地时刻+IANA→UTC→儒略日，1900+ 稳健）。
- 地理编码：**自建精简 `cities.zh.json`**（离线、字段对齐 SPEC-D-03、内容/逻辑解耦）。
- 运势：**HoroscopeProvider 抽象 + aztro 风格实现 + MockProvider**，降级为一等值路径（ADR-003）。
- 星盘可视化：**手写 SVG + `chartGeometry` 纯函数**，不引 d3（结构固定、体积小、可测——ADR-004）。
- 样式：**Tailwind CSS + 设计令牌**（SPEC-U-01 色板、SPEC-N-02 断点/触控）。
- 状态：**Zustand**（三 slice + nav，纯会话内存，无持久化——ADR-005）。

**模块分解**：四 domain 模块互不依赖（板块隔离 SPEC-N-07），仅共享 `shared/`；`ui→domain` 单向；geocoding/ephemeris/encyclopedia 纯本地离线，horoscope 为唯一外部依赖且降级隔离。

**TDD 规划**：~16 个实现单元、~190 条测试，按「核心规则>边界>集成>周边」排序；覆盖率行≥80%/核心分支≥90%；确定性与零网络断言纳入测试。

**非功能架构决策**：星历首版主线程同步 + EphemerisRunner 抽象（超阈可切 Web Worker，ADR-006）；分板块 React ErrorBoundary + domain 层 Result 值路径；无 localStorage/cookie 持久化；Vite 静态构建 + 任意静态托管（运势 CORS 可选边缘代理）。

**已写 6 条 ADR**：纯前端静态 / astronomia+冥王星近似 / 运势 Provider 降级优先 / 手写 SVG / Zustand 内存态 / 星历同步+Worker 就绪。

**待门禁确认项**：① 冥王星近似历表精度对娱乐场景是否可接受；② 首版运势 API 具体端点与是否需边缘代理解 CORS；③ 城市库覆盖范围。

**状态**：`5-architecture.status = done`、`stack = web-ts`（由 orchestrator 写回 sdd-state.json）；`gate_passed` 待门禁评审。本阶段未写实现代码（留阶段 6）。

**下一步**：请对 `architecture.md` 做**门禁评审**（选型依据充分性、模块解耦/追溯、上述三项待确认项拍板），通过后进入阶段 6-implement（TDD 实装，先 domain 后 ui）。

## [2026-07-12] 阶段 6-implement（TDD · domain 层）✅ implementer

**动作**：建立 Vite+React+TS 项目脚手架，按 TDD 红-绿-重构实现 shared 基础层与全部 domain 层。

**脚手架**：
- Node 26 / npm 11（经 Homebrew 安装）；package.json、vite.config.ts（含 vitest+coverage v8）、tsconfig.json、tests/setup.ts、index.html、main.tsx、App.tsx、index.css、.gitignore。
- 依赖：react/react-dom/zustand/luxon/astronomia + vitest/@vitest/coverage-v8/@testing-library/*/jsdom/tailwindcss/@types/*。

**shared 基础层**：result.ts（Result<T,E>）、enums.ts（Sign/Planet/EntryCategory/AspectType，中文枚举）、constants.ts（SIGNS/PLANETS/SUN_SIGN_BOUNDARIES/ASPECTS/UNAVAILABLE）、types.ts（NatalChart 等 SPEC-D 结构）、time.ts（luxon 本地时刻→UTC→儒略日）。

**已完成 domain 单元（TDD 红→绿）**：
- #6 geocoding.resolvePlace（74 城市库 + normalize 全角/空白 + 精确/别名/前缀候选/无法识别/empty_input）
- #1 sunSignByDate（C-SUN 表，摩羯跨年、边界日、闰年、全年无空档）
- #2 longitudeToSign（黄经映射 0°=白羊、归一化）
- #4 calcAspects + angularSeparation（C-ASPECT orb 闭区间、最小角差、多相位取最近）
- #5 computeChart 降级路径（timeUnknown → 10 落座/宫位=不可用/aspects=[]）
- #2/#3 computeChart 完整路径（10 行星+宫位1..12唯一、ASC/MC、等宫制宫头、第一宫=上升、相位）
- #7 encyclopedia（22 词条 list/get/getByName/search 子串大小写去空白）
- #8/#10 horoscope-service（8s 超时/五类降级/星座严格对应/目标日/周/不返回陈旧内容）
- #11 确定性（同输入两次相等 + 静态检查 ephemeris/geocoding 不用 now()/random，horoscope 子域除外）

**测试结果**：`vitest run` 9 个测试文件、105 条测试全绿；`tsc --noEmit` 无错误。

**覆盖率**（v8，排除纯类型 types.ts / 接口 provider.ts / 注入 mock-provider.ts）：行 97.11% / 分支 88.02%，均超 80% 阈值；domain 各子域行覆盖 encyclopedia 100% · ephemeris 96% · geocoding 94% · horoscope 96%。

**临时取巧待重构（交给 refactorer）**：
- `ephemeris/planet-longitudes.ts`：行星黄经用低精度平轨道根数近似（含月亮主项、太阳 Meeus 简化式）。TODO：替换为 astronomia 的 planetposition(VSOP87)+moonposition+pluto，接口 computeChart 不变。
- `ephemeris/houses.ts`：宫位为**等宫制近似**（第一宫=上升，每 30°），非精确 Placidus。ASC/MC 公式为标准球面三角，OBLIQUITY 取 J2000 定值。TODO：接入 astronomia 恒星时/黄赤交角实现真 Placidus 宫头。
- 城市库 74 条（主要城市），后续可扩至 ~2000 条（数据文件，不改代码）。

**门禁提示**：domain 层 TDD 完成，追溯链 FR⇄SPEC⇄TEST 已在测试名标注。下一步交 refactorer 做精度替换/去重，随后进入 UI 单元与集成/E2E（#9/#12~16）。

## [2026-07-12] 阶段 6-implement（UI 层）✅ implementer

**动作**：按 SPEC-U-01~09 与 architecture §5 实现完整可运行 UI，接线 domain 层，交付可构建可运行的占星 web app。

**样式（SPEC-U-01）**：Tailwind v4，色板令牌以 `src/index.css` 的 `@theme` 定义（bg-primary/secondary/panel、text-primary/secondary、gold/gold-light、accent-red）；`tailwind.config.ts` 声明内容扫描；暗色渐变背景 + 金色强调。

**状态（Zustand, src/store/）**：nav.store（默认 chart）、chart.store（form/natalChart/status/error）、horoscope.store（sign/period/content/status/error）、encyclopedia.store（query/results/currentEntry，初始 22 条）。全部会话内存，无持久化（SPEC-N-03）。

**通用组件（src/ui/common/）**：ErrorBoundary（class，分板块隔离 SPEC-N-07）、Loading（金色旋转）、EmptyState、Disclaimer（仅供娱乐参考 SPEC-F-13）。

**布局/导航（SPEC-U-01/02）**：AppShell（暗色外壳+标题+页脚免责）、GlobalNav（星盘/运势/百科三项，金色高亮当前项，≥44px 触控）。App.tsx 用 `hidden` 保留各板块状态（切回不丢，SPEC-F-15）。

**星盘板块（SPEC-U-03/04/05/06）**：
- BirthForm：日期/时间/时间未知开关/地点+候选下拉；校验文案逐字对齐 SPEC-F-01（必填/越界/请选择/无法识别）。
- chart-geometry.ts：纯函数黄经→SVG 坐标（已单测，单元 #12）。
- ChartWheel：SVG 圆盘（12 星座刻度、10 行星符号、12 宫分隔线、ASC 标记、相位连线+图例；降级盘跳过上升/宫位并显示说明）。
- PlacementList：行星|星座|度数|宫位表格（降级宫位=不可用），点击行触发解读卡。
- InterpretationCard：与百科同源 explanation + 关键词 + 免责声明（SPEC-F-09/F-13）。
- chart-flow.ts：geocoding→ephemeris 编排（已单测，单元 #13 部分）。

**运势板块（SPEC-U-07）**：HoroscopePanel（12 星座选择+每日/每周切换+日期标签+维度卡+免责；降级空态）、DimensionCard（维度名+文案+星级评分）、HoroscopeFallback（「运势内容暂时无法获取，请稍后再试」+重试）。aztro-provider（经 dev 代理 /api/horoscope 解 CORS）+ sign-map + horoscope/index.ts 组合根。

**百科板块（SPEC-U-08）**：SearchBar（实时过滤）、EntryList（22 条+类别徽标+符号+空态「未找到相关词条」）、EntryDetail（符号+名称+象征+关键词+解释四区）。

**dev 代理**：vite.config.ts 加 `/api/horoscope` → aztro，changeOrigin+rewrite（ADR-001/003）。

**验证结果**：
- `npx tsc --noEmit`：无错误。
- `npm run build`：成功，生成 dist/（index.html + assets/*.js 318KB + *.css 17KB，gzip 后 JS 约 101KB）。
- `npm run dev`：启动正常，http://localhost:5173/ 返回 HTTP 200。
- `vitest run`：11 个测试文件 **118 条测试全绿**（原 105 + chart-geometry 10 + chart-flow 4 - 归并），覆盖率行 97.68% / 分支 89.38%（domain/shared/chart-geometry），均超 80% 阈值。

**临时取巧待重构（交给 refactorer）**：
- aztro-provider：aztro 仅英文每日运势，三维度（爱情/事业/健康）由同一描述分面派生；每周用 day=week 近似。TODO：换更完整来源或补真正的每周聚合。
- ChartWheel 行星避让为奇偶半径偏移的简单方案，密集黄经仍可能重叠。TODO：更完善的碰撞散开。
- 宫位仍为等宫制近似（延续 domain 层 TODO，houses.ts）。

**门禁提示**：完整 web app 可构建可运行，三板块功能齐备，追溯链 FR⇄SPEC-U⇄组件 已在注释标注。可交 refactorer / qa-test；发布前需人工预览确认（CLAUDE.md 第 3 条唯一强制关口）。

---

## [2026-07-12] 阶段 9-release 🚀 release-manager

**动作**：执行发布准备（不自动部署、不 push）。

**发布前检查**：
- 评审阻断项 B1（geocoder 前缀双向误判）已修复并补测，`review-report.md` 门禁通过。
- 测试：131 条全绿（原 118 + B1/I5 补测）；行覆盖率 97.68%。
- 构建：`npm run build`（tsc --noEmit + vite build）成功，产出 dist/ 336KB。
- TypeScript：`tsc --noEmit` 无错误。

**产物**：
- `dist/index.html`（425 B）
- `dist/assets/index-DXyRDu96.js`（317 KB）
- `dist/assets/index-Dh-RQtMK.css`（17 KB）

**版本**：首次发布，语义化版本 **v1.0.0**；`package.json` version 0.1.0 → 1.0.0。

**已生成**：
- `release-notes.md`（功能概览 / 技术栈 / 已知问题 M1·M2·I1~I4·S1 / 发布前必做清单 / 部署说明 / 回滚方案）
- `CHANGELOG.md`（Keep a Changelog 格式，[1.0.0] Added + Technical）

**发布目标**：
- 目标 A · GitHub 推源码：骨架已就绪，**待客户配置 GitHub 凭证 + 发布前预览确认后手动执行**（本角色不 git push）。
- 目标 B · 云部署：预留接口，未实现。运势功能生产上线前须补 vercel.json/netlify.toml 同源反代（M1）。

**门禁提示**：本阶段止于「发布前预览确认」这一唯一强制人工关口。产物、发布说明、CHANGELOG 均已备妥，等待客户预览 dist/ 并确认后，由使用者执行推送/部署等不可逆动作。`sdd-state.json` 交 orchestrator 更新。

---

## [2026-07-13] change 模式 · 基于预览反馈迭代 → v1.1.0 🔧 release-manager

**触发**：客户在发布前预览 v1.0.0 时反馈两处问题（走 CLAUDE.md change 模式，范围化重跑受影响阶段 + 回归）。

**变更 1 · 运势改本地预设内容**（客户反馈「运势功能无法使用」）：
- 根因：运势依赖外部 aztro API（个人域名），preview/生产无代理 → 一直降级空态（即 review 的 M1/M2）。
- 处理：新增 `src/domain/horoscope/preset-provider.ts`——12 星座 × 每日/每周各一套预设文案（爱情/事业/健康三维度 + 星级），按星座与周期区分。组合根 `index.ts` 默认 provider 由 aztro 换为 preset。`aztro-provider.ts` 保留导出作备选。`horoscope-service` 降级/归一逻辑未动（ADR-003 来源可替换）。
- 效果：运势纯离线、永远可用，不再空态；M1/M2 两项安全隐患随之消除。

**变更 2 · 山东省城市数据补全**（客户反馈「县级市缺失」，仅要求补山东）：
- 处理：`cities.json` 新增山东 14 地级市 + 26 主要县级市/市辖区。山东 2→42，城市库总量 75→115。geocoder 逻辑不改。
- 校验：JSON 合法、无重复 id。

**回归验证**：
- 新增测试 +5（preset provider 3 条：12 星座每日/每周完整、周期区分；山东 geocoding 2 条）。
- `npm run test:run`：11 文件 **136 条全绿**（原 131 + 5）。
- `npm run build`：成功，dist/（index-BJEvKwgF.js 331KB / css 17KB）。
- `tsc --noEmit`：无错误。

**版本**：v1.0.0 → **v1.1.0**（新增功能/数据，向后兼容，语义化版本 minor）。`package.json` 已更新。

**产出物更新**：`preset-provider.ts`（新）、`horoscope/index.ts`、`cities.json`、`horoscope.test.ts`、`geocoding.test.ts`、`CHANGELOG.md`（[1.1.0]）、`release-notes.md`（改写为 v1.1.0）。

**门禁提示**：变更完成、回归全绿。**请客户再次预览 dist/ 确认效果**（重点：运势各星座有内容、山东城市可识别）。确认后再执行推送/部署等不可逆动作。本轮未自动部署、未 git push；`sdd-state.json` 交 orchestrator 更新（含 change_requests 追加）。
