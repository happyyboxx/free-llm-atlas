# 网关配置落地指南

将免费 LLM 接入 Hermes Agent / LiteLLM / Portkey / Open WebUI 等网关。

---

## 🤖 Hermes Agent 配置

### 自动生成 (推荐)
```bash
cd free-llm-atlas
pip install -r scripts/requirements.txt
python3 scripts/probe.py --export-config hermes
# 生成 config_hermes.yaml
```

### 手动配置模板 (~/.hermes/config.yaml)
```yaml
models:
  # Groq - 极速推理
  - model: "llama-3.3-70b-versatile"
    provider: "groq"
    api_base: "https://api.groq.com/openai/v1"
    api_key_env: "GROQ_API_KEY"
  
  # Google - 多模态、长上下文、中文好
  - model: "gemini-1.5-flash"
    provider: "google"
    api_base: "https://generativelanguage.googleapis.com/v1beta"
    api_key_env: "GOOGLE_API_KEY"
  
  # NVIDIA NIM - 推理模型、1M 上下文
  - model: "nvidia/nemotron-3-ultra-550b-a55b:free"
    provider: "openrouter"
    api_base: "https://openrouter.ai/api/v1"
    api_key_env: "OPENROUTER_API_KEY"
  
  # Z.AI - 国内永久免费、中文强
  - model: "glm-4.5-flash"
    provider: "z-ai"
    api_base: "https://api.z.ai/api/paas/v4"
    api_key_env: "ZAI_API_KEY"
  
  # Cohere - Embedding/RAG 强
  - model: "command-r"
    provider: "cohere"
    api_base: "https://api.cohere.ai/v1"
    api_key_env: "COHERE_API_KEY"

# Fallback 链：按优先级自动切换
fallback_chain:
  - "llama-3.3-70b-versatile"      # 最快
  - "gemini-1.5-flash"             # 多模态/中文
  - "nvidia/nemotron-3-ultra-550b-a55b:free"  # 推理/长上下文
  - "glm-4.5-flash"                # 国内低延迟
  - "command-r"                    # RAG 备选

# 可选：每模型参数覆盖
model_overrides:
  "nvidia/nemotron-3-ultra-550b-a55b:free":
    temperature: 0.3
    max_tokens: 4096
```

### 环境变量设置
```bash
# ~/.bashrc 或 ~/.zshrc
export GROQ_API_KEY="gsk_xxx"
export GOOGLE_API_KEY="AIza_xxx"
export OPENROUTER_API_KEY="sk-or-xxx"
export ZAI_API_KEY="xxx"
export COHERE_API_KEY="xxx"

# 重新加载
source ~/.bashrc
```

---

## ⚡ LiteLLM 配置

### 生成配置
```bash
python3 scripts/probe.py --export-config litellm
# 生成 config_litellm.yaml
```

### 手动配置 (config.yaml)
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
  
  # OpenRouter (Nemotron Ultra 免费)
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

# Router 设置：自动 fallback
router_settings:
  routing_strategy: "latency-based-routing"
  fallback_models:
    - "llama-3.3-70b-versatile"
    - "gemini-1.5-flash"
    - "nvidia/nemotron-3-ultra-550b-a55b:free"
    - "glm-4.5-flash"
```

### 启动 LiteLLM Proxy
```bash
pip install litellm
litellm --config config.yaml --port 4000

# 测试
curl -X POST http://localhost:4000/v1/chat/completions   -H "Content-Type: application/json"   -d '{"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "你好"}]}'
```

---

## 🔑 Portkey 配置

### 生成配置
```bash
python3 scripts/probe.py --export-config portkey
# 生成 config_portkey.yaml
```

### 手动配置 (config.yaml)
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

# Fallback 策略
fallback:
  - "llama-3.3-70b-versatile"
  - "gemini-1.5-flash"
  - "nvidia/nemotron-3-ultra-550b-a55b:free"
  - "glm-4.5-flash"
```

