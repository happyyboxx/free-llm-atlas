# free-llm-atlas

> **Free LLM Atlas** — A curated atlas of free large language model API platforms. Covers 70+ platforms, 43+ providers, 40+ tested endpoints, with structured data, automated probing scripts, and deployable gateway configs.

[![GitHub Stars](https://img.shields.io/github/stars/happyyboxx/free-llm-atlas?style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Automated Probe](https://img.shields.io/github/actions/workflow/status/happyyboxx/free-llm-atlas/probe.yml?label=Probe&style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/actions/workflows/probe.yml)

---

## 📊 Coverage Overview

| Category | Count | Examples |
|---|---|---|
| **Permanent Free Tier (no card)** | 17 | Google, Groq, Cerebras, HuggingFace, Cloudflare, Cohere, Mistral, OVH, Inference.net, Z.AI, Coze, GLM |
| **Trial Credits** | 20 | Fireworks, Friendli, Hyperbolic, Nebius, Novita, Replicate, Upstage, Qwen, Scaleway, Requesty, Together |
| **Local Inference** | 9 | Ollama, LM Studio, GPT4All, llama.cpp, Jan.ai, KoboldCpp, llamafile, Text Gen, BentoML |
| **Tested Endpoints** | 40+ | Including zero-key direct, key-required, changed/deprecated |

---

## 🗂️ Repository Structure

```
free-llm-atlas/
├── data/
│   └── providers.json          # Structured provider data (machine-readable)
├── docs/
│   ├── index.md                # Documentation site entry
│   ├── platforms/              # Platform detail pages
│   ├── guides/                 # Selection guides / decision tree
│   └── compliance/             # ToS compliance review
├── scripts/
│   ├── probe.py                # Automated probing script (GitHub Actions ready)
│   ├── generate_docs.py        # Generate docs from providers.json
│   └── update_providers.py     # Sync provider list from upstream repos
├── .github/workflows/
│   ├── probe.yml               # Daily probe (06:00 UTC)
│   └── update.yml              # Weekly upstream sync
├── LICENSE
├── CONTRIBUTING.md
├── README.md                   # English (this file)
└── README_zh.md                # Chinese
```

---

## 🚀 Quick Start

### 1. Explore Structured Data

```bash
# Query JSON directly
cat data/providers.json | jq '.providers[] | select(.tier=="permanent_free") | .name'

# Use in Python
python3 -c "
import json
d = json.load(open('data/providers.json'))
for p in d['providers']:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f\"{p['name']}: {p['rate_limit']}\")"
```

### 2. Run the Probe Script

```bash
# Install dependencies
pip install httpx pyyaml

# Probe all endpoints
python3 scripts/probe.py --all

# Probe only no-key platforms
python3 scripts/probe.py --tier permanent_free --no-key
```

### 3. Export Gateway Config

```bash
# Generate Hermes / LiteLLM / Portkey config
python3 scripts/probe.py --export-config hermes
python3 scripts/probe.py --export-config litellm
python3 scripts/probe.py --export-config portkey
```

---

## 📖 Documentation

| Document | Description |
|---|---|
| [Platforms Overview](docs/platforms/overview.md) | All platforms categorized summary |
| [Permanent Free Tier](docs/platforms/permanent-free.md) | 17 permanent free tier platforms compared |
| [Trial Credits](docs/platforms/trial-credits.md) | 20 trial credit platforms compared |
| [Local Inference](docs/platforms/local-inference.md) | 9 local inference solutions |
| [Decision Tree](docs/guides/decision-tree.md) | Selection decision tree |
| [Quick Start](docs/guides/quickstart.md) | 5-minute getting started guide |
| [Gateway Config](docs/guides/gateway-config.md) | Hermes / LiteLLM / Portkey / Open WebUI setup |
| [ToS Compliance](docs/compliance/tos-review.md) | Terms of service compliance review |

---

## 🔄 Automation

| Workflow | Frequency | Output |
|---|---|---|
| `probe.yml` | Daily 06:00 UTC | Updates `data/providers.json` with `status`, `last_probed`, `models_count` |
| `update.yml` | Weekly Mon 00:00 UTC | Syncs new providers from cheahjs/free-llm-api-resources, nejib1/Free-LLM, etc. |

---

## 🤝 Contributing

PRs welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

- **Add a provider**: Modify `data/providers.json` or open an issue
- **Fix probe results**: Run `scripts/probe.py` and commit updated results
- **Improve docs**: Edit markdown files under `docs/`

---

## 📜 Data Sources

This project aggregates and validates data from the following upstream projects:

| Upstream | Stars | Type |
|---|---|---|
| [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | 28,638 | Auto-generated list (daily crawl) |
| [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) | 17,271 | Runnable proxy tool |
| [mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | 6,083 | Strictly permanent free list |
| [nejib1/Free-LLM](https://github.com/nejib1/Free-LLM) | 108 | 43+ provider single source of truth |
| [open-free-llm-api/awesome-freellm-apis](https://github.com/open-free-llm-api/awesome-freellm-apis) | 908 | Daily auto-updated |

---

## ⚖️ License

MIT License — see [LICENSE](LICENSE).

---

## ⚠️ Disclaimer

- Free tiers, rate limits, and model availability **change frequently** — always verify against official docs
- This project only aggregates publicly available information — **no API keys are provided**, no guarantee of service availability
- For commercial use, always read each platform's ToS and confirm compliance
- The probe script performs **lightweight availability sampling** only — it does not send high-volume requests

---

**Star ⭐ this project to stay updated on the free LLM landscape!**
