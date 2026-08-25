# ToS Compliance Review

Key terms of service compliance review for each free LLM platform. **For reference only, not legal advice.** For commercial use, always read the latest official ToS yourself.

---

## ⚖️ Core Compliance Dimensions Comparison

| Platform | Commercial Use | Data Training | Data Retention | Regional Limits | Key Terms |
|---|---|---|---|---|---|
| **Google AI Studio** | ✅ Allowed | ❌ Not for training (free tier) | 18 months | Global (some regions restricted) | AI Studio Additional Terms |
| **Groq** | ✅ Allowed | ❌ Not for training | 30 days | Global | GroqCloud ToS |
| **Cerebras** | ✅ Allowed | ❌ Not for training | - | Global | Cerebras Cloud ToS |
| **Cloudflare Workers AI** | ✅ Allowed | ❌ Not for training | Per account | Global | Cloudflare ToS |
| **NVIDIA NIM** | ✅ Allowed | ❌ Not for training | - | Global | NVIDIA AI Enterprise ToS |
| **Mistral** | ✅ Allowed | ❌ Not for training | 30 days | EU data residency | Mistral Platform ToS |
| **HuggingFace** | ✅ Allowed | ❌ Not for training | Per model | Global | HF Inference API ToS |
| **GitHub Models** | ✅ Allowed | ❌ Not for training | - | Global | GitHub Models ToS |
| **OpenRouter** | ✅ Allowed | Depends on upstream | Depends on upstream | Global | OpenRouter ToS |
| **Cohere** | ✅ Allowed | ❌ Not for training | - | Global | Cohere API ToS |
| **Kilo Code** | ✅ Allowed | ❌ Not for training | - | Global | Kilo ToS |
| **Pollinations.ai** | ✅ Allowed | ⚠️ May improve | - | Global | Pollinations ToS |
| **OVHcloud** | ✅ Allowed | ❌ Not for training | GDPR compliant | EU | OVHcloud AI Endpoints ToS |
| **LLM7.io** | ⚠️ Verify | ⚠️ Unknown | - | Global | Check official site |
| **Z.AI** | ✅ Allowed | ❌ Not for training | Chinese law | China | Z.AI Platform Agreement |
| **Coze** | ✅ Allowed | ❌ Not for training | Chinese law | China | Coze Service Agreement |
| **Inference.net** | ⚠️ Verify | ⚠️ Unknown | - | Global | Check official site |

---

## 🔴 Red Line Clauses (Must Watch)

### 1. Data Used for Training

| Platform | Free Tier Data Used for Training? | How to Opt Out |
|---|---|---|
| **OpenAI** (not in this list) | ✅ Yes (except Enterprise) | Enterprise/Zero retention |
| **Anthropic** (not in this list) | ❌ No | Default no training |
| **Google AI Studio** | ❌ No (free tier explicitly states) | Default no training |
| **Groq** | ❌ No | Default no training |
| **Mistral** | ❌ No | Default no training |
| **Cohere** | ❌ No | Default no training |
| **Pollinations.ai** | ⚠️ Possible | No opt-out mechanism |
| **LLM7.io** | ⚠️ Unknown | No explicit statement |

> **Recommendation**: Sensitive data (PII, code, trade secrets) **only use platforms with explicit no-training commitments**, or use local models.

### 2. Data Retention Periods

| Platform | Retention | Deletion Mechanism |
|---|---|---|
| Google | 18 months | Auto-delete, manual delete available |
| Groq | 30 days | Auto-delete |
| Mistral | 30 days | Auto-delete |
| OpenRouter | Depends on upstream | Depends on upstream |
| Local models | 0 (local) | Full control |

### 3. Regional / Export Compliance

| Platform | Data Center Location | Applicable Law | Suitable For |
|---|---|---|---|
| **Mistral** | France/EU | GDPR | EU enterprises, data residency requirements |
| **OVHcloud** | France/EU | GDPR + French law | High compliance requirements |
| **Scaleway** | France/EU | GDPR | EU enterprises |
| **Z.AI/Coze/Bailian/VolcEngine/Hunyuan** | Mainland China | Chinese law | Domestic compliance, data stays in China |
| **Groq/Google/NVIDIA/OpenRouter** | US/Global | US law | General commercial, no regional limits |

---

