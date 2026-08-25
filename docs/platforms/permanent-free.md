# Permanent Free Tier Comparison

Deep comparison of 17+ no-credit-card, long-term free tier platforms.

---

## 📊 Core Metrics Comparison

| Platform | RPM | RPD | TPM | Context | Multimodal | Function Calling | Region | Highlights |
|---|---|---|---|---|---|---|---|---|
| **Google AI Studio** | 15 | 1,500 | 250K | 2M | ✅ | ✅ | Global | Great Chinese, Gemini 2.0 |
| **Groq** | 30 | 14,400 | 6K | 128K | ❌ | ✅ | Global | **Fastest** (LPU) |
| **Cerebras** | 30 | 14,400 | 1M/day | 8K | ❌ | ❌ | Global | 2600+ tok/s |
| **Cloudflare Workers AI** | Shared | 10K neurons | - | 128K | ✅ | ❌ | Global | Edge deployment |
| **NVIDIA NIM** | 40 | - | - | 1M | ✅ | ✅ | Global | 102 models, Nemotron Ultra |
| **Mistral** | 60 | - | 500K | 32K | ❌ | ✅ | EU | EU privacy standards |
| **HuggingFace** | Credit-based | - | - | 32K | ✅ | ❌ | Global | Most models (129+) |
| **GitHub Models** | 🏴‍☠️ Retired (2026-07-30) | N/A | N/A | N/A | N/A | N/A | Global | Retired |
| **OpenRouter** | 20 | 50 | - | 1M | ✅ | ✅ | Global | Aggregates 14 free models |
| **Cohere** | 20 | 1,000/mo | - | 128K | ❌ | ❌ | Global | Strong RAG/Embedding |
| **Kilo Code** | 200/hr | - | - | 32K | ❌ | ✅ | Global | **No Key Needed** |
| **Pollinations.ai** | Unlimited | Unlimited | - | 4K | ✅ | ❌ | Global | **No Key/Registration** |
| **OVHcloud** | 2 | - | - | 32K | ❌ | ❌ | EU | GDPR Compliant |
| **LLM7.io** | 30 | - | - | 200K | ✅ | ✅ | Global | Includes Claude/GPT-5 |
| **Z.AI** | Concurrency | - | - | 200K | ✅ | ✅ | China | Domestic permanent free |
| **Coze** | Unlimited | - | - | 128K | ✅ | ✅ | China | Bot/Workflow free |

---

## 🏆 Best by Dimension

| Dimension | 1st | 2nd | 3rd |
|---|---|---|---|
| **Inference Speed** | Groq (LPU) | Cerebras | NVIDIA NIM |
| **Context Length** | NVIDIA NIM (1M) | Google (2M) | Retired (128K) |
| **Chinese Support** | Z.AI (GLM) | Google | SiliconFlow* |
| **Model Variety** | HuggingFace | OpenRouter | Retired |
| **Zero Barrier (No Key)** | Pollinations.ai | Kilo Code | - |
| **Privacy/Compliance (EU)** | Mistral | OVHcloud | Scaleway* |
| **Function Calling** | NVIDIA NIM | OpenRouter | Google |

*Trial credit tier

---

## 💡 Selection Guide

### Just want quick test, no registration
→ **Pollinations.ai** (zero registration) → **Kilo Code** (no key, more models)

### Maximum speed
→ **Groq** (Llama 3.3 70B @ 300+ tok/s) → **Cerebras** (longer context)

### Need long context / reasoning models
→ **NVIDIA NIM** (Nemotron Ultra 1M ctx, strong reasoning) → **OpenRouter** (Nemotron Ultra free)

### Chinese scenarios / domestic access
→ **Z.AI (GLM-4.5-Flash)** → **Coze** (Doubao/DeepSeek) → **SiliconFlow*** (requires card)

### EU compliance / GDPR
→ **Mistral** (French enterprise) → **OVHcloud** (anonymous 2 RPM)

### Want closed-source top models (GPT-5, Claude, o4-mini)
→ **Retired** (was free tier) → **LLM7.io** (requires key)

---

## ⚠️ Pitfall Guide

| Platform | Watch Out |
|---|---|
| Google AI Studio | Needs Google account, some regions need VPN |
| NVIDIA NIM | Requires phone verification (supports +86) |
| **GitHub Models** | 🏴‍☠️ Retired (2026-07-30) | Retired |
| HuggingFace | Free quota calculated as $0.10/month credits |
| Mistral | EU data centers only, high latency from China |
| OVHcloud | Only 2 RPM, suitable for low-frequency calls |
| LLM7.io | Free tier excludes closed-source, needs token for higher limits |

---

*Data sources: cheahjs/free-llm-api-resources, nejib1/Free-LLM, live verified. Auto-updated daily at 06:00 UTC.*