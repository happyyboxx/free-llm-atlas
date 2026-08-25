# Gateway Configuration Guide

Integrate free LLMs into Hermes Agent, LiteLLM, Portkey, Open WebUI, and other gateways.

---

## 🤖 Hermes Agent Configuration

### Auto-Generate (Recommended)
```bash
cd free-llm-atlas
pip install -r scripts/requirements.txt
python3 scripts/probe.py --export-config hermes
# Generates config_hermes.yaml
```

### Manual Template (~/.hermes/config.yaml)
```yaml
models:
  # Groq - Blazing fast inference
  - model: "llama-3.3-70b-versatile"
    provider: "groq"
    api_base: "https://api.groq.com/openai/v1"
    api_key_env: "GROQ_API_KEY"
  
  # Google - Multimodal, long context, great Chinese
  - model: "gemini-1.5-flash"
    provider: "google"
    api_base: "https://generativelanguage.googleapis.com/v1beta"
    api_key_env: "GOOGLE_API_KEY"
  
  # NVIDIA NIM - Reasoning models, 1M context
  - model: "nvidia/nemotron-3-ultra-550b-a55b:free"
    provider: "openrouter"
    api_base: "https://openrouter.ai/api/v1"
    api_key_env: "OPENROUTER_API_KEY"
  
  # Z.AI - Domestic permanent free, strong Chinese
  - model: "glm-4.5-flash"
    provider: "z-ai"
    api_base: "https://api.z.ai/api/paas/v4"
    api_key_env: "ZAI_API_KEY"
  
  # Cohere - Strong Embedding/RAG
  - model: "command-r"
    provider: "cohere"
    api_base: "https://api.cohere.ai/v1"
    api_key_env: "COHERE_API_KEY"

# Fallback chain: auto-switch by priority
fallback_chain:
  - "llama-3.3-70b-versatile"      # Fastest
  - "gemini-1.5-flash"             # Multimodal/Chinese
  - "nvidia/nemotron-3-ultra-550b-a55b:free"  # Reasoning/long context
  - "glm-4.5-flash"                # Domestic low latency
  - "command-r"                    # RAG fallback

# Optional: Per-model parameter overrides
model_overrides:
  "nvidia/nemotron-3-ultra-550b-a55b:free":
    temperature: 0.3
    max_tokens: 4096
```

### Environment Variables
```bash
# ~/.bashrc or ~/.zshrc
export GROQ_API_KEY="gsk_xxx"
export GOOGLE_API_KEY="AIza_xxx"
export OPENROUTER_API_KEY="sk-or-xxx"
export ZAI_API_KEY="xxx"
export COHERE_API_KEY="xxx"

# Reload
source ~/.bashrc
```

---

## ⚡ LiteLLM Configuration

### Generate Config
```bash
python3 scripts/probe.py --export-config litellm
# Generates config_litellm.yaml
```

### Manual Config (config.yaml)
```yaml
model_list:
  # Groq
  - model_name: "llama-3.3-70b-versatile"
    litellm_params:
      model: "openai/llama-3.3-70b-versatile"
      api_base: "https://api.groq.com/openai/v1"
      api_key: "os.environ/GROQ_API_KEY"
  
  # Google
  - model_name: "gemini-1.5-flash"
    litellm_params:
      model: "gemini/gemini-1.5-flash"
      api_base: "https://generativelanguage.googleapis.com/v1beta"
      api_key: "os.environ/GOOGLE_API_KEY"
  
  # OpenRouter (Nemotron Ultra free)
  - model_name: "nvidia/nemotron-3-ultra-550b-a55b:free"
    litellm_params:
      model: "openrouter/nvidia/nemotron-3-ultra-550b-a55b:free"
      api_base: "https://openrouter.ai/api/v1"
      api_key: "os.environ/OPENROUTER_API_KEY"
  
  # Z.AI
  - model_name: "glm-4.5-flash"
    litellm_params:
      model: "openai/glm-4.5-flash"
      api_base: "https://api.z.ai/api/paas/v4"
      api_key: "os.environ/ZAI_API_KEY"
  
  # Cohere
  - model_name: "command-r"
    litellm_params:
      model: "cohere/command-r"
      api_base: "https://api.cohere.ai/v1"
      api_key: "os.environ/COHERE_API_KEY"

# Router settings: auto fallback
router_settings:
  routing_strategy: "latency-based-routing"
  fallback_models:
    - "llama-3.3-70b-versatile"
    - "gemini-1.5-flash"
    - "nvidia/nemotron-3-ultra-550b-a55b:free"
    - "glm-4.5-flash"
```

