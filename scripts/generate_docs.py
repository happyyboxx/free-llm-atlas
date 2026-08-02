#!/usr/bin/env python3
"""
Generate documentation markdown files from data/providers.json.

Usage:
    python3 scripts/generate_docs.py              # Generate all docs
    python3 scripts/generate_docs.py --overview   # Generate overview only
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

def main():
    parser = argparse.ArgumentParser(description="Generate docs from providers.json")
    parser.add_argument("--overview", action="store_true", help="Generate overview only")
    args = parser.parse_args()
    
    data = load_data()
    
    if args.overview or not args.overview:
        overview = generate_overview(data)
        out = DOCS_DIR / "platforms" / "overview.md"
        out.write_text(overview, encoding="utf-8")
        print(f"✅ Generated {out}")

if __name__ == "__main__":
    main()
