# 式样书目录索引 · astrology

> SDD 阶段 4（完整式样书）产出物总入口。本目录汇总五册式样并提供 SPEC ⇄ FR/NFR 双向追溯表。
> 输入：`requirements.md`（FR-01~FR-23、NFR-01~NFR-07）、`discovery.md`、`features/*.feature`。
> 术语唯一权威来源：`discovery.md § 7`。

---

## 1. 分册目录

| 分册 | 文件 | 编号前缀 | 内容 |
|------|------|----------|------|
| 功能式样 | [functional.md](./functional.md) | SPEC-F-01~15 | 表单校验、星历流程（含降级）、太阳星座、渲染、运势滚动、运势 API 降级、导航、免责声明、访客模式 |
| 数据式样 | [data.md](./data.md) | SPEC-D-01~06 | 出生信息、星盘结果、城市库、运势内容、百科词条、术语字典 + 数据来源标注 |
| 接口式样 | [api.md](./api.md) | SPEC-A-01~04 | 地理编码、星历计算、运势获取、百科查询（前端内部模块函数级契约） |
| 画面式样 | [ui.md](./ui.md) | SPEC-U-01~09 | 暗色主题、导航、表单、星盘视图、解读卡、运势视图、百科视图、空/错/载入态 |
| 非功能式样 | [nfr.md](./nfr.md) | SPEC-N-01~07 | 性能、响应式/可用性、术语/安全/隐私、合规、可靠性/降级、可维护、板块隔离 |

## 2. 共享常量基准（跨册引用，见 functional.md 顶部）
- **C-SUN**：太阳星座边界日期表（12 星座闭区间）。
- **C-PLANET**：十大行星固定顺序与符号。
- **C-SIGN**：黄道十二星座固定顺序（白羊 0° 起，每 30°）。
- **C-ASPECT**：主要相位与容许 orb（合/对/三/四 ±8°，六分 ±6°）——关闭 UQ-2 orb 遗留。
- **C-HOUSE**：Placidus 宫位制；降级盘不计宫位。

---

## 3. 追溯矩阵 A：FR/NFR ⇄ SPEC（正向，覆盖完整性）

| 要件 | 关联式样（SPEC-xx） | 关联场景（feature） |
|------|---------------------|---------------------|
| FR-01 出生信息输入 | F-01, D-01, U-03 | natal-chart：完整信息生成 / 缺日期 |
| FR-02 离线地理编码 | F-02, D-03, A-01, U-04 | natal-chart：背景（城市库离线） |
| FR-03 时间未知降级盘 | F-03, F-04, D-02, A-02, U-05 | natal-chart：时间未知降级 |
| FR-04 地点无法识别拒绝 | F-06, A-01, U-09 | natal-chart：地点无法识别 |
| FR-05 缺日期拒绝 | F-01, U-03, U-09 | natal-chart：缺少出生日期 |
| FR-06 星历计算 | F-03, D-02, A-02 | natal-chart：完整信息生成 |
| FR-07 太阳星座判定 | F-05, A-02 | natal-chart：场景大纲 太阳星座 |
| FR-08 星盘渲染 | F-07, D-02, U-05 | natal-chart：完整信息生成 |
| FR-09 要素解读联动 | F-09, D-05, A-04, U-06 | natal-chart：查看要素解读 |
| FR-10 每日运势 | F-10, D-04, A-03, U-07 | horoscope：每日运势 |
| FR-11 每周运势 | F-10, D-04, A-03, U-07 | horoscope：每周运势 |
| FR-12 第三方运势 API | F-12, D-04, A-03 | horoscope：背景（第三方来源） |
| FR-13 运势降级提示 | F-12, A-03, U-07, U-09, N-05 | horoscope：来源不可用降级 |
| FR-14 运势自动滚动 | F-10, D-04, A-03, U-07 | horoscope：跨日滚动 / 场景大纲 |
| FR-15 星座词条详情 | F-11, D-05, A-04, U-08 | encyclopedia：星座词条 |
| FR-16 行星词条详情 | F-11, D-05, A-04, U-08 | encyclopedia：行星词条 |
| FR-17 关键词搜索 | F-11, D-05, A-04, U-08 | encyclopedia：关键词检索 / 场景大纲 |
| FR-18 搜索空结果 | F-11, A-04, U-08, U-09 | encyclopedia：无匹配空结果 |
| FR-19 要素跳转百科 | F-09, D-05, A-04, U-06 | encyclopedia：从星盘跳转 |
| FR-20 访客模式 | F-14, D-01, N-03 | 三 feature 背景（访客） |
| FR-21 全局三板块导航 | F-15, U-01, U-02 | navigation：四场景 |
| FR-22 免责声明呈现 | F-13, U-06, U-07, N-04 | natal-chart 解读 / horoscope 运势 |
| FR-23 稳定可复现 | F-08, D-02, A-02 | natal-chart：稳定可复现 |
| NFR-01 性能 | N-01, F-02, F-03 | （跨生成场景） |
| NFR-02 响应式/可用性 | N-02, U-01 | （跨全部板块） |
| NFR-03 术语一致性 | N-03, D-06 | （跨全部内容） |
| NFR-04 无数据存储/隐私 | N-03, F-14, D-01 | 三 feature 背景 |
| NFR-05 合规免责 | N-04, F-13 | 解读 / 运势 |
| NFR-06 可维护 | N-06, D-05, D-04 | encyclopedia / horoscope 背景 |
| NFR-07 可靠性/隔离 | N-05, N-07, F-12, A-03 | horoscope：降级提示 |

