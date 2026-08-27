# free-llm-atlas

> **19 free LLM API providers, auto-probed daily. Structured JSON + gateway configs. Zero cost to production.**

[![GitHub Stars](https://img.shields.io/github/stars/happyyboxx/free-llm-atlas?style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/stargazers)
[![Star History](https://api.star-history.com/svg?repos=happyyboxx/free-llm-atlas&type=Date&theme=dark)](https://star-history.com/#happyyboxx/free-llm-atlas&Date)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Automated Probe](https://img.shields.io/github/actions/workflow/status/happyyboxx/free-llm-atlas/probe.yml?label=Daily%20Probe&style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/actions/workflows/probe.yml)
[![Providers](https://img.shields.io/badge/Providers-19-blue?style=flat-square)](data/providers.json)
[![Free Forever](https://img.shields.io/badge/Free%20Forever-19%20no%20card-success?style=flat-square)](docs/platforms/permanent-free.md)
[![Last Probe](https://img.shields.io/github/last-commit/happyyboxx/free-llm-atlas?label=Last%20Probe&style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/commits/main/data/providers.json)
[![Data Freshness](https://img.shields.io/badge/Probe%20Schedule-Daily%2006%3A00%20UTC-orange?style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/actions/workflows/probe.yml)
[![Coverage](https://img.shields.io/badge/Coverage-19%2F19%20providers-brightgreen?style=flat-square)](data/providers.json)

---

## 30-Second Quick Start

```bash
git clone https://github.com/happyyboxx/free-llm-atlas.git
cd free-llm-atlas

# 1. Find free providers that need NO credit card
cat data/providers.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for p in d['providers']:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f'  ✅ {p[\"name\"]}: {p.get(\"rate_limit\", \"N/A\")}')"

# 2. Probe all providers right now
pip install httpx pyyaml
python3 scripts/probe.py --all

# 3. Export gateway config (Hermes / LiteLLM / Portkey / Open WebUI)
python3 scripts/probe.py --export-config hermes    > hermes.yaml
python3 scripts/probe.py --export-config litellm   > litellm.yaml
python3 scripts/probe.py --export-config portkey   > portkey.yaml
python3 scripts/probe.py --export-config openwebui > openwebui.yaml
```

---

## Why This Exists

Every "free LLM API" list is **stale within a week**. Providers change limits, deprecate models, add cards, shut down endpoints. This project fixes that:

| Feature | How |
|---|---|
| **Daily auto-probe** | GitHub Actions hits all **48** providers every day at 06:00 UTC |
| **Structured data** | `providers.json` — machine-readable, not a markdown table |
| **Gateway configs** | Auto-generated Hermes / LiteLLM / Portkey / Open WebUI YAML from probe results |
| **No-card filter** | **19** providers need zero credit card — clearly tagged |
| **Live status** | Git history = uptime dashboard. See which provider degraded when. |
| **Hidden limits exposed** | TPM, RPM, concurrent requests — the real bottlenecks |

---

## 🔑 Hidden Limits (The Key Insight)

**Most "free" lists only show daily request limits. The real bottlenecks are tokens/minute and concurrent requests:**

| Provider | Daily Req | **TPM** | **Concurrent** | Context | Best For |
|---|---|---|---|---|---|
| Groq | 14,400 | **6,000** | 10 | 8K | Low-latency streaming |
| Google AI Studio | 1,500 | **1,000,000** | 10 | 2M | Long context / multimodal |
| NVIDIA NIM | 1,000 | **1,000** | 5 | 1M | Reasoning, function calling |
| Cloudflare Workers AI | 100,000 | 100,000 | 20 | 8K | Edge / Workers |
| Cohere | 1,000 | 1,000 | 5 | 4K | Embeddings / rerank |
| Together AI | — | 3,000 | 5 | 8K | Open models |

> **Rule of thumb**: For chat apps, **TPM is the real limit**. 6K TPM on Groq = ~250 msg/min. For batch, daily limit matters more.

---

## 📊 At a Glance (Live from Last Probe)

| Category | Count | Best For | Top Providers |
|---|---|---|---|
| **Permanent Free (no card)** | **19** | Production fallback chain | Google (Gemini 2M ctx), Groq (300+ tok/s), NIM (102 models), Cloudflare, Cohere, OpenCode Zen, Ollama Cloud |
| **Trial Credits** | **2** | Prototyping / evaluation | Agnes AI (text), DeepSeek |
| **Local Inference** | **0** | Privacy / offline / air-gapped | See [Local Inference](docs/platforms/local-inference.md) |
| **Tested Endpoints** | **21** | All confirmed working | ✅ 15 active / ⚠️ 4 degraded / ❌ 1 down / ❓ 1 unknown |

### Zero-Cost Production Stack

```yaml
# Recommended fallback chain (configured in your gateway)
primary:    Groq          # Speed: 300+ tok/s, 14.4K req/day
secondary:  Google AI     # Context: 2M tokens, multimodal
tertiary:   NVIDIA NIM    # Reasoning: Nemotron Ultra 1M ctx, function calling
quaternary: Cloudflare    # Edge: Workers AI, 100K req/day
fallback:   Cohere        # Embedding/RAG: 1K req/month

→ Covers 95% of production workloads at $0
```

---

## 🚀 Usage

### Find the right provider

```bash
# All permanent free, no card
python3 scripts/probe.py --tier permanent_free --no-key

# Currently active providers (from last probe)
cat data/providers.json | jq '.providers[] | select(.status == "active") | .name'

# Providers with function calling support
cat data/providers.json | jq '.providers[] | select(.function_calling == true) | .name'

# Providers with ≥100K context
cat data/providers.json | jq '.providers[] | select(.context_window >= 100000) | .name'

# Highest TPM for streaming
cat data/providers.json | jq '.providers[] | select(.rate_limit.tpm > 5000) | "\(.name): \(.rate_limit.tpm) TPM"'
```

### Run the probe

```bash
# Probe all 46 providers
python3 scripts/probe.py --all

# Probe only permanent free tier
python3 scripts/probe.py --tier permanent_free

# Export to your gateway
python3 scripts/probe.py --export-config hermes    # → hermes.yaml
python3 scripts/probe.py --export-config litellm   # → litellm.yaml
python3 scripts/probe.py --export-config portkey   # → portkey.yaml
python3 scripts/probe.py --export-config openwebui # → openwebui.yaml
```

### Use in Python

```python
import json

providers = json.load(open('data/providers.json'))['providers']

# Get all no-card free providers with their rate limits
for p in providers:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f"{p['name']:20s} | TPM: {p.get('rate_limit', {}).get('tpm', '?'):>6} | Ctx: {p.get('context_window', '?'):>8}")

# Build a fallback chain sorted by TPM
fallback = sorted(
    [p for p in providers if p['tier'] == 'permanent_free' and not p.get('requires_card')],
    key=lambda x: x.get('rate_limit', {}).get('tpm', 0),
    reverse=True
)
for p in fallback:
    print(f"{p['name']}: {p.get('rate_limit', {}).get('tpm', 0)} TPM | ctx={p.get('context_window', '?')}")
```

---

## 🔄 Daily Automation

| Workflow | Schedule | Output |
|---|---|---|
| `probe.yml` | Daily 06:00 UTC | `data/providers.json` status + metrics updated |
| `update.yml` | Weekly Mon 00:00 UTC | New providers synced from upstream sources |

**Git history = uptime dashboard.** Every commit shows which providers changed status.

---

## 📖 Documentation

| Doc | What's Inside |
|---|---|
| [Permanent Free Tier](docs/platforms/permanent-free.md) | 17 providers compared: rate limits, context, features |
| [Trial Credits](docs/platforms/trial-credits.md) | 2 providers with credit amounts + expiry |
| [Local Inference](docs/platforms/local-inference.md) | 9 local tools: VRAM requirements, model support |
| [Decision Tree](docs/guides/decision-tree.md) | "Which provider should I use for X?" flowchart |
| [Gateway Config](docs/guides/gateway-config.md) | Hermes / LiteLLM / Portkey / Open WebUI setup |
| [Quick Start](docs/guides/quickstart.md) | 5-minute getting started guide |
| [Hidden Limits](docs/guides/hidden-limits.md) | TPM vs daily, concurrent requests, context windows |
| [Provider Comparison](docs/platforms/comparison.md) | Detailed table: RPM, TPM, context, features, health scores |

---

## 📊 Data Sources

Aggregates and validates data from:

| Upstream | Stars | Type |
|---|---|---|
| [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | 28K+ | Auto-generated daily crawl |
| [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) | 17K+ | Runnable proxy tool |
| [mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | 6K+ | Strictly permanent free |
| [nejib1/Free-LLM](https://github.com/nejib1/Free-LLM) | 100+ | 43+ provider tracker |
| [opencode-ai/opencode](https://github.com/opencode-ai/opencode) | 15K+ | OpenCode Zen free models |
| [ollama/ollama](https://github.com/ollama/ollama) | 100K+ | Ollama Cloud free tier |

---

## 🛠 Gateway Config Examples

### Hermes Agent
```yaml
# hermes.yaml (generated by probe.py --export-config hermes)
providers:
  - name: groq
    api_key: ${GROQ_API_KEY}
    base_url: https://api.groq.com/openai/v1
    models:
      - llama-3.3-70b-versatile
      - gemma2-9b-it
    priority: 1
  
  - name: google
    api_key: ${GOOGLE_API_KEY}
    base_url: https://generativelanguage.googleapis.com/v1beta
    models:
      - gemini-1.5-pro
      - gemini-1.5-flash
    priority: 2
  
  - name: nvidia
    api_key: ${NVIDIA_API_KEY}
    base_url: https://integrate.api.nvidia.com/v1
    models:
      - nemotron-3-ultra
    priority: 3
```

### LiteLLM
```yaml
# litellm.yaml
model_list:
  - model_name: groq/llama-3.3-70b-versatile
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY
      rpm: 6000
  - model_name: google/gemini-1.5-pro
    litellm_params:
      model: google/gemini-1.5-pro
      api_key: os.environ/GOOGLE_API_KEY
      rpm: 1000000
```

### Portkey
```yaml
# portkey.yaml
providers:
  - provider: groq
    api_key: ${GROQ_API_KEY}
    weight: 0.5
  - provider: google
    api_key: ${GOOGLE_API_KEY}
    weight: 0.3
  - provider: nvidia
    api_key: ${NVIDIA_API_KEY}
    weight: 0.2
strategy: fallback
```

---

## 🎯 Production Checklist

Before going to production with this free stack:

- [ ] **Set up monitoring** — Alert on 429/rate limit errors
- [ ] **Configure timeouts** — Free tiers often have higher latency variance
- [ ] **Implement fallback** — Chain 3+ providers (see Zero-Cost Stack above)
- [ ] **Track TPM, not just daily** — 6K TPM on Groq ≠ 14.4K req/day for streaming
- [ ] **Test concurrent load** — 10 concurrent on Groq free = instant 429
- [ ] **Cache embeddings** — Cohere free tier is generous but not infinite
- [ ] **Plan for degradation** — 4 degraded / 10 down is normal; have backups

---

## 🤝 Contributing

PRs welcome! Read [CONTRIBUTING.md](CONTRIBUTING.md).

- **Add a provider** → Edit `data/providers.json` or open an issue
- **Fix probe results** → Run `scripts/probe.py` and commit updated results
- **Improve docs** → Edit markdown under `docs/`

---

## ⚖️ License & Disclaimer

**MIT License** — see [LICENSE](LICENSE).

- Free tiers, rate limits, and model availability **change frequently** — always verify against official docs
- This project aggregates publicly available information — **no API keys are provided**
- For commercial use, always read each platform's ToS

---

**Star ⭐ this project if it saved you time finding the right free LLM API.**