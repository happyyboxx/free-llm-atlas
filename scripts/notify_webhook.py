#!/usr/bin/env python3
"""
Webhook notification for provider status changes.
Sends notifications to Discord, Slack, or custom webhook when provider status changes.
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone

sys.path.insert(0, str(Path(__file__).resolve().parent))
from atlas_env import load_project_env  # noqa: E402

load_project_env()

DATA_FILE = Path(__file__).parent.parent / "data" / "providers.json"
STATE_FILE = Path(__file__).parent.parent / ".github" / "provider_state.json"

WEBHOOK_URL = os.environ.get("PROVIDER_WEBHOOK_URL")
DISCORD_WEBHOOK = os.environ.get("DISCORD_WEBHOOK_URL")
SLACK_WEBHOOK = os.environ.get("SLACK_WEBHOOK_URL")

def load_current_state():
    """Load current providers state"""
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def load_previous_state():
    """Load previous providers state from file"""
    if STATE_FILE.exists():
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"providers": {}}

def save_state(state):
    """Save current state for next run"""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

def detect_changes(current, previous):
    """Detect status changes between current and previous state"""
    changes = []
    
    current_providers = {p["slug"]: p for p in current.get("providers", [])}
    previous_providers = previous.get("providers", {})
    
    for slug, provider in current_providers.items():
        current_status = provider.get("status", "unknown")
        current_health = provider.get("health_score", 0)
        
        if slug in previous_providers:
            prev_status = previous_providers[slug].get("status", "unknown")
            prev_health = previous_providers[slug].get("health_score", 0)
            
            if current_status != prev_status:
                changes.append({
                    "type": "status_change",
                    "provider": provider["name"],
                    "slug": slug,
                    "old_status": prev_status,
                    "new_status": current_status,
                    "old_health": prev_health,
                    "new_health": current_health,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            elif abs(current_health - prev_health) >= 10:
                changes.append({
                    "type": "health_change",
                    "provider": provider["name"],
                    "slug": slug,
                    "old_health": prev_health,
                    "new_health": current_health,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
        else:
            changes.append({
                "type": "new_provider",
                "provider": provider["name"],
                "slug": slug,
                "status": current_status,
                "health": current_health,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    
    # Check for removed providers
    for slug in previous_providers:
        if slug not in current_providers:
            changes.append({
                "type": "provider_removed",
                "provider": previous_providers[slug].get("name", slug),
                "slug": slug,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
    
    return changes

def format_discord_message(changes):
    """Format changes for Discord webhook"""
    if not changes:
        return None
    
    embeds = []
    for change in changes:
        if change["type"] == "status_change":
            emoji = {"active": "✅", "degraded": "⚠️", "down": "❌", "unknown": "❓"}.get(change["new_status"], "❓")
            color = {"active": 0x00ff00, "degraded": 0xffaa00, "down": 0xff0000, "unknown": 0x808080}.get(change["new_status"], 0x808080)
            embeds.append({
                "title": f"{emoji} Provider Status Change: {change['provider']}",
                "color": color,
                "fields": [
                    {"name": "Old Status", "value": change["old_status"], "inline": True},
                    {"name": "New Status", "value": change["new_status"], "inline": True},
                    {"name": "Health Score", "value": f"{change['old_health']} → {change['new_health']}", "inline": True}
                ],
                "timestamp": change["timestamp"]
            })
        elif change["type"] == "health_change":
            embeds.append({
                "title": f"📊 Health Score Change: {change['provider']}",
                "color": 0x0099ff,
                "fields": [
                    {"name": "Old Health", "value": str(change["old_health"]), "inline": True},
                    {"name": "New Health", "value": str(change["new_health"]), "inline": True},
                    {"name": "Change", "value": f"{change['new_health'] - change['old_health']:+d}", "inline": True}
                ],
                "timestamp": change["timestamp"]
            })
        elif change["type"] == "new_provider":
            embeds.append({
                "title": f"🆕 New Provider Added: {change['provider']}",
                "color": 0x00ff00,
                "fields": [
                    {"name": "Status", "value": change["status"], "inline": True},
                    {"name": "Health", "value": str(change["health"]), "inline": True}
                ],
                "timestamp": change["timestamp"]
            })
        elif change["type"] == "provider_removed":
            embeds.append({
                "title": f"🗑️ Provider Removed: {change['provider']}",
                "color": 0xff0000,
                "timestamp": change["timestamp"]
            })
    
    return {"embeds": embeds}

def format_slack_message(changes):
    """Format changes for Slack webhook"""
    if not changes:
        return None
    
    blocks = []
    for change in changes:
        if change["type"] == "status_change":
            emoji = {"active": "✅", "degraded": "⚠️", "down": "❌", "unknown": "❓"}.get(change["new_status"], "❓")
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"{emoji} *{change['provider']}* status changed: `{change['old_status']}` → `{change['new_status']}` (Health: {change['old_health']} → {change['new_health']})"
                }
            })
        elif change["type"] == "health_change":
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"📊 *{change['provider']}* health score: `{change['old_health']}` → `{change['new_health']}` ({change['new_health'] - change['old_health']:+d})"
                }
            })
        elif change["type"] == "new_provider":
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"🆕 New provider added: *{change['provider']}* (Status: {change['status']}, Health: {change['health']})"
                }
            })
        elif change["type"] == "provider_removed":
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"🗑️ Provider removed: *{change['provider']}*"
                }
            })
    
    return {"blocks": blocks}

def send_webhook(url, payload):
    """Send webhook notification"""
    try:
        import urllib.request
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.status == 200 or response.status == 204
    except Exception as e:
        print(f"Webhook error: {e}", file=sys.stderr)
        return False

def main():
    if not (WEBHOOK_URL or DISCORD_WEBHOOK or SLACK_WEBHOOK):
        print("No webhook URL configured. Set PROVIDER_WEBHOOK_URL, DISCORD_WEBHOOK_URL, or SLACK_WEBHOOK_URL")
        return 0
    
    current = load_current_state()
    previous = load_previous_state()
    
    changes = detect_changes(current, previous)
    
    if not changes:
        print("No changes detected")
        # Still update state file
        save_state({"providers": {p["slug"]: {"status": p.get("status"), "health_score": p.get("health_score")} for p in current.get("providers", [])}})
        return 0
    
    print(f"Detected {len(changes)} changes:")
    for c in changes:
        print(f"  {c['type']}: {c['provider']} ({c.get('slug', '')})")
    
    success = True
    
    if DISCORD_WEBHOOK:
        payload = format_discord_message(changes)
        if payload and not send_webhook(DISCORD_WEBHOOK, payload):
            success = False
    
    if SLACK_WEBHOOK:
        payload = format_slack_message(changes)
        if payload and not send_webhook(SLACK_WEBHOOK, payload):
            success = False
    
    if WEBHOOK_URL:
        payload = {"changes": changes}
        if not send_webhook(WEBHOOK_URL, payload):
            success = False
    
    # Save current state for next run
    save_state({"providers": {p["slug"]: {"status": p.get("status"), "health_score": p.get("health_score")} for p in current.get("providers", [])}})
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())