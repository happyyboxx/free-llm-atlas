# 永久免费层详细对比

12+ 个无需信用卡、长期可用的免费层平台深度对比。

---

## 📊 核心指标对比

| 平台 | RPM | RPD | TPM | 上下文 | 多模态 | Function Calling | 地区 | 特色 |
|---|---|---|---|---|---|---|---|---|
| **Google AI Studio** | 15 | 1,500 | 250K | 2M | ✅ | ✅ | 全球 | 中文好，Gemini 2.0 |
| **Groq** | 30 | 14,400 | 6K | 128K | ❌ | ✅ | 全球 | **最快** (LPU) |
| **Cerebras** | 30 | 14,400 | 1M/天 | 8K | ❌ | ❌ | 全球 | 2600+ tok/s |
| **Cloudflare Workers AI** | 共享 | 10K neurons | - | 128K | ✅ | ❌ | 全球 | 边缘部署 |
| **NVIDIA NIM** | 40 | - | - | 1M | ✅ | ✅ | 全球 | 102模型，Nemotron Ultra |
| **Mistral** | 60 | - | 500K | 32K | ❌ | ✅ | EU | 欧洲隐私标准 |
| **HuggingFace** | 额度制 | - | - | 32K | ✅ | ❌ | 全球 | 模型最多 (129+) |
| **GitHub Models** | 15 | 150 | - | 128K | ✅ | ✅ | 全球 | GPT-5, o4-mini 免费 |
| **OpenRouter** | 20 | 50 | - | 1M | ✅ | ✅ | 全球 | 聚合 14 免费模型 |
| **Cohere** | 20 | 1,000/月 | - | 128K | ❌ | ❌ | 全球 | RAG/Embedding 强 |
| **Kilo Code** | 200/hr | - | - | 32K | ❌ | ✅ | 全球 | **无需 Key** |
| **Pollinations.ai** | 无限 | 无限 | - | 4K | ✅ | ❌ | 全球 | **无需 Key/注册** |
| **OVHcloud** | 2 | - | - | 32K | ❌ | ❌ | EU | GDPR 合规 |
| **LLM7.io** | 30 | - | - | 200K | ✅ | ✅ | 全球 | 含 Claude/GPT-5 |
| **Z.AI (智谱)** | 并发限制 | - | - | 200K | ✅ | ✅ | 中国 | 国内永久免费 |
| **Coze** | 不限 | - | - | 128K | ✅ | ✅ | 中国 | Bot/Workflow 免费 |
| **Inference.net** | - | - | - | - | ❌ | ❌ | 全球 | 新晋免费层 |

---

## 🏆 维度最佳

| 维度 | 第一名 | 第二名 | 第三名 |
|---|---|---|---|
| **推理速度** | Groq (LPU) | Cerebras | NVIDIA NIM |
| **上下文长度** | NVIDIA NIM (1M) | Google (2M) | GitHub Models (128K) |
| **中文支持** | Z.AI (GLM) | Google | 硅基流动* |
| **模型丰富度** | HuggingFace | OpenRouter | GitHub Models |
| **零门槛 (无Key)** | Pollinations.ai | Kilo Code | - |
| **隐私/合规 (EU)** | Mistral | OVHcloud | Scaleway* |
| **Function Calling** | NVIDIA NIM | OpenRouter | Google |

*试用额度类

---

## 💡 选择建议

### 只想快速测试，不想注册
→ **Pollinations.ai** (完全无需注册) → **Kilo Code** (无需Key，有更多模型)

### 追求极致速度
→ **Groq** (Llama 3.3 70B @ 300+ tok/s) → **Cerebras** (更长上下文)

### 需要长上下文 / 推理模型
→ **NVIDIA NIM** (Nemotron Ultra 1M ctx, 推理强) → **OpenRouter** (Nemotron Ultra 免费)

### 中文场景 / 国内访问
→ **Z.AI (GLM-4.5-Flash)** → **Coze** (豆包/DeepSeek) → **硅基流动*** (需卡)

### 欧洲合规 / GDPR
→ **Mistral** (法企业级) → **OVHcloud** (匿名2 RPM)

### 想要闭源顶级模型 (GPT-5, Claude, o4-mini)
→ **GitHub Models** (免费额度含闭源) → **LLM7.io** (需Key)

---

## ⚠️ 避坑指南

| 平台 | 注意事项 |
|---|---|
| Google AI Studio | 需 Google 账号，部分地区需 VPN |
| NVIDIA NIM | 需手机号验证 (支持 +86) |
| GitHub Models | 需 GitHub 账号，额度较小 |
| HuggingFace | 免费额度按 $0.10/月 信用额度计算 |
| Mistral | 仅欧盟数据中心，国内延迟高 |
| OVHcloud | 仅 2 RPM，适合低频调用 |
| LLM7.io | 免费版不含闭源模型，需 token 解锁更高限额 |

---

*数据来源：cheahjs/free-llm-api-resources, nejib1/Free-LLM, 实测验证。每日 06:00 UTC 自动更新。*
