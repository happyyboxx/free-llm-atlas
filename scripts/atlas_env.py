#!/usr/bin/env python3
"""Load free-llm-atlas/.env — never ~/.hermes/.env."""

from __future__ import annotations

import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT_DIR / ".env"


def load_project_env(env_path: Path = ENV_FILE, *, override: bool = False) -> int:
    """Load project .env into os.environ. Existing process env wins unless override=True."""
    if not env_path.is_file():
        return 0
    loaded = 0
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        if line.startswith("export "):
            line = line[len("export ") :].strip()
        key, _, value = line.partition("=")
        key = key.strip()
        if not key:
            continue
        value = value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        if not override and key in os.environ:
            continue
        os.environ[key] = value
        loaded += 1
    return loaded
