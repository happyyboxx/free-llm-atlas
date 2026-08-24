# Provider Comparison Table (Auto-generated)

> Last updated: 2026-08-24T22:57:06.668375+00:00

## Permanent Free Tier (No Card Required)

| Provider | Status | Health | RPM | TPM | Context | Max Output | Features | Region |
|---|---|---|---|---|---|---|---|---|
| OpenRouter | ✅ | 72 | 20 | 0 | 1000000 | 4096 | chat, vision, function_calling, reasoning | global |
| Cloudflare Workers AI | ✅ | 70 | 0 | 10000 | 8192 | 4096 | chat, embeddings, vision | global |
| NVIDIA NIM | ✅ | 70 | 40 | 0 | 1000000 | 4096 | chat, vision, function_calling | global |
| Mistral La Plateforme | ✅ | 70 | 60 | 500000 | 32768 | 4096 | chat, embeddings, function_calling | eu |
| Cohere | ✅ | 70 | 20 | 0 | 4096 | 4096 | chat, embeddings, rerank | global |
| LLM7.io | ✅ | 70 | 30 | 0 | 128000 | 4096 | chat, vision, video_generation | global |
| Agnes AI | ✅ | 70 | 30 | 500000 | 0 | 0 | image_generation, video_generation, image_editing | global |
| Groq | ✅ | 68 | 30 | 6000 | 8192 | 8192 | chat, function_calling | global |
| Kilo Code | ✅ | 68 | 0 | 0 | 32768 | 4096 | chat, function_calling | global |
| Google AI Studio | ⚠️ | 52 | 15 | 250000 | 2000000 | 8192 | chat, vision, function_calling, embeddings | global |
| Cerebras | ⚠️ | 46 | 30 | 0 | 8192 | 8192 | chat | global |
| OVHcloud AI Endpoints | ⚠️ | 46 | 2 | 0 | 32768 | 4096 | chat | eu |
| HuggingFace Inference | ❓ | 42 | 0 | 0 | 4096 | 4096 | chat, embeddings, vision, audio | global |
| Pollinations.ai | ❓ | 38 | 0 | 0 | 4096 | 4096 | chat, image_generation | global |
| GitHub Models | ❌ | 30 | 15 | 0 | 128000 | 4096 | chat, vision, function_calling | global |

## Trial Credit Providers

| Provider | Status | Health | RPM | TPM | Context | Max Output | Features | Region | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Agnes AI | ✅ | 74 | 30 | 500000 | 512000 | 8192 | chat, vision, function_calling, reasoning, tool_calling, agent_workflows | global | 免费文本推理: 30 RPM 公开 / 20 实际 RPM; 512K 上下文; 支持工具调用、代码、推理、多轮对话、视觉输入; 无需信用卡; 需登录 Dash |
| DeepSeek | ✅ | 70 | 0 | 0 | 64000 | 8192 | chat, reasoning, function_calling | cn | 有限免费额度，代码能力强 |

## Quick Selection Guide

| Use Case | Recommended Provider | Why |
|---|---|---|
| **Maximum Speed** | Groq | LPU hardware, 300+ tok/s |
| **Longest Context (1M+)** | NVIDIA NIM (Nemotron Ultra) / OpenRouter | 1M context window |
| **Multimodal (Vision/Audio)** | Google AI Studio / GitHub Models | Native multimodal support |
| **Function Calling / Agents** | NVIDIA NIM / OpenRouter / Mistral | Full FC support |
| **Embeddings / RAG** | Cohere / Google AI Studio | Specialized embedding models |
| **EU GDPR Compliance** | Mistral / OVHcloud | EU data centers |
| **No Key / Zero Config** | Pollinations.ai / Kilo Code | Anonymous access |
| **Image/Video Generation** | Agnes AI | Free image & video generation |
| **Chinese Language** | LLM7.io / DeepSeek | Optimized for Chinese |

---

*Auto-generated from `data/providers.json` via `scripts/generate_docs.py --comparison`*