### 启动 Portkey
```bash
# Docker 方式
docker run -d   -p 8787:8787   -v $(pwd)/config_portkey.yaml:/app/config.yaml   portkeyai/gateway:latest

# 或 npm
npm install -g portkey-ai
portkey gateway --config config_portkey.yaml
```

---

## 🌐 Open WebUI 配置

### 通过环境变量 (最简单)
```bash
docker run -d -p 3000:8080   -e OPENAI_API_BASE_URL="https://api.groq.com/openai/v1"   -e OPENAI_API_KEY="${GROQ_API_KEY}"   -e DEFAULT_MODEL="llama-3.3-70b-versatile"   ghcr.io/open-webui/open-webui:main
```

### 多模型配置 (config.json)
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

## 🔄 通用 Fallback 策略设计

### 原则
1. **速度优先**：Groq (LPU) 最快 → 放第一位
2. **能力互补**：多模态 (Google) + 推理 (Nemotron) + 国内 (Z.AI) + RAG (Cohere)
3. **额度分散**：避免单一平台耗尽额度
4. **地域分散**：全球 (Groq/Google/OpenRouter) + EU (Mistral) + CN (Z.AI)

### 推荐 5 层 Fallback 链
```
Layer 1: Groq (llama-3.3-70b)          # 极速，高额度
Layer 2: Google (gemini-1.5-flash)     # 多模态，中文好，长上下文
Layer 3: NVIDIA NIM/Nemotron Ultra     # 推理强，1M ctx
Layer 4: Z.AI (glm-4.5-flash)          # 国内低延迟，中文原生
Layer 5: Cohere (command-r) / Mistral  # RAG/EU 合规兜底
```

### 代码实现 (Python)
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
            print(f"⚠️ {cfg['model']} 失败: {e}，尝试下一个...")
            continue
    raise RuntimeError(f"所有 fallback 均失败: {last_error}")

# 使用
print(chat_with_fallback([{"role": "user", "content": "你好"}]))
```

---

## 📝 环境变量清单

在 `.env` 或 shell rc 中统一管理：

```bash
# === 永久免费层 ===
GROQ_API_KEY="gsk_xxx"                    # Groq
GOOGLE_API_KEY="AIza_xxx"                 # Google AI Studio
OPENROUTER_API_KEY="sk-or-xxx"            # OpenRouter
NVIDIA_NIM_API_KEY="xxx"                  # NVIDIA NIM (或用 OpenRouter)
ZAI_API_KEY="xxx"                         # Z.AI 智谱
COHERE_API_KEY="xxx"                      # Cohere
MISTRAL_API_KEY="xxx"                     # Mistral
HUGGINGFACE_API_KEY="hf_xxx"              # HuggingFace
GITHUB_MODELS_TOKEN="ghp_xxx"             # GitHub Models (PAT)
KILO_API_KEY=""                           # Kilo Code (无需 Key)
POLLINATIONS_API_KEY=""                   # Pollinations (无需 Key)
OVH_API_KEY="xxx"                         # OVHcloud
LLM7_API_KEY="xxx"                        # LLM7.io

# === 国内平台 (试用额度) ===
SILICONFLOW_API_KEY="xxx"                 # 硅基流动
VOLCENGINE_API_KEY="xxx"                  # 火山引擎
BAILIAN_API_KEY="xxx"                     # 百炼
HUNYUAN_API_KEY="xxx"                     # 腾讯混元
MOONSHOT_API_KEY="xxx"                    # 月之暗面 Kimi
XINGHUO_API_KEY="xxx"                     # 讯飞星火
MODELSCOPE_API_KEY="xxx"                  # 魔搭
DEEPSEEK_API_KEY="xxx"                    # DeepSeek

# === 试用额度类 (需卡) ===
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

> 生成的配置文件基于 `providers.json` 实测活跃的 provider。运行 `python3 scripts/probe.py --export-config <target>` 可随时刷新。