### Start LiteLLM Proxy
```bash
pip install litellm
litellm --config config.yaml --port 4000

# Test
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## 🔑 Portkey Configuration

### Generate Config
```bash
python3 scripts/probe.py --export-config portkey
# Generates config_portkey.yaml
```

### Manual Config (config.yaml)
```yaml
virtual_keys:
  # Groq
  "llama-3.3-70b-versatile":
    provider: "groq"
    api_base: "https://api.groq.com/openai/v1"
    api_key: "${GROQ_API_KEY}"
  
  # Google
  "gemini-1.5-flash":
    provider: "google"
    api_base: "https://generativelanguage.googleapis.com/v1beta"
    api_key: "${GOOGLE_API_KEY}"
  
  # OpenRouter
  "nvidia/nemotron-3-ultra-550b-a55b:free":
    provider: "openrouter"
    api_base: "https://openrouter.ai/api/v1"
    api_key: "${OPENROUTER_API_KEY}"
  
  # Z.AI
  "glm-4.5-flash":
    provider: "custom"
    api_base: "https://api.z.ai/api/paas/v4"
    api_key: "${ZAI_API_KEY}"
  
  # Cohere
  "command-r":
    provider: "cohere"
    api_base: "https://api.cohere.ai/v1"
    api_key: "${COHERE_API_KEY}"

# Fallback strategy
fallback:
  - "llama-3.3-70b-versatile"
  - "gemini-1.5-flash"
  - "nvidia/nemotron-3-ultra-550b-a55b:free"
  - "glm-4.5-flash"
```

### Start Portkey
```bash
# Docker
docker run -d \
  -p 8787:8787 \
  -v $(pwd)/config_portkey.yaml:/app/config.yaml \
  portkeyai/gateway:latest

# Or npm
npm install -g portkey-ai
portkey gateway --config config_portkey.yaml
```

---

## 🌐 Open WebUI Configuration

### Via Environment Variables (Simplest)
```bash
docker run -d -p 3000:8080 \
  -e OPENAI_API_BASE_URL="https://api.groq.com/openai/v1" \
  -e OPENAI_API_KEY="${GROQ_API_KEY}" \
  -e DEFAULT_MODEL="llama-3.3-70b-versatile" \
  ghcr.io/open-webui/open-webui:main
```

### Multi-Model Config (config.json)
```json
{
  "OPENAI_API_BASE_URLS": {
    "groq": "https://api.groq.com/openai/v1",
    "google": "https://generativelanguage.googleapis.com/v1beta",
    "openrouter": "https://openrouter.ai/api/v1",
    "z-ai": "https://api.z.ai/api/paas/v4",
    "cohere": "https://api.cohere.ai/v1"
  },
  "OPENAI_API_KEYS": {
    "groq": "${GROQ_API_KEY}",
    "google": "${GOOGLE_API_KEY}",
    "openrouter": "${OPENROUTER_API_KEY}",
    "z-ai": "${ZAI_API_KEY}",
    "cohere": "${COHERE_API_KEY}"
  },
  "MODELS": [
    {"name": "llama-3.3-70b-versatile", "provider": "groq"},
    {"name": "gemini-1.5-flash", "provider": "google"},
    {"name": "nvidia/nemotron-3-ultra-550b-a55b:free", "provider": "openrouter"},
    {"name": "glm-4.5-flash", "provider": "z-ai"},
    {"name": "command-r", "provider": "cohere"}
  ]
}
```

---

## 🔄 Universal Fallback Strategy Design

### Principles
1. **Speed First**: Groq (LPU) fastest → put first
2. **Capability Complement**: Multimodal (Google) + Reasoning (Nemotron) + Domestic (Z.AI) + RAG (Cohere)
3. **Quota Distribution**: Avoid exhausting single platform quota
4. **Geographic Distribution**: Global (Groq/Google/OpenRouter) + EU (Mistral) + CN (Z.AI)

### Recommended 5-Layer Fallback Chain
```
Layer 1: Groq (llama-3.3-70b)          # Extreme speed, high quota
Layer 2: Google (gemini-1.5-flash)     # Multimodal, Chinese, long context
Layer 3: NVIDIA NIM/Nemotron Ultra     # Strong reasoning, 1M ctx
Layer 4: Z.AI (glm-4.5-flash)          # Domestic low latency, native Chinese
Layer 5: Cohere (command-r) / Mistral  # RAG/EU compliance fallback
```

### Python Implementation
```python
import os
from openai import OpenAI

