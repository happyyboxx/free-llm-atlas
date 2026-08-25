# Quick Start Guide

Get up and running with free LLMs in 5 minutes.

---

## 🚀 3 Steps

### Step 1: Pick a Platform (30 seconds)

| Your Situation | Use This |
|---|---|
| **Zero registration** | [Pollinations.ai](https://text.pollinations.ai) - open webpage, use instantly |
| **Code access, no key** | [Kilo Code](https://kilo.ai) - `curl https://api.kilo.ai/api/gateway/v1/models` |
| **Willing to register, want best free models** | [Google AI Studio](https://aistudio.google.com) / [Groq](https://console.groq.com) / [NVIDIA NIM](https://build.nvidia.com) |
| **Free GPT-5 / Claude** | [GitHub Models](https://github.com/marketplace/models) |
| **China, Chinese, low latency** | [Z.AI](https://z.ai) (GLM permanent free) / [Coze](https://coze.com) |
| **Local, absolute privacy** | `curl -fsSL https://ollama.com/install.sh | sh` then `ollama run llama3.1` |

---

### Step 2: Get API Key (if needed)

| Platform | How to Get Key |
|---|---|
| Google AI Studio | aistudio.google.com → Get API Key |
| Groq | console.groq.com → API Keys → Create |
| NVIDIA NIM | build.nvidia.com → API Keys (requires phone verification) |
| GitHub Models | GitHub Settings → Developer settings → Personal access tokens |
| OpenRouter | openrouter.ai → Keys |
| Z.AI | z.ai → API Key |
| SiliconFlow/VolcEngine/Bailian | Respective console → API Key (requires real-name verification) |

---

### Step 3: First Line of Code

#### Python (Universal OpenAI SDK)
```python
from openai import OpenAI
import os

# Pick one platform, fill in corresponding base_url and api_key
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",  # Groq
    api_key=os.environ.get("GROQ_API_KEY")      # Put key in env var
)

resp = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Introduce yourself in one sentence"}],
    max_tokens=100
)
print(resp.choices[0].message.content)
```

#### curl (No SDK Needed)
```bash
# Groq example
curl -X POST https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer ***" \
  -H "Content-Type: application/json" \
  -d '{"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "Hello"}]}'

# Pollinations (no key needed)
curl "https://text.pollinations.ai/Hello,%20introduce%20yourself"
```

#### Node.js
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

const resp = await client.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: 'Hello' }],
});
console.log(resp.choices[0].message.content);
```

---

## 🔧 Advanced: Configure Fallback Chain (Hermes Agent)

If you use Hermes Agent, use the auto-generated config:

```bash
# 1. Clone this repo
git clone https://github.com/happyyboxx/free-llm-atlas
cd free-llm-atlas

# 2. Install probe dependencies
pip install -r scripts/requirements.txt

# 3. Generate Hermes config
python3 scripts/probe.py --export-config hermes
# Generates config_hermes.yaml

# 4. Merge into ~/.hermes/config.yaml
# Copy models and fallback_chain sections
```

The generated config includes all **live-tested active** permanent free models, sorted by speed/quality.

---

## 📦 One-Click Local Deployment (Ollama)

```bash
# Install
curl -fsSL https://ollama.com/install.sh | sh

# Run a model (auto-downloads in background)
ollama run llama3.1:8b

# Or serve as background service
ollama serve &
# Then use OpenAI SDK pointing to http://localhost:11434/v1
```

Common model tags:
```bash
ollama run llama3.1:8b      # 8B fast
ollama run llama3.3:70b     # 70B strong (needs 48GB+ RAM)
ollama run qwen2.5:72b      # Strong Chinese
ollama run deepseek-r1:70b  # Reasoning model
ollama run gemma2:27b       # Google open source
ollama run phi3.5:3.8b      # Microsoft small but strong
```

---

## ❓ FAQ

| Problem | Solution |
|---|---|
| **401 Unauthorized** | Key expired/wrong, regenerate; check env var name |
| **429 Rate Limited** | Hit rate limit, wait or switch fallback; Groq/Google have generous free quotas |
| **Connection timeout** | China accessing foreign APIs needs proxy; or use domestic platforms (Z.AI/SiliconFlow/VolcEngine/Bailian) |
| **Model not found** | Model ID changed, check `/models` endpoint or latest providers.json list |
| **Poor Chinese results** | Use Chinese-optimized models: GLM (Z.AI), Qwen (SiliconFlow/Bailian), Nemotron Ultra (OpenRouter/NIM) |

---

## 🎯 Next Steps

- Read [Decision Tree](decision-tree.md) for precise matching
- See [Permanent Free Tier Comparison](../platforms/permanent-free.md) for deep selection
- Run `python3 scripts/probe.py --all` to auto-probe latest availability
- Star this repo ⭐ to track free LLM updates