## 📋 Commercial Use Checklist

Verify each item before going live:

- [ ] **Confirm commercial use permission** — All listed platforms allow, but verify latest ToS
- [ ] **Data not-for-training commitment** — Sensitive business only on Google/Groq/Mistral/Cohere/local models
- [ ] **Data retention acceptable** — 30 days/18 months meet compliance requirements?
- [ ] **Regional compliance** — EU clients use Mistral/OVH; China clients use Z.AI/Coze/Bailian/VolcEngine
- [ ] **Export controls** — US entity list restrictions, avoid serving sanctioned countries/entities
- [ ] **Output content liability** — You're responsible for model output, platforms typically disclaim
- [ ] **SLA/Availability** — Free tiers have **no SLA**, production needs fallback/degradation plan
- [ ] **Cost change risk** — Free quotas can change anytime, monitor providers.json probe results

---

## 🏢 Enterprise Deployment Recommendations

### Option A: Full Compliance (Data never leaves / not trained)
```
Local models (Ollama/Jan.ai) as primary
    ↓ Need cloud capability
Mistral (EU) / OVHcloud (EU) / Z.AI (CN)
    ↓ Still not enough
Google AI Studio / Groq (explicit no-training commitment)
```

### Option B: Cost Optimized (Accept Some Risk)
```
Groq (speed) + Google (multimodal) + OpenRouter (aggregation) as primary
    ↓ Sensitive data
Local models / Cohere (RAG)
```

### Option C: Hybrid Deployment (Recommended)
```
Non-sensitive/high-throughput: Groq / Google / NIM / OpenRouter
Sensitive/PII: Local models (Ollama/Jan.ai) + Cohere Embedding
EU clients: Mistral / OVHcloud
CN clients: Z.AI / SiliconFlow / VolcEngine / Bailian
Code/Reasoning: Nemotron Ultra (OpenRouter/NIM) + Local DeepSeek-R1
```

---

## 📄 Official ToS Links Quick Reference

| Platform | ToS Link |
|---|---|
| Google AI Studio | https://ai.google.dev/terms |
| Groq | https://console.groq.com/terms |
| Cerebras | https://cloud.cerebras.ai/terms |
| Cloudflare Workers AI | https://www.cloudflare.com/terms/ |
| NVIDIA NIM | https://www.nvidia.com/en-us/about-nvidia/terms-of-use/ |
| Mistral | https://mistral.ai/terms/ |
| HuggingFace Inference | https://huggingface.co/inference-api-tos |
| GitHub Models | 🏴‍☠️ Retired (2026-07-30) | N/A | N/A | N/A | N/A | N/A |
| OpenRouter | https://openrouter.ai/terms |
| Cohere | https://cohere.com/api-terms |
| Kilo Code | https://kilo.ai/terms |
| Pollinations.ai | https://pollinations.ai/terms |
| OVHcloud | https://www.ovhcloud.com/legal/ |
| LLM7.io | https://llm7.io/terms |
| Z.AI | https://open.bigmodel.cn/agreement |
| Coze | https://www.coze.com/agreement |
| SiliconFlow | https://siliconflow.cn/agreement |
| VolcEngine | https://www.volcengine.com/docs/6291/1151725 |
| Baidu Qianfan | https://cloud.baidu.com/doc/WENXINWORKSHOP/s/ilkk79ynw |
| Alibaba Bailian | https://help.aliyun.com/document_detail/2712313.html |
| Tencent Hunyuan | https://hunyuan.tencent.com/agreement |
| Moonshot Kimi | https://platform.moonshot.cn/agreement |
| Xinghuo | https://www.xfyun.cn/doc/agreement |
| ModelScope | https://modelscope.cn/agreement |
| DeepSeek | https://platform.deepseek.com/agreement |

---

## 📄 Change Tracking

| Date | Platform | Change | Impact |
|---|---|---|---|
| 2026-08-01 | Initial | Compiled from public ToS | Baseline |

> **Important**: ToS can change anytime. Recommendations:
> 1. Monthly re-review of key platform ToS
> 2. Subscribe to platform change notifications
> 3. Watch this project's GitHub Issues with compliance label
> 4. Legal review required before major business launch

---

*Disclaimer: This document is compiled from public information and does not constitute legal advice. Consult professional legal counsel for commercial decisions.*