**正向完整性**：FR-01~FR-23 与 NFR-01~NFR-07 全部至少有一条 SPEC 对应，无悬空要件。

---

## 4. 追溯矩阵 B：SPEC ⇄ FR/NFR（反向，无孤儿式样）

| SPEC | 来源要件 |
|------|----------|
| SPEC-F-01 | FR-01, FR-05 |
| SPEC-F-02 | FR-02, FR-04 |
| SPEC-F-03 | FR-06, FR-03 |
| SPEC-F-04 | FR-03, FR-08 |
| SPEC-F-05 | FR-07 |
| SPEC-F-06 | FR-04 |
| SPEC-F-07 | FR-08 |
| SPEC-F-08 | FR-23 |
| SPEC-F-09 | FR-09, FR-19 |
| SPEC-F-10 | FR-10, FR-11, FR-14 |
| SPEC-F-11 | FR-15, FR-16, FR-17, FR-18 |
| SPEC-F-12 | FR-12, FR-13, NFR-07 |
| SPEC-F-13 | FR-22, NFR-05 |
| SPEC-F-14 | FR-20, NFR-04 |
| SPEC-F-15 | FR-21 |
| SPEC-D-01 | FR-01 |
| SPEC-D-02 | FR-06, FR-03, FR-08, FR-23 |
| SPEC-D-03 | FR-02 |
| SPEC-D-04 | FR-10, FR-11, FR-12, FR-14 |
| SPEC-D-05 | FR-15, FR-16, FR-17, FR-18, FR-09, FR-19 |
| SPEC-D-06 | NFR-03 |
| SPEC-A-01 | FR-02, FR-04 |
| SPEC-A-02 | FR-06, FR-03, FR-07, FR-08, FR-23 |
| SPEC-A-03 | FR-10, FR-11, FR-12, FR-13, FR-14, NFR-07 |
| SPEC-A-04 | FR-15, FR-16, FR-17, FR-18, FR-09, FR-19 |
| SPEC-U-01 | FR-21, NFR-02 |
| SPEC-U-02 | FR-21 |
| SPEC-U-03 | FR-01, FR-05 |
| SPEC-U-04 | FR-02 |
| SPEC-U-05 | FR-08, FR-03 |
| SPEC-U-06 | FR-09, FR-19, FR-22 |
| SPEC-U-07 | FR-10, FR-11, FR-13, FR-14, FR-22 |
| SPEC-U-08 | FR-15, FR-16, FR-17, FR-18 |
| SPEC-U-09 | FR-04, FR-05, FR-13, FR-18, NFR-07 |
| SPEC-N-01 | NFR-01 |
| SPEC-N-02 | NFR-02 |
| SPEC-N-03 | NFR-03, NFR-04 |
| SPEC-N-04 | NFR-05, FR-22 |
| SPEC-N-05 | NFR-07, FR-13 |
| SPEC-N-06 | NFR-06 |
| SPEC-N-07 | NFR-07 |

**反向完整性**：每条 SPEC 均指向至少一条 FR/NFR，无孤儿式样。

---

## 5. 遗留问题在式样阶段的处置

| 遗留项（requirements § 5） | 式样阶段处置 |
|----------------------------|--------------|
| UQ-2 相位 orb 阈值 | 已在 C-ASPECT 固定（合/对/三/四 ±8°，六分 ±6°），关闭 |
| UQ-4 运势维度完整集合 | 基线维度爱情/事业/健康在 SPEC-D-04/F-10 固定为最小验收集合；其余维度 API 实际返回透传（假设 A-4，待阶段 5 调研回填） |
| UQ-7 正午估算 | 采用「标注不可用」路径（SPEC-F-03/F-04）；降级盘太阳星座以当日正午定位（仅用于星座落座，不产出上升/宫位）。是否新增「正午估算完整盘」需门禁确认 |
| A-4 固定维度集合 | 若门禁要求固定维度集合，回填 SPEC-D-04 dimensions 约束 |

---

## 6. 门禁评审提示
- 五册式样 + 本索引已完成，追溯矩阵双向闭合，术语与 discovery § 7 对齐。
- 建议门禁重点复核：C-ASPECT orb 取值、C-HOUSE 宫位制（Placidus）、运势超时阈值（8 秒）、降级盘正午定位策略——这些是式样阶段新引入的可实现/可测决策，需业务确认。
- 不涉及技术选型（星历库/地理库/运势 API 具体实现属阶段 5）。
