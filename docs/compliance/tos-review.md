# ToS 合规审查

各免费 LLM 平台服务条款关键点合规审查，**仅供参考，不构成法律建议**。商业用途请务必自行阅读官方最新 ToS。

---

## ⚖️ 核心合规维度对比

| 平台 | 商业用途 | 数据训练 | 数据留存 | 地域限制 | 关键条款 |
|---|---|---|---|---|---|
| **Google AI Studio** | ✅ 允许 | ❌ 不用于训练 (免费层) | 18个月 | 全球 (部分地区受限) | AI Studio 附加条款 |
| **Groq** | ✅ 允许 | ❌ 不用于训练 | 30天 | 全球 | GroqCloud ToS |
| **Cerebras** | ✅ 允许 | ❌ 不用于训练 | - | 全球 | Cerebras Cloud ToS |
| **Cloudflare Workers AI** | ✅ 允许 | ❌ 不用于训练 | 按账户 | 全球 | Cloudflare ToS |
| **NVIDIA NIM** | ✅ 允许 | ❌ 不用于训练 | - | 全球 | NVIDIA AI Enterprise ToS |
| **Mistral** | ✅ 允许 | ❌ 不用于训练 | 30天 | EU 数据驻留 | Mistral Platform ToS |
| **HuggingFace** | ✅ 允许 | ❌ 不用于训练 | 按模型 | 全球 | HF Inference API ToS |
| **GitHub Models** | ✅ 允许 | ❌ 不用于训练 | - | 全球 | GitHub Models ToS |
| **OpenRouter** | ✅ 允许 | 视上游而定 | 视上游 | 全球 | OpenRouter ToS |
| **Cohere** | ✅ 允许 | ❌ 不用于训练 | - | 全球 | Cohere API ToS |
| **Kilo Code** | ✅ 允许 | ❌ 不用于训练 | - | 全球 | Kilo ToS |
| **Pollinations.ai** | ✅ 允许 | ⚠️ 可能用于改进 | - | 全球 | Pollinations ToS |
| **OVHcloud** | ✅ 允许 | ❌ 不用于训练 | GDPR 合规 | EU | OVHcloud AI Endpoints ToS |
| **LLM7.io** | ⚠️ 需确认 | ⚠️ 不详 | - | 全球 | 需查阅官网 |
| **Z.AI (智谱)** | ✅ 允许 | ❌ 不用于训练 | 中国法律 | 中国 | 智谱开放平台协议 |
| **Coze** | ✅ 允许 | ❌ 不用于训练 | 中国法律 | 中国 | Coze 服务协议 |
| **Inference.net** | ⚠️ 需确认 | ⚠️ 不详 | - | 全球 | 需查阅官网 |

---

## 🔴 红线条款 (必须注意)

### 1. 数据用于训练
| 平台 | 免费层数据是否用于训练 | 如何退出 |
|---|---|---|
| **OpenAI** (非本列表) | ✅ 是 (除企业版) | 企业版/零留存 |
| **Anthropic** (非本列表) | ❌ 否 | 默认不训练 |
| **Google AI Studio** | ❌ 否 (免费层明确声明) | 默认不训练 |
| **Groq** | ❌ 否 | 默认不训练 |
| **Mistral** | ❌ 否 | 默认不训练 |
| **Cohere** | ❌ 否 | 默认不训练 |
| **Pollinations.ai** | ⚠️ 可能 | 无退出机制 |
| **LLM7.io** | ⚠️ 不详 | 无明确声明 |

> **建议**：敏感数据 (PII、代码、商业机密) **仅用明确承诺不训练的平台**，或用本地模型。

### 2. 数据留存期限
| 平台 | 留存时长 | 删除机制 |
|---|---|---|
| Google | 18个月 | 自动删除，可手动删除 |
| Groq | 30天 | 自动删除 |
| Mistral | 30天 | 自动删除 |
| OpenRouter | 视上游 | 视上游 |
| 本地模型 | 0 (本地) | 完全控制 |

### 3. 地域/出口合规
| 平台 | 数据中心位置 | 适用法律 | 适合场景 |
|---|---|---|---|
| **Mistral** | 法国/欧盟 | GDPR | EU 企业、数据驻留要求 |
| **OVHcloud** | 法国/欧盟 | GDPR + 法国法律 | 高合规要求 |
| **Scaleway** | 法国/欧盟 | GDPR | EU 企业 |
| **Z.AI/Coze/百炼/火山/混元** | 中国大陆 | 中国法律 | 国内合规、数据不出境 |
| **Groq/Google/NVIDIA/OpenRouter** | 美国/全球 | 美国法律 | 一般商业、无地域限制 |

