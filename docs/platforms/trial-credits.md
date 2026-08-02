# 试用额度平台详细对比

11+ 个提供一次性/限时免费额度的平台。通常需信用卡验证。

---

## 📊 核心指标对比

| 平台 | 免费额度 | 需卡 | 模型亮点 | 地区 | 状态 |
|---|---|---|---|---|---|
| **Fireworks AI** | $1 | ✅ | Llama 405B, DeepSeek-V3, Qwen 72B | 全球 | ✅ |
| **FriendliAI** | 试用额度 | ✅ | Llama 405B, DeepSeek-V3 | 全球 | ✅ |
| **Hyperbolic** | 试用额度 | ✅ | Llama 405B, DeepSeek-V3, Qwen 72B | 全球 | ✅ |
| **Nebius AI Studio** | $1 | ✅ | Llama 405B, DeepSeek-V3 | 全球 | ⚠️ |
| **Novita.AI** | $0.5 | ✅ | **部分模型 price=0 免费** (Ling-3-Flash, Macaron) | 全球 | ✅ |
| **Replicate** | 试用额度 | ✅ | 405B, DeepSeek-V3, 视频/音频模型 | 全球 | ✅ |
| **Upstage** | $10 | ✅ | Solar Pro, 文档解析 | 全球 | ✅ |
| **Qwen (阿里云百炼)** | 千万 Token | ✅ | Qwen 系列全家桶 | 中国 | ✅ |
| **Scaleway** | 试用额度 | ✅ | Mistral, Llama 系列 | EU | ⚠️ |
| **Requesty** | 试用额度 | ✅ | 聚合 GPT-4o, Claude, Gemini | 全球 | ⚠️ |
| **Together AI** | 试用额度 | ✅ | Llama 405B Turbo, DeepSeek-V3 | 全球 | ✅ |
| **Friendli** | 试用额度 | ✅ | 高性能推理 | 全球 | ✅ |

---

## 💎 隐藏宝藏：Novita.AI 免费模型

Novita.AI `/v3/openai/models` 返回 `input_token_price_per_m: 0, output_token_price_per_m: 0` 的模型：

| 模型 | 类型 | 特性 |
|---|---|---|
| `inclusionai/ling-3.0-flash` | MoE 124B/5.1B active | Serverless, Function Calling, Reasoning |
| `mindai/macaron-v1-venti` (748B) | MoL 架构 (GLM-5.2 base + 4 LoRA) | Serverless, Function Calling, Reasoning |
| `mindai/macaron-v1-tall` (35B) | Qwen3.6-35B-A3B + LoRA | Serverless, Function Calling, Reasoning |
| `dev/glm46` | 开发版 | Function Calling, Structured Outputs |
| `ai_infer_test_1/2/3` | 测试模型 | 200K Context, Function Calling |
| `minimax/m2-her` | 测试模型 | 32K Context |

> ⚠️ 注：Novita 免费模型多为测试/实验版，生产建议用 OpenRouter/NIM。

---

## 🏆 维度最佳

| 维度 | 推荐 | 理由 |
|---|---|---|
| **真正免费模型** | **Novita.AI** | 6+ 个 price=0 模型，无需消耗额度 |
| **最大模型 (405B)** | Fireworks / Hyperbolic / Together / Replicate | 都有 Llama 3.1 405B |
| **中文/国内访问** | **Qwen 百炼** / 硅基流动* / 火山引擎* | 国内节点，低延迟 |
| **文档解析** | **Upstage** | Solar + Document Parse 强 |
| **多模态/视频** | **Replicate** | 支持视频/音频生成模型 |
| **路由/聚合** | **Requesty** / OpenRouter* | 单 Key 访问多家 |

*永久免费层

---

## ⚠️ 避坑指南

| 平台 | 坑点 |
|---|---|
| **所有需卡平台** | 即使是"试用额度"，绑卡后可能自动扣费，建议用虚拟卡/额度卡 |
| Nebius | 端点偶尔不稳定，需重试 |
| Scaleway | 欧洲节点，国内延迟高 |
| Requesty | 端点已变更，需关注文档 |
| Replicate | 按秒计费，长对话成本不可控 |
| 火山引擎/百炼 | 实名认证，企业认证更高额度 |

---

## 💡 组合策略

### "零成本生产可用" 组合
```
永久免费层为主 (Groq/Google/NIM/OpenRouter)
    ↓ 遇到限流/需要特定模型
Novita.AI 免费模型 (Ling-3-Flash 等 price=0 模型)
    ↓ 仍不够
Fireworks/Hyperbolic $1 额度顶一下 (约 100万 tokens)
```

### "国内低延迟" 组合
```
硅基流动 (20M Token 新用户) + 火山引擎 (500点/天) + 百炼 (千万Token)
    ↓ 备选
Z.AI (GLM 永久免费) + Coze (Bot 免费)
```

---

*数据每日 06:00 UTC 自动探测更新。以 providers.json 为准。*
