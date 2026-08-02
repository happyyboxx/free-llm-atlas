#!/usr/bin/env python3
"""
Sync provider list from upstream GitHub repositories.

Usage:
    python3 scripts/update_providers.py              # Sync all upstreams
    python3 scripts/update_providers.py --dry-run     # Show changes without writing
    python3 scripts/update_providers.py --source cheahjs  # Sync specific upstream
"""

import json
import argparse
from pathlib import Path
from datetime import datetime, timezone

try:
    import httpx
except ImportError:
    print("Install dependency: uv pip install httpx")
    exit(1)

DATA_FILE = Path(__file__).parent.parent / "data" / "providers.json"

UPSTREAMS = {
    "cheahjs": {
        "url": "https://raw.githubusercontent.com/cheahjs/free-llm-api-resources/main/README.md",
        "type": "markdown_table",
    },
    "nejib1": {
        "url": "https://raw.githubusercontent.com/nejib1/Free-LLM/main/free-llm.json",
        "type": "json",
    },
    "open-free-llm-api": {
        "url": "https://raw.githubusercontent.com/open-free-llm-api/awesome-freellm-apis/main/data/providers.json",
        "type": "json",
    },
}

def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def fetch_upstream(name, source_url, source_type):
    """Fetch and parse upstream provider data."""
    print(f"Fetching from {name}...")
    resp = httpx.get(source_url, timeout=30, follow_redirects=True)
    resp.raise_for_status()
    
    if source_type == "json":
        return resp.json()
    elif source_type == "markdown_table":
        # Parse markdown tables — return raw text for manual review
        return {"raw": resp.text[:5000], "note": "Manual review needed for markdown parsing"}
    return None

def merge_providers(existing, new_providers):
    """Merge new providers into existing data."""
    existing_slugs = {p["slug"] for p in existing}
    added = []
    
    for np in new_providers:
        slug = np.get("slug", "")
        if slug and slug not in existing_slugs:
            existing.append(np)
            added.append(slug)
    
    return added

def main():
    parser = argparse.ArgumentParser(description="Sync providers from upstream")
    parser.add_argument("--dry-run", action="store_true", help="Show changes without writing")
    parser.add_argument("--source", choices=list(UPSTREAMS.keys()), help="Sync specific source only")
    args = parser.parse_args()
    
    data = load_data()
    sources = [args.source] if args.source else list(UPSTREAMS.keys())
    
    for name in sources:
        up = UPSTREAMS[name]
        try:
            result = fetch_upstream(name, up["url"], up["type"])
            if isinstance(result, dict) and "providers" in result:
                added = merge_providers(data["providers"], result["providers"])
                print(f"  Added {len(added)} new providers: {added}")
            elif isinstance(result, dict) and "raw" in result:
                print(f"  Fetched {len(result['raw'])} chars (manual review needed)")
            else:
                print(f"  Fetched data (type: {type(result).__name__})")
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    data["updated"] = datetime.now(timezone.utc).isoformat()
    
    if not args.dry_run:
        save_data(data)
        print(f"✅ Updated {DATA_FILE}")
    else:
        print("🔍 Dry run — no changes written")

if __name__ == "__main__":
    main()
