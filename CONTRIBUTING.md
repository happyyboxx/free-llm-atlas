# Contributing to free-llm-atlas

Thank you for contributing! This project aggregates and validates free LLM API providers. Your help keeps the data fresh and accurate.

---

## 🎯 Ways to Contribute

| Type | How |
|---|---|
| **New Provider** | Add to `data/providers.json` with all required fields |
| **Correction** | Fix rate limits, model lists, or endpoint URLs |
| **Probe Result** | Run `scripts/probe.py` and commit updated `last_probed`/`status` |
| **Documentation** | Improve `docs/` markdown files |
| **Automation** | Enhance GitHub Actions workflows or probe script |

---

## 📝 Adding a New Provider

### Required Fields in `providers.json`

```json
{
  "name": "Provider Name",
  "slug": "provider-slug",
  "tier": "permanent_free | trial_credit | local",
  "website": "https://provider.com",
  "api_base": "https://api.provider.com/v1",
  "models_endpoint": "/models",
  "requires_key": true,
  "requires_card": false,
  "rate_limit": {
    "rpm": 30,
    "rpd": 14400,
    "tpm": 40000
  },
  "models": ["model-id-1", "model-id-2"],
  "free_models": ["model-id-1"],
  "features": ["chat", "embeddings", "vision", "function_calling"],
  "region": "global | us | eu | cn",
  "notes": "Additional context",
  "source": "https://github.com/upstream-project",
  "last_probed": "2026-08-01T06:00:00Z",
  "status": "active | degraded | down | unknown"
}
```

### Tier Definitions

- **permanent_free**: No credit card, sustainable free tier (e.g., Google, Groq)
- **trial_credit**: One-time or time-limited credits (e.g., Fireworks, Novita)
- **local**: Runs on user hardware (e.g., Ollama, llama.cpp)

### Steps

1. Fork the repo
2. Add provider to `data/providers.json` (keep alphabetical by slug)
3. Run validation: `python3 scripts/probe.py --validate`
4. Submit PR with clear description

---

## 🔍 Running Probes

```bash
# Install deps
pip install -r scripts/requirements.txt

# Probe all
python3 scripts/probe.py --all

# Probe specific tier
python3 scripts/probe.py --tier permanent_free

# Dry run (no file changes)
python3 scripts/probe.py --dry-run
```

The script updates `last_probed`, `status`, and `models_count` in `providers.json`. Commit the changes.

---

## 📚 Documentation

Edit files in `docs/`:
- `docs/platforms/*.md` — platform detail pages
- `docs/guides/*.md` — decision tree, quickstart
- `docs/compliance/*.md` — ToS reviews

After editing, the site auto-deploys via GitHub Pages (if enabled).

---

## 🤖 Automation

GitHub Actions run daily/weekly:
- `.github/workflows/probe.yml` — daily endpoint health checks
- `.github/workflows/update.yml` — weekly upstream sync

Check the Actions tab for logs. Failed probes create issues automatically.

---

## 🧪 Testing

```bash
# Validate JSON schema
python3 -m json.tool data/providers.json > /dev/null && echo "Valid JSON"

# Run probe validation (checks required fields, URL format)
python3 scripts/probe.py --validate
```

---

## 📋 PR Checklist

- [ ] `data/providers.json` is valid JSON
- [ ] Required fields present for new providers
- [ ] `scripts/probe.py --validate` passes
- [ ] Documentation updated if needed
- [ ] Commit messages are clear

---

## 💬 Questions?

Open an issue or start a discussion. We're happy to help!
