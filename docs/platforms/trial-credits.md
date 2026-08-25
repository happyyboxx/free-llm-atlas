# Trial Credit Platforms Comparison

11+ platforms offering one-time/limited free credits. Usually require credit card verification.

---

## 📊 Core Metrics Comparison

| Platform | Free Credits | Card Required | Model Highlights | Region | Status |
|---|---|---|---|---|---|
| **Fireworks AI** | $1 | ✅ | Llama 405B, DeepSeek-V3, Qwen 72B | Global | ✅ |
| **FriendliAI** | Trial credits | ✅ | Llama 405B, DeepSeek-V3 | Global | ✅ |
| **Hyperbolic** | Trial credits | ✅ | Llama 405B, DeepSeek-V3, Qwen 72B | Global | ✅ |
| **Nebius AI Studio** | $1 | ✅ | Llama 405B, DeepSeek-V3 | Global | ⚠️ |
| **Novita.AI** | $0.5 | ✅ | **Some models price=0 free** (Ling-3-Flash, Macaron) | Global | ✅ |
| **Replicate** | Trial credits | ✅ | 405B, DeepSeek-V3, video/audio models | Global | ✅ |
| **Upstage** | $10 | ✅ | Solar Pro, document parsing | Global | ✅ |
| **Qwen (Alibaba Bailian)** | 10M tokens | ✅ | Qwen full family | China | ✅ |
| **Scaleway** | Trial credits | ✅ | Mistral, Llama series | EU | ⚠️ |
| **Requesty** | Trial credits | ✅ | Aggregates GPT-4o, Claude, Gemini | Global | ⚠️ |
| **Together AI** | Trial credits | ✅ | Llama 405B Turbo, DeepSeek-V3 | Global | ✅ |
| **Friendli** | Trial credits | ✅ | High-performance inference | Global | ✅ |

---

## 💎 Hidden Gem: Novita.AI Free Models

Novita.AI `/v3/openai/models` returns models with `input_token_price_per_m: 0, output_token_price_per_m: 0`:

| Model | Type | Features |
|---|---|---|
| `inclusionai/ling-3.0-flash` | MoE 124B/5.1B active | Serverless, Function Calling, Reasoning |
| `mindai/macaron-v1-venti` (748B) | MoL architecture (GLM-5.2 base + 4 LoRA) | Serverless, Function Calling, Reasoning |
| `mindai/macaron-v1-tall` (35B) | Qwen3.6-35B-A3B + LoRA | Serverless, Function Calling, Reasoning |
| `dev/glm46` | Dev version | Function Calling, Structured Outputs |
| `ai_infer_test_1/2/3` | Test models | 200K Context, Function Calling |
| `minimax/m2-her` | Test model | 32K Context |

> ⚠️ Note: Novita free models are mostly test/experimental versions; for production use OpenRouter/NIM.

---

## 🏆 Best by Dimension

| Dimension | Recommended | Reason |
|---|---|---|
| **Truly free models** | **Novita.AI** | 6+ price=0 models, no credits consumed |
| **Largest models (405B)** | Fireworks / Hyperbolic / Together / Replicate | All have Llama 3.1 405B |
| **Chinese / Domestic access** | **Qwen Bailian** / SiliconFlow* / VolcEngine* | Domestic nodes, low latency |
| **Document parsing** | **Upstage** | Solar + Document Parse strong |
| **Multimodal / Video** | **Replicate** | Supports video/audio generation models |
| **Routing / Aggregation** | **Requesty** / OpenRouter* | Single key for multiple providers |

*Permanent free tier

---

## ⚠️ Pitfall Guide

| Platform | Issues |
|---|---|
| **All card-required platforms** | Even "trial credits" may auto-charge after binding card; use virtual/prepaid cards |
| Nebius | Endpoints occasionally unstable, needs retry |
| Scaleway | EU nodes, high latency from China |
| Requesty | Endpoint changed, watch docs |
| Replicate | Per-second billing, long conversations cost unpredictable |
| VolcEngine/Bailian | Real-name verification, enterprise cert for higher quota |

---

## 💡 Combination Strategies

### "Zero-Cost Production Ready" Stack
```
Permanent free tier as primary (Groq/Google/NIM/OpenRouter)
    ↓ Hit limits / need specific models
Novita.AI free models (Ling-3-Flash etc price=0 models)
    ↓ Still not enough
Fireworks/Hyperbolic $1 top-up (~1M tokens)
```

### "Domestic Low Latency" Stack
```
SiliconFlow (20M tokens new user) + VolcEngine (500 pts/day) + Bailian (10M tokens)
    ↓ Fallback
Z.AI (GLM permanent free) + Coze (Bot free)
```

---

*Data auto-updated daily at 06:00 UTC. See providers.json for latest.*