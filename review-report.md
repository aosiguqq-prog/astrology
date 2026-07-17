# 评审报告 · astrology

> SDD 阶段 7 产出物。代码评审 + 安全评审并行结果合并，按严重度排序。
> 日期：2026-07-12 | 评审员：code-reviewer + security-reviewer

---

## 总体结论

| 评审类型 | 阻断级 | 重要级 | 建议级 |
|----------|--------|--------|--------|
| 代码评审 | 1 项（B1）| 5 项（I1~I5）| 6 项（S1~S6）|
| 安全评审 | 0 项 | 2 项（M1~M2）| 6 项 |
| **合计** | **1 项** | **7 项** | **12 项** |

**门禁状态**：🔴 阻断项未清零，须修复 B1 后重新确认方可过门禁。

---

## 🔴 阻断级问题

### B1 · geocoder 前缀候选逻辑双向误判 unrecognized 路径
- **位置**：`src/domain/geocoding/geocoder.ts:35-46`
- **问题**：前缀候选逻辑为双向 `startsWith`（`nameKey.startsWith(key) || key.startsWith(nameKey)`），导致「输入文本以任一城市名/别名为前缀」时均回落 `candidates` 而非 `unrecognized`。实测：`"上海人民广场"→candidates`、`"纽约XYZ不存在"→candidates`。违反 SPEC-A-01 验收点 3 与 SPEC-F-06「无命中且无候选→拒绝生成」。现有测试仅覆盖恰好不触发该分支的用例，掩盖了缺陷。
- **修复**：将候选判定改为单向 `nameKey.startsWith(inputKey)`（候选名以用户输入为前缀），并补测「含已知城市名但整体无法识别」断言 `unrecognized`。

---

## 🟡 重要问题

### I1 · sun-sign.ts 接口签名与 SPEC-A-02 不一致
- **位置**：`src/domain/ephemeris/sun-sign.ts:11`
- **问题**：`sunSignByDate(month, day)` 未按 SPEC-A-02 的 `(date: string): Result<Sign, 'invalid_date'>` 实现，不返回 `Result`，无 `invalid_date` 分支。
- **修复**：实现 `(date: string): Result<Sign, 'invalid_date'>` 签名，或在 architecture.md 补 ADR 并同步式样。

### I2 · sun-sign.ts 魔法索引兜底注释与代码不符
- **位置**：`src/domain/ephemeris/sun-sign.ts:27-28`
- **问题**：兜底 `return SUN_SIGN_BOUNDARIES[length-3].sign` 注释称返回摩羯，实际是射手；理论不可达分支用隐式下标定位，数组顺序变动时静默出错。
- **修复**：改为显式 `throw new Error('unreachable')` 或配合 I1 加显式非法输入校验。

### I3 · cities.json 无同名城市，同名消歧路径未被验证
- **位置**：`src/domain/geocoding/data/cities.json` + `geocoder.ts`
- **问题**：SPEC-A-01 候选路径（`candidates.length≥2`）无数据支撑也无测试覆盖，式样点等于未实现。
- **修复**：城市库补入至少一组真实同名城市，补对应测试。

### I4 · horoscope Provider 的 `__badStatus` 魔法字段跨模块隐式契约
- **位置**：`src/domain/horoscope/horoscope-service.ts:73` + `provider.ts:18`
- **问题**：`bad_status` 判定依赖 Provider 在返回对象里塞 `__badStatus` 魔法字段，非类型系统保障，任何第三方响应恰好含该字段即误判。
- **修复**：Provider 契约改为显式判别联合 `{ kind:'ok', data } | { kind:'bad_status', status }`。

### I5 · horoscope.test.ts 缺关键降级路径覆盖
- **位置**：`tests/unit/horoscope.test.ts`
- **问题**：每周运势 `incomplete`（维度过滤后为空）无专项测试；`aztro-provider` 的映射与非 2xx → `bad_status` 分支完全无测试，Provider 层零覆盖。
- **修复**：补每周空维度→incomplete、aztro-provider 非 2xx→bad_status、正常响应→三维度映射测试。

### M1 · 生产环境运势代理配置缺失（安全）
- **位置**：`vite.config.ts:8-17` + `src/domain/horoscope/aztro-provider.ts`
- **问题**：`/api/horoscope` 仅 Vite dev server 代理存在，仓库无 `vercel.json`/`netlify.toml` 等生产侧代理配置，上线后运势功能整体 404；临时用公共 CORS 代理会引入中间人风险。
- **修复**：发布前补生产侧同源反代配置，纳入发布检查清单；禁止使用第三方公共 CORS 代理。

### M2 · 运势 API 为外部个人域名，供应链风险（安全）
- **位置**：`vite.config.ts:12`（`aztro.sameerkumar.website`）
- **问题**：非本仓库控制，无 SLA，响应内容直接渲染（虽 React 已转义，无脚本执行，但可推送误导性文案）。代码已标注 TODO 待换源。
- **修复**：记录为已知风险，跟踪换源；短期对文本字段加长度截断。

---

## 🟢 建议（不阻断门禁）

| # | 位置 | 建议 |
|---|------|------|
| S1 | `houses.ts`、`planet-longitudes.ts` | 宫位等宫制近似替代 Placidus、行星低精度历表为已知受控偏离（ADR-002 标注），建议在 change backlog 显式登记为「已知式样偏离」 |
| S2 | `geocoder.ts:13,18` | 两次规范化路径重复，可统一先规范化再匹配 |
| S3 | `BirthForm.tsx:9,19` | `isValidDate` 的 `'range'` 分支同时覆盖格式非法与超范围，提示文案合并可接受，风格级 |
| S4 | `BirthForm.tsx` | SPEC-F-05「表单即时显示太阳星座提示」在 UI 未见实现，建议确认是否遗漏功能点 |
| S5 | `compute-chart.ts:40-48` | `parseBirthDateTime` 被调用两次，可复用首次结果 |
| S6 | `target-period.ts` | 目标日期用 UTC 而非用户本地时区，午夜前后可能差一天，建议评估 |
| SEC-1 | `aztro-provider.ts:27` | 补一行注释显式声明「本请求不得附加任何 PII」 |
| SEC-2 | `DimensionCard.tsx`、`HoroscopePanel.tsx` | 外部文本经 JSX 转义，无 XSS 风险，保持现状，勿改为 innerHTML |
| SEC-3 | `src/store/*.ts` | 4 个 store 均纯内存无持久化，符合 SPEC-F-14/N-03，若日后加持久化须先做隐私评估 |

---

## 追溯链状态
- FR ⇄ SPEC ⇄ TEST 整体闭合（118 条测试全绿，行 97.68% / 分支 89.38%）
- B1 修复后需补测「含已知城市名但整体无法识别→unrecognized」
- I5 补测后 Provider 层从零覆盖提升到合理水平
