# free-llm-atlas

> **46 free LLM API providers, auto-probed daily. Structured JSON + gateway configs. Zero cost to production.**

[![GitHub Stars](https://img.shields.io/github/stars/happyyboxx/free-llm-atlas?style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/stargazers)
[![Star History](https://api.star-history.com/svg?repos=happyyboxx/free-llm-atlas&type=Date&theme=dark)](https://star-history.com/#happyyboxx/free-llm-atlas&Date)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Automated Probe](https://img.shields.io/github/actions/workflow/status/happyyboxx/free-llm-atlas/probe.yml?label=Daily%20Probe&style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/actions/workflows/probe.yml)
[![Providers](https://img.shields.io/badge/Providers-46-blue?style=flat-square)](data/providers.json)
[![Free Forever](https://img.shields.io/badge/Free%20Forever-17%20no%20card-success?style=flat-square)](docs/platforms/permanent-free.md)

---

## 30-Second Quick Start

```bash
git clone https://github.com/happyyboxx/free-llm-atlas.git
cd free-llm-atlas

# Find free providers that need NO credit card
cat data/providers.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for p in d['providers']:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f\"  ✅ {p['name']}: {p.get('rate_limit', 'N/A')}\")
"

# Probe all 46 providers right now
pip install httpx pyyaml
python3 scripts/probe.py --all

# Export gateway config (Hermes / LiteLLM / Portkey)
python3 scripts/probe.py --export-config litellm > config.yaml
```

---

## Why This Exists

Every "free LLM API" list is **stale within a week**. Providers change limits, deprecate models, add cards, shut down endpoints. This project fixes that:

| Feature | How |
|---|---|
| **Daily auto-probe** | GitHub Actions hits all 46 providers every day at 06:00 UTC |
| **Structured data** | `providers.json` — machine-readable, not a markdown table |
| **Gateway configs** | Auto-generated Hermes / LiteLLM / Portkey YAML from probe results |
| **No-card filter** | 17 providers need zero credit card — clearly tagged |
| **Live status** | Git history = uptime dashboard. See which provider degraded when. |

---

## 📊 At a Glance

| Category | Count | Best For | Top Providers |
|---|---|---|---|
| **Permanent Free (no card)** | 17 | Production fallback chain | Google (Gemini 2M ctx), Groq (300+ tok/s), NIM (102 models), Cloudflare, Cohere |
| **Trial Credits** | 20 | Prototyping / evaluation | Fireworks, Novita ($0 models), Together, Replicate, Qwen |
| **Local Inference** | 9 | Privacy / offline / air-gapped | Ollama, LM Studio, llama.cpp, Jan.ai |
| **Tested Endpoints** | 40+ | All confirmed working as of last probe | ✅ 30 active / ⚠️ 4 degraded / ❌ 10 down |

### Zero-Cost Production Stack

```
Layer 1: Groq (speed, 300+ tok/s, 14.4K req/day)
Layer 2: Google AI Studio (multimodal, 2M context, 1.5K req/day)
Layer 3: NVIDIA NIM (reasoning, Nemotron Ultra 1M ctx, function calling)
Layer 4: Z.AI (Chinese, GLM-4, 60 RPM)

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
cat data/providers.json | jq '.providers[] | select(.features.function_calling == true) | .name'
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
```

### Use in Python

```python
import json

providers = json.load(open('data/providers.json'))['providers']

# Get all no-card free providers with their rate limits
for p in providers:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f"{p['name']:20s} | {p['rate_limit']:20s} | {p.get('context_window', '?'):>10}")
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
| [Trial Credits](docs/platforms/trial-credits.md) | 20 providers with credit amounts + expiry |
| [Local Inference](docs/platforms/local-inference.md) | 9 local tools: VRAM requirements, model support |
| [Decision Tree](docs/guides/decision-tree.md) | "Which provider should I use for X?" flowchart |
| [Gateway Config](docs/guides/gateway-config.md) | Hermes / LiteLLM / Portkey / Open WebUI setup |
| [Quick Start](docs/guides/quickstart.md) | 5-minute getting started guide |

---

## 📊 Data Sources

Aggregates and validates data from:

| Upstream | Stars | Type |
|---|---|---|
| [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | 28K+ | Auto-generated daily crawl |
| [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) | 17K+ | Runnable proxy tool |
| [mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | 6K+ | Strictly permanent free |
| [nejib1/Free-LLM](https://github.com/nejib1/Free-LLM) | 100+ | 43+ provider tracker |

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