FALLBACK_CHAIN = [
    {"model": "llama-3.3-70b-versatile", "base_url": "https://api.groq.com/openai/v1", "key_env": "GROQ_API_KEY"},
    {"model": "gemini-1.5-flash", "base_url": "https://generativelanguage.googleapis.com/v1beta", "key_env": "GOOGLE_API_KEY"},
    {"model": "nvidia/nemotron-3-ultra-550b-a55b:free", "base_url": "https://openrouter.ai/api/v1", "key_env": "OPENROUTER_API_KEY"},
    {"model": "glm-4.5-flash", "base_url": "https://api.z.ai/api/paas/v4", "key_env": "ZAI_API_KEY"},
    {"model": "command-r", "base_url": "https://api.cohere.ai/v1", "key_env": "COHERE_API_KEY"},
]

def chat_with_fallback(messages, **kwargs):
    last_error = None
    for cfg in FALLBACK_CHAIN:
        key = os.environ.get(cfg["key_env"])
        if not key:
            continue
        try:
            client = OpenAI(base_url=cfg["base_url"], api_key=key)
            resp = client.chat.completions.create(
                model=cfg["model"], messages=messages, **kwargs
            )
            return resp.choices[0].message.content
        except Exception as e:
            last_error = e
            print(f"⚠️ {cfg['model']} failed: {e}, trying next...")
            continue
    raise RuntimeError(f"All fallbacks failed: {last_error}")

# Usage
print(chat_with_fallback([{"role": "user", "content": "Hello"}]))
```

---

## 📝 Environment Variables Checklist

Manage in `.env` or shell rc:

```bash
# === Permanent Free Tier ===
GROQ_API_KEY="gsk_xxx"                    # Groq
GOOGLE_API_KEY="AIza_xxx"                 # Google AI Studio
OPENROUTER_API_KEY="sk-or-xxx"            # OpenRouter
NVIDIA_NIM_API_KEY="xxx"                  # NVIDIA NIM (or use OpenRouter)
ZAI_API_KEY="xxx"                         # Z.AI
COHERE_API_KEY="xxx"                      # Cohere
MISTRAL_API_KEY="xxx"                     # Mistral
HUGGINGFACE_API_KEY="hf_xxx"              # HuggingFace
# GITHUB_MODELS_TOKEN="ghp_xxx"  # RETIRED: GitHub Models retired 2026-07-30             # GitHub Models (PAT)
KILO_API_KEY=""                           # Kilo Code (no key needed)
POLLINATIONS_API_KEY=""                   # Pollinations (no key needed)
OVH_API_KEY="xxx"                         # OVHcloud
LLM7_API_KEY="xxx"                        # LLM7.io

# === Domestic Platforms (Trial Credits) ===
SILICONFLOW_API_KEY="xxx"                 # SiliconFlow
VOLCENGINE_API_KEY="xxx"                  # VolcEngine
BAILIAN_API_KEY="xxx"                     # Bailian
HUNYUAN_API_KEY="xxx"                     # Tencent Hunyuan
MOONSHOT_API_KEY="xxx"                    # Moonshot Kimi
XINGHUO_API_KEY="xxx"                     # Xinghuo
MODELSCOPE_API_KEY="xxx"                  # ModelScope
DEEPSEEK_API_KEY="xxx"                    # DeepSeek

# === Trial Credit Tier (Card Required) ===
FIREWORKS_API_KEY="xxx"
FRIENDLI_API_KEY="xxx"
HYPERBOLIC_API_KEY="xxx"
NEBIUS_API_KEY="xxx"
NOVITA_API_KEY="xxx"
REPLICATE_API_KEY="xxx"
UPSTAGE_API_KEY="xxx"
SCALEWAY_API_KEY="xxx"
REQUESTY_API_KEY="xxx"
TOGETHER_API_KEY="xxx"
```

---

> Generated configs are based on live-tested active providers from `providers.json`. Run `python3 scripts/probe.py --export-config <target>` anytime to refresh.