---

## 📋 商业使用清单

上线前逐项确认：

- [ ] **确认商业用途许可** — 所有列表平台允许，但请核对最新 ToS
- [ ] **数据不训练承诺** — 敏感业务仅用 Google/Groq/Mistral/Cohere/本地模型
- [ ] **数据留存可接受** — 30天/18个月是否满足合规要求
- [ ] **地域合规** — EU 客户用 Mistral/OVH；国内客户用 Z.AI/Coze/百炼/火山
- [ ] **导出控制** — 美国实体清单限制，避免向受制裁国家/实体提供服务
- [ ] **输出内容责任** — 你对模型输出负责，平台通常免责
- [ ] **SLA/可用性** — 免费层**无 SLA**，生产环境需有降级/备选方案
- [ ] **费用变更风险** — 免费额度可随时调整，监控 providers.json 探测结果

---

## 🏢 企业级部署建议

### 方案 A: 完全合规 (数据不出境/不训练)
```
本地模型 (Ollama/Jan.ai) 为主
    ↓ 需要云端能力
Mistral (EU) / OVHcloud (EU) / Z.AI (CN)
    ↓ 仍不够
Google AI Studio / Groq (明确不训练承诺)
```

### 方案 B: 成本优先 (接受一定风险)
```
Groq (速度) + Google (多模态) + OpenRouter (聚合) 为主
    ↓ 敏感数据
本地模型 / Cohere (RAG)
```

### 方案 C: 混合部署 (推荐)
```
非敏感/高吞吐: Groq / Google / NIM / OpenRouter
敏感/PII: 本地模型 (Ollama/Jan.ai) + Cohere Embedding
EU 客户: Mistral / OVHcloud
CN 客户: Z.AI / 硅基流动 / 火山引擎 / 百炼
代码/推理: Nemotron Ultra (OpenRouter/NIM) + 本地 DeepSeek-R1
```

---

## 📄 官方 ToS 链接速查

| 平台 | ToS 链接 |
|---|---|
| Google AI Studio | https://ai.google.dev/terms |
| Groq | https://console.groq.com/terms |
| Cerebras | https://cloud.cerebras.ai/terms |
| Cloudflare Workers AI | https://www.cloudflare.com/terms/ |
| NVIDIA NIM | https://www.nvidia.com/en-us/about-nvidia/terms-of-use/ |
| Mistral | https://mistral.ai/terms/ |
| HuggingFace Inference | https://huggingface.co/inference-api-tos |
| GitHub Models | https://github.com/github/models/blob/main/TERMS.md |
| OpenRouter | https://openrouter.ai/terms |
| Cohere | https://cohere.com/api-terms |
| Kilo Code | https://kilo.ai/terms |
| Pollinations.ai | https://pollinations.ai/terms |
| OVHcloud | https://www.ovhcloud.com/legal/ |
| LLM7.io | https://llm7.io/terms |
| Z.AI 智谱 | https://open.bigmodel.cn/agreement |
| Coze | https://www.coze.com/agreement |
| 硅基流动 | https://siliconflow.cn/agreement |
| 火山引擎 | https://www.volcengine.com/docs/6291/1151725 |
| 百度千帆 | https://cloud.baidu.com/doc/WENXINWORKSHOP/s/ilkk79ynw |
| 阿里云百炼 | https://help.aliyun.com/document_detail/2712313.html |
| 腾讯混元 | https://hunyuan.tencent.com/agreement |
| 月之暗面 | https://platform.moonshot.cn/agreement |
| 讯飞星火 | https://www.xfyun.cn/doc/agreement |
| 魔搭 ModelScope | https://modelscope.cn/agreement |
| DeepSeek | https://platform.deepseek.com/agreement |

---

## ⚠️ 变更追踪

| 日期 | 平台 | 变更内容 | 影响 |
|---|---|---|---|
| 2026-08-01 | 初版 | 基于公开 ToS 整理 | 基准线 |

> **重要**：ToS 可随时变更。建议：
> 1. 定期 (月度) 复查关键平台 ToS
> 2. 订阅平台变更通知邮件
> 3. 关注本项目 GitHub Issues 的合规标签
> 4. 重大业务上线前请法务审核

---

*免责声明：本文档基于公开信息整理，不构成法律建议。商业决策请咨询专业法务。*
