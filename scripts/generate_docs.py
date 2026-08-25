#!/usr/bin/env python3
"""
Generate documentation markdown files from data/providers.json.

Usage:
    python3 scripts/generate_docs.py              # Generate all docs
    python3 scripts/generate_docs.py --overview   # Generate overview only
    python3 scripts/generate_docs.py --comparison # Generate comparison table only
"""

import json
import argparse
from pathlib import Path
from datetime import datetime, timezone

DATA_FILE = Path(__file__).parent.parent / "data" / "providers.json"
DOCS_DIR = Path(__file__).parent.parent / "docs"

def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def generate_overview(data):
    """Generate platforms/overview.md from providers.json"""
    providers = data.get("providers", [])
    
    lines = [
        "# Platforms Overview (Auto-generated)",
        "",
        f"> Last updated: {data.get('updated', 'N/A')}",
        "",
        "| Platform | Tier | Requires Key | Requires Card | Region | Status |",
        "|---|---|---|---|---|---|",
    ]
    
    for p in sorted(providers, key=lambda x: (x["tier"], x["name"])):
        key = "✅" if p.get("requires_key") else "❌"
        card = "✅" if p.get("requires_card") else "❌"
        status_emoji = {"active": "✅", "degraded": "⚠️", "down": "❌", "unknown": "❓"}.get(p.get("status", "unknown"), "❓")
        lines.append(f"| {p['name']} | {p['tier']} | {key} | {card} | {p.get('region', '?')} | {status_emoji} |")
    
    return "\n".join(lines)

def translate_notes(notes):
    """Translate common Chinese phrases in notes to English"""
    translations = {
        "免费文本推理: 30 RPM 公开 / 20 实际 RPM; 512K 上下文; 支持工具调用、代码、推理、多轮对话、视觉输入; 无需信用卡; 需登录 Dashboard 领 credits": 
            "Free text inference: 30 RPM public / 20 actual RPM; 512K context; supports tool calling, code, reasoning, multi-turn, vision; no credit card; requires Dashboard login for credits",
        "有限免费额度，代码能力强": "Limited free tier, strong coding ability",
    }
    for zh, en in translations.items():
        if zh in notes:
            notes = notes.replace(zh, en)
    return notes

def generate_comparison(data):
    """Generate platforms/comparison.md with detailed comparison table"""
    providers = data.get("providers", [])
    permanent_free = [p for p in providers if p.get("tier") == "permanent_free"]
    trial_credit = [p for p in providers if p.get("tier") == "trial_credit"]
    
    lines = [
        "# Provider Comparison Table (Auto-generated)",
        "",
        f"> Last updated: {data.get('updated', 'N/A')}",
        "",
        "## Permanent Free Tier (No Card Required)",
        "",
        "| Provider | Status | Health | RPM | TPM | Context | Max Output | Features | Region |",
        "|---|---|---|---|---|---|---|---|---|",
    ]
    
    for p in sorted(permanent_free, key=lambda x: x.get("health_score", 0), reverse=True):
        status_emoji = {"active": "✅", "degraded": "⚠️", "down": "❌", "unknown": "❓"}.get(p.get("status", "unknown"), "❓")
        rpm = p.get("rate_limit", {}).get("rpm", p.get("rate_limit", {}).get("rps", 0) * 60 if p.get("rate_limit", {}).get("rps") else 0)
        tpm = p.get("rate_limit", {}).get("tpm", p.get("rate_limit", {}).get("daily_neurons", 0))
        ctx = p.get("context_window", "?")
        max_out = p.get("max_output_tokens", "?")
        features = ", ".join(p.get("features", [])) if p.get("features") else "—"
        health = p.get("health_score", 0)
        lines.append(f"| {p['name']} | {status_emoji} | {health} | {rpm} | {tpm} | {ctx} | {max_out} | {features} | {p.get('region', '?')} |")
    
    lines.extend([
        "",
        "## Trial Credit Providers",
        "",
        "| Provider | Status | Health | RPM | TPM | Context | Max Output | Features | Region | Notes |",
        "|---|---|---|---|---|---|---|---|---|---|",
    ])
    
    for p in sorted(trial_credit, key=lambda x: x.get("health_score", 0), reverse=True):
        status_emoji = {"active": "✅", "degraded": "⚠️", "down": "❌", "unknown": "❓"}.get(p.get("status", "unknown"), "❓")
        rpm = p.get("rate_limit", {}).get("rpm", p.get("rate_limit", {}).get("rps", 0) * 60 if p.get("rate_limit", {}).get("rps") else 0)
        tpm = p.get("rate_limit", {}).get("tpm", 0)
        ctx = p.get("context_window", "?")
        max_out = p.get("max_output_tokens", "?")
        features = ", ".join(p.get("features", [])) if p.get("features") else "—"
        health = p.get("health_score", 0)
        notes = p.get("notes", "").replace("|", "\\|")[:80]
        notes = translate_notes(notes)
        lines.append(f"| {p['name']} | {status_emoji} | {health} | {rpm} | {tpm} | {ctx} | {max_out} | {features} | {p.get('region', '?')} | {notes} |")
    
    lines.extend([
        "",
        "## Quick Selection Guide",
        "",
        "| Use Case | Recommended Provider | Why |",
        "|---|---|---|",
        "| **Maximum Speed** | Groq | LPU hardware, 300+ tok/s |",
        "| **Longest Context (1M+)** | NVIDIA NIM (Nemotron Ultra) / OpenRouter | 1M context window |",
        "| **Multimodal (Vision/Audio)** | Google AI Studio / GitHub Models | Native multimodal support |",
        "| **Function Calling / Agents** | NVIDIA NIM / OpenRouter / Mistral | Full FC support |",
        "| **Embeddings / RAG** | Cohere / Google AI Studio | Specialized embedding models |",
        "| **EU GDPR Compliance** | Mistral / OVHcloud | EU data centers |",
        "| **No Key / Zero Config** | Pollinations.ai / Kilo Code | Anonymous access |",
        "| **Image/Video Generation** | Agnes AI | Free image & video generation |",
        "| **Chinese Language** | LLM7.io / DeepSeek | Optimized for Chinese |",
        "",
        "---",
        "",
        "*Auto-generated from `data/providers.json` via `scripts/generate_docs.py --comparison`*",
    ])
    
    return "\n".join(lines)

def main():
    parser = argparse.ArgumentParser(description="Generate docs from providers.json")
    parser.add_argument("--overview", action="store_true", help="Generate overview only")
    parser.add_argument("--comparison", action="store_true", help="Generate comparison table only")
    args = parser.parse_args()
    
    data = load_data()
    
    if args.overview or (not args.comparison and not args.overview):
        overview = generate_overview(data)
        out = DOCS_DIR / "platforms" / "overview.md"
        out.write_text(overview, encoding="utf-8")
        print(f"Generated {out}")
    
    if args.comparison or (not args.overview and not args.comparison):
        comparison = generate_comparison(data)
        out = DOCS_DIR / "platforms" / "comparison.md"
        out.write_text(comparison, encoding="utf-8")
        print(f"Generated {out}")

if __name__ == "__main__":
    main()