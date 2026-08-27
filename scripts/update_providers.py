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
    "mnfst": {
        "url": "https://raw.githubusercontent.com/mnfst/awesome-free-llm-apis/main/data.json",
        "type": "mnfst_json",
    },
    "tashfeenahmed": {
        "url": "https://raw.githubusercontent.com/tashfeenahmed/freellmapi/main/README.md",
        "type": "markdown_table",
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
    elif source_type == "mnfst_json":
        return parse_mnfst_json(resp.json())
    elif source_type == "markdown_table":
        return parse_markdown_table(resp.text)
    return None


def parse_mnfst_json(data):
    """Parse mnfst awesome-free-llm-apis data.json format."""
    providers = []
    for p in data.get("providers", []):
        # Extract models
        models = []
        free_models = []
        features = []
        
        for m in p.get("models", []):
            model_id = m.get("id", "")
            if model_id:
                models.append(model_id)
                free_models.append(model_id)
            
            # Extract features from modality
            modality = m.get("modality", "").lower()
            if "image" in modality or "vision" in modality:
                if "vision" not in features:
                    features.append("vision")
            if "function" in modality or "tool" in modality:
                if "function_calling" not in features:
                    features.append("function_calling")
            if "audio" in modality:
                if "audio" not in features:
                    features.append("audio")
        
        # Default features
        if not features:
            features = ["chat"]
        elif "chat" not in features:
            features.insert(0, "chat")
        
        # Rate limits
        rate_limit = {}
        for m in p.get("models", []):
            rl = m.get("rateLimit", "")
            if rl:
                # Parse rate limit string like "15 RPM, 20K TPD" or "20 RPM"
                if "RPM" in rl:
                    try:
                        rpm = int(rl.split("RPM")[0].split()[-1])
                        rate_limit["rpm"] = rpm
                    except:
                        pass
                if "TPD" in rl or "tokens/day" in rl.lower():
                    try:
                        tpd_part = rl.split("TPD")[0].split()[-1]
                        if "K" in tpd_part:
                            rate_limit["tpd"] = int(tpd_part.replace("K", "")) * 1000
                        else:
                            rate_limit["tpd"] = int(tpd_part)
                    except:
                        pass
                break  # Use first model's rate limit as default
        
        # Context window (use max from models)
        context_windows = []
        for m in p.get("models", []):
            ctx = m.get("context", "")
            if ctx:
                try:
                    if "K" in ctx:
                        context_windows.append(int(ctx.replace("K", "")) * 1000)
                    elif "M" in ctx:
                        context_windows.append(int(ctx.replace("M", "")) * 1000000)
                    else:
                        context_windows.append(int(ctx))
                except:
                    pass
        context_window = max(context_windows) if context_windows else 0
        
        # Max output tokens
        max_outputs = []
        for m in p.get("models", []):
            mo = m.get("maxOutput", "")
            if mo:
                try:
                    if "K" in mo:
                        max_outputs.append(int(mo.replace("K", "")) * 1000)
                    else:
                        max_outputs.append(int(mo))
                except:
                    pass
        max_output_tokens = max(max_outputs) if max_outputs else 0
        
        # Create provider object
        provider = {
            "name": p.get("name", ""),
            "slug": p.get("name", "").lower().replace(" ", "-").replace(".", ""),
            "tier": "permanent_free" if "permanent" in p.get("description", "").lower() or "free" in p.get("description", "").lower() else "trial_credit",
            "website": p.get("url", ""),
            "api_base": p.get("baseUrl", ""),
            "models_endpoint": "/models",
            "requires_key": True,
            "requires_card": "credit card" in p.get("description", "").lower() and "no credit card" not in p.get("description", "").lower(),
            "rate_limit": rate_limit,
            "models": models,
            "free_models": free_models,
            "features": features,
            "region": p.get("country", "global").lower(),
            "notes": p.get("description", ""),
            "source": "https://github.com/mnfst/awesome-free-llm-apis",
            "last_probed": "",
            "status": "unknown",
            "context_window": context_window,
            "max_output_tokens": max_output_tokens,
            "function_calling": "function_calling" in features,
            "health_score": 0,
            "models_count": len(models),
        }
        providers.append(provider)
    
    return {"providers": providers}


def parse_markdown_table(text):
    """Parse markdown tables from README files."""
    # This is a basic parser - in practice you might want more sophisticated parsing
    # For now, return raw text for manual review
    return {"raw": text[:10000], "note": "Manual review needed for markdown parsing"}

def normalize_slug(name):
    """Normalize provider name to a consistent slug."""
    slug = name.lower()
    # Remove common suffixes/prefixes
    slug = slug.replace(" (zhipu ai)", "").replace("(zhipu ai)", "")
    slug = slug.replace("ai endpoints", "").replace("ai", "")
    slug = slug.replace(" llm", "").replace(" api", "")
    slug = slug.replace("google ", "").replace("mistral ", "")
    slug = slug.replace("hugging ", "").replace("face", "")
    slug = slug.replace("cloudflare ", "").replace("workers ", "")
    slug = slug.replace("nvidia ", "").replace("nim", "")
    slug = slug.replace("ovhcloud ", "").replace("endpoints", "")
    slug = slug.replace(" z ai", "").replace("z ai", "")
    slug = slug.replace("ollama ", "").replace("cloud", "")
    slug = slug.replace("openrouter", "").replace("openrouter", "")
    slug = slug.replace("kilo ", "").replace("code", "")
    slug = slug.replace("llm7.io", "").replace("llm7", "")
    slug = slug.replace("siliconflow", "").replace("siliconflow", "")
    slug = slug.replace("modelscope", "").replace("modelscope", "")
    slug = slug.replace("aion labs", "").replace("aionlabs", "")
    slug = slug.replace("cohere", "").replace("cohere", "")
    slug = slug.replace("groq", "").replace("groq", "")
    slug = slug.replace("cerebras", "").replace("cerebras", "")
    slug = slug.replace("pollinations.ai", "").replace("pollinations", "")
    slug = slug.replace("agnes ai", "").replace("agnes", "")
    slug = slug.replace("opencode zen", "").replace("opencode", "")
    slug = slug.replace("deepseek", "").replace("deepseek", "")
    
    # Clean up
    slug = slug.strip().replace("--", "-").replace("  ", " ")
    slug = slug.replace(" ", "-").replace("/", "-").replace("_", "-")
    slug = slug.replace("--", "-").replace("--", "-")
    
    # Remove leading/trailing dashes
    slug = slug.strip("-")
    
    # Handle empty or generic slugs
    if not slug or slug in ["", "labs", "ai", "cloud", "io", "zen"]:
        return None
        
    return slug


def merge_providers(existing, new_providers):
    """Merge new providers into existing data."""
    existing_slugs = {p["slug"] for p in existing}
    existing_names = {p["name"].lower() for p in existing}
    added = []
    
    for np in new_providers:
        slug = np.get("slug", "")
        name = np.get("name", "")
        name_lower = name.lower()
        
        # Skip if no slug or already exists
        if not slug or slug in existing_slugs or name_lower in existing_names:
            continue
            
        # Normalize slug
        normalized_slug = normalize_slug(name)
        if not normalized_slug:
            continue
            
        np["slug"] = normalized_slug
        
        # Check again after normalization
        if normalized_slug in existing_slugs:
            continue
            
        existing.append(np)
        added.append(normalized_slug)
    
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
