# Provider Selection Guide

Choose the best free LLM provider for your needs with this decision tree.

---

## 🎯 Step-by-Step Decision Tree

### Q1: Can you run models locally? (GPU/RAM ≥ 8GB)
- **Yes** → See [Local Inference](../platforms/local-inference.md) → Recommended: **Ollama** (easiest) / **LM Studio** (GUI) / **Jan.ai** (open-source all-in-one)
- **No** → Continue to Q2

### Q2: Can you provide a credit card? (Even for free tiers)
- **No** → See [Permanent Free Tier](../platforms/permanent-free.md) → Continue to Q3
- **Yes** → See [Trial Credit Platforms](../platforms/trial-credits.md) → Continue to Q6

### Q3: Do you want zero registration, not even an API key?
- **Yes** → **Pollinations.ai** (fully anonymous, supports image generation) or **Kilo Code** (no key needed, 369 models)
- **No** → Continue to Q4

### Q4: What's your primary use case?

| Scenario | First Choice | Alternatives |
|---|---|---|
| **Maximum inference speed** | **Groq** (LPU, 300+ tok/s) | Cerebras |
| **Ultra-long context (1M+)** | **NVIDIA NIM** (Nemotron Ultra 1M) | OpenRouter (Nemotron Ultra free) |
| **Chinese / Low latency in China** | **Z.AI (GLM-4.5-Flash)** | SiliconFlow* / VolcEngine* |
| **Closed-source top models (GPT-5, Claude, o4-mini)** | **GitHub Models** (free tier includes closed-source) | LLM7.io* / OpenRouter* |
| **Function Calling / Agents** | **NVIDIA NIM** / **OpenRouter** | Google / Groq / Mistral |
| **Multimodal (Vision/Audio/Video)** | **GitHub Models** / **Google** | NVIDIA NIM / Replicate* |
| **Embeddings / RAG** | **Cohere** / **Google** | HuggingFace / Mistral |
| **EU GDPR Compliance** | **Mistral** (French enterprise) | OVHcloud (anonymous) |
| **Most model variety** | **HuggingFace** (129+) | OpenRouter (aggregator) |

*Requires key or has quota limits

### Q5: Fallback strategy if first choice is unavailable?

```
Permanent Free Tier Primary Chain:
Groq (speed) → Google (multimodal/Chinese) → NVIDIA NIM (reasoning/long context)
    → OpenRouter (aggregation/fallback) → Cohere (embeddings) → Mistral (EU compliance)
    → Kilo Code (no key) → Pollinations (zero barrier)
```

---

## 📋 Scenario-Based Recommendations

### Scenario A: Individual Developer, Zero Cost, Quick Demo
```
1. Pollinations.ai (zero config testing)
2. Kilo Code (no key, more models)
3. Google AI Studio (1500 RPD free, Gemini 2.0 Flash)
4. Groq (14400 RPD free, blazing fast)
```

### Scenario B: Chinese Application, Domestic Deployment, Low Latency
```
1. Z.AI (GLM-4.5-Flash permanent free, 200K ctx)
2. Coze (Doubao/DeepSeek, Bot/Workflow free)
3. SiliconFlow* (20M tokens for new users, fastest)
4. VolcEngine* (500 pts/day, extreme speed)
5. Bailian* (10M tokens, full multimodal)
```

### Scenario C: Need GPT-5 / Claude / o4-mini Closed-Source Models
```
1. GitHub Models (free tier includes GPT-5, o4-mini, GPT-4.1)
2. LLM7.io (30 RPM free, 120 RPM with token)
3. OpenRouter (14 free models, includes Nemotron Ultra)
4. Trial credits: Fireworks/Hyperbolic/Together ($1 top-up)
```

### Scenario D: Agent / Function Calling / Structured Output
```
1. NVIDIA NIM (Nemotron Ultra strong reasoning, full Function Calling)
2. OpenRouter (Nemotron Ultra free, multi-model comparison)
3. Google AI Studio (Gemini 2.0 Function Calling)
4. Groq (Llama 3.3 Function Calling)
5. Mistral (Native Function Calling support)
```

### Scenario E: Enterprise Compliance / EU Data Residency / GDPR
```
1. Mistral La Plateforme (French company, EU data centers)
2. OVHcloud (French cloud provider, GDPR native)
3. Scaleway* (French cloud, trial credits)
```

### Scenario F: Privacy Sensitive / Offline / Data Never Leaves Local
```
1. Ollama (simplest, one-command run)
2. LM Studio (GUI friendly)
3. Jan.ai (open source, full features: RAG/Embedding/Function Calling)
4. llama.cpp (core engine, extreme performance)
```

---

## 🔄 Combination Strategy: Build a Free Fallback Chain

### Hermes Agent Configuration Example
```yaml
# ~/.hermes/config.yaml
models:
  - model: "llama-3.3-70b-versatile"
    provider: "groq"
    api_base: "https://api.groq.com/openai/v1"
    api_key_env: "GROQ_API_KEY"
  
  - model: "gemini-1.5-flash"
    provider: "google"
    api_base: "https://generativelanguage.googleapis.com/v1beta"
    api_key_env: "GOOGLE_API_KEY"
  
  - model: "nvidia/nemotron-3-ultra-550b-a55b:free"
    provider: "openrouter"
    api_base: "https://openrouter.ai/api/v1"
    api_key_env: "OPENROUTER_API_KEY"
  
  - model: "glm-4.5-flash"
    provider: "z-ai"
    api_base: "https://api.z.ai/api/paas/v4"
    api_key_env: "ZAI_API_KEY"

fallback_chain:
  - "llama-3.3-70b-versatile"
  - "gemini-1.5-flash"
  - "nvidia/nemotron-3-ultra-550b-a55b:free"
  - "glm-4.5-flash"
```

### Generate Config Script
```bash
# Auto-generate from providers.json
python3 scripts/probe.py --export-config hermes
# Outputs config_hermes.yaml, copy to Hermes config
```

---

## ⚡ Quick Reference Card

| I need... | Use this |
|---|---|
| No registration, no key, instant use | `curl https://text.pollinations.ai/hello` |
| Fastest inference speed | Groq (Llama 3.3 70B) |
| Longest context (1M) | NVIDIA NIM (Nemotron Ultra) |
| Free GPT-5 / o4-mini | GitHub Models |
| Fastest in China, best Chinese | SiliconFlow* / Z.AI |
| Fully local, absolute privacy | Ollama / Jan.ai |
| Embeddings / RAG only | Cohere / Google |
| EU compliance | Mistral / OVHcloud |

*Requires credit card verification

---

> Decision tree based on 2026-08 live probe data. Platform policies change anytime; always verify against latest `providers.json` probe results.