#!/usr/bin/env python3
"""
Free LLM Atlas - 自动化端点探测脚本

用法:
    python3 probe.py --all                    # 探测所有 provider
    python3 probe.py --tier permanent_free    # 仅探测永久免费层
    python3 probe.py --no-key                 # 仅探测无需 Key 的
    python3 probe.py --validate               # 仅验证 JSON 格式
    python3 probe.py --dry-run                # 试运行，不写文件
    python3 probe.py --export-config hermes   # 导出 Hermes 配置
"""

import json
import sys
import asyncio
import argparse
import os
import random
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

try:
    import httpx
except ImportError:
    print("请先安装依赖: pip install httpx pyyaml")
    sys.exit(1)

try:
    import yaml
except ImportError:
    yaml = None

DATA_FILE = Path(__file__).parent.parent / "data" / "providers.json"

@dataclass
class ProbeResult:
    provider: str
    slug: str
    endpoint: str
    status: str  # active, degraded, down, unknown
    latency_ms: Optional[int]
    models_count: Optional[int]
    error: Optional[str]
    timestamp: str

class ProviderProber:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.data = self.load_data()
        self.results: List[ProbeResult] = []
        self.client = httpx.AsyncClient(timeout=15.0, follow_redirects=True)
    
    def load_data(self) -> Dict:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save_data(self):
        if not self.dry_run:
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
            print(f"✅ 已更新 {DATA_FILE}")
        else:
            print("🔍 Dry run - 未写入文件")
    
    async def probe_provider(self, provider: Dict) -> ProbeResult:
        slug = provider['slug']
        api_base = provider.get('api_base', '')
        models_endpoint = provider.get('models_endpoint', '')
        requires_key = provider.get('requires_key', True)
        
        if not api_base or not models_endpoint:
            return ProbeResult(
                provider=provider['name'],
                slug=slug,
                endpoint=f"{api_base}{models_endpoint}",
                status="unknown",
                latency_ms=None,
                models_count=None,
                error="Missing api_base or models_endpoint",
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        
        url = f"{api_base.rstrip('/')}/{models_endpoint.lstrip('/')}"
        headers = {"Accept": "application/json"}
        
        # Try to get API key from environment for providers that require keys
        api_key = None
        if requires_key:
            # Try multiple env var naming conventions
            for env_var in [f"{slug.upper()}_API_KEY", f"{slug.upper()}_API_TOKEN", f"{slug.upper()}_KEY"]:
                key = os.environ.get(env_var)
                if key:
                    api_key = key
                    break
        
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        
        start = datetime.now()
        try:
            resp = await self.client.get(url, headers=headers)
            latency = int((datetime.now() - start).total_seconds() * 1000)
            
            if resp.status_code == 200:
                try:
                    data = resp.json()
                    # 统计模型数量
                    models_count = None
                    if isinstance(data, dict):
                        if 'data' in data and isinstance(data['data'], list):
                            models_count = len(data['data'])
                        elif 'models' in data and isinstance(data['models'], list):
                            models_count = len(data['models'])
                        elif 'object' in data and data['object'] == 'list' and 'data' in data:
                            models_count = len(data['data'])
                    
                    return ProbeResult(
                        provider=provider['name'],
                        slug=slug,
                        endpoint=url,
                        status="active",
                        latency_ms=latency,
                        models_count=models_count,
                        error=None,
                        timestamp=datetime.now(timezone.utc).isoformat()
                    )
                except Exception as e:
                    return ProbeResult(
                        provider=provider['name'],
                        slug=slug,
                        endpoint=url,
                        status="degraded",
                        latency_ms=latency,
                        models_count=None,
                        error=f"JSON parse error: {e}",
                        timestamp=datetime.now(timezone.utc).isoformat()
                    )
            elif resp.status_code == 401:
                return ProbeResult(
                    provider=provider['name'],
                    slug=slug,
                    endpoint=url,
                    status="active",  # 端点存活，只是需要认证
                    latency_ms=latency,
                    models_count=None,
                    error="401 Unauthorized (endpoint alive, needs key)",
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
            elif resp.status_code == 403:
                return ProbeResult(
                    provider=provider['name'],
                    slug=slug,
                    endpoint=url,
                    status="degraded",
                    latency_ms=latency,
                    models_count=None,
                    error="403 Forbidden",
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
            elif resp.status_code == 429:
                return ProbeResult(
                    provider=provider['name'],
                    slug=slug,
                    endpoint=url,
                    status="degraded",
                    latency_ms=latency,
                    models_count=None,
                    error="429 Rate Limited",
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
            else:
                return ProbeResult(
                    provider=provider['name'],
                    slug=slug,
                    endpoint=url,
                    status="down",
                    latency_ms=latency,
                    models_count=None,
                    error=f"HTTP {resp.status_code}",
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
                
        except httpx.TimeoutException:
            return ProbeResult(
                provider=provider['name'],
                slug=slug,
                endpoint=url,
                status="down",
                latency_ms=None,
                models_count=None,
                error="Timeout",
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        except httpx.ConnectError:
            return ProbeResult(
                provider=provider['name'],
                slug=slug,
                endpoint=url,
                status="down",
                latency_ms=None,
                models_count=None,
                error="Connection Error",
                timestamp=datetime.now(timezone.utc).isoformat()
            )
        except Exception as e:
            return ProbeResult(
                provider=provider['name'],
                slug=slug,
                endpoint=url,
                status="unknown",
                latency_ms=None,
                models_count=None,
                error=f"{type(e).__name__}: {e}",
                timestamp=datetime.now(timezone.utc).isoformat()
            )
    
    async def run(self, tier_filter: Optional[str] = None, no_key_only: bool = False):
        providers = self.data.get('providers', [])
        
        if tier_filter:
            providers = [p for p in providers if p.get('tier') == tier_filter]
        
        if no_key_only:
            providers = [p for p in providers if not p.get('requires_key', True)]
        
        print(f"探测 {len(providers)} 个 provider...")
        
        # 并发探测，限制并发数
        semaphore = asyncio.Semaphore(5)  # Reduced from 10 to 5 to avoid rate limits
        
        # Retry configuration
        max_retries = 3
        base_delay = 2.0  # seconds
        max_delay = 60.0  # seconds
        
        async def probe_with_sem(p):
            async with semaphore:
                # Exponential backoff retry for transient errors
                last_error = None
                for attempt in range(3):  # max 3 attempts
                    try:
                        return await self.probe_provider(p)
                    except (httpx.TimeoutException, httpx.ConnectError) as e:
                        last_error = e
                        if attempt < 2:  # Don't sleep on last attempt
                            # Exponential backoff with jitter
                            delay = min(2 ** attempt * 2.0 + random.uniform(0, 1), 30)
                            print(f"  ⚠️ {p['name']} attempt {attempt + 1} failed: {e}, retrying in {delay:.1f}s...")
                            await asyncio.sleep(delay)
                    except httpx.HTTPStatusError as e:
                        # Retry on 429, 5xx errors
                        if e.response.status_code in (429, 500, 502, 503, 504):
                            last_error = e
                            if attempt < 2:
                                delay = min(2 ** attempt * 3.0 + random.uniform(0, 2), 60)
                                print(f"  ⚠️ {p['name']} HTTP {e.response.status_code} - retrying in {delay:.1f}s...")
                                await asyncio.sleep(delay)
                        else:
                            # Non-retryable HTTP error
                            raise
                        last_error = e
                
                # All retries exhausted
                return ProbeResult(
                    provider=p['name'],
                    slug=p['slug'],
                    endpoint='',
                    status='down',
                    latency_ms=None,
                    models_count=None,
                    error=f"Max retries exceeded: {last_error}",
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
        
        # 更新数据
        for result in self.results:
            for p in self.data['providers']:
                if p['slug'] == result.slug:
                    p['last_probed'] = result.timestamp
                    p['status'] = result.status
                    if result.models_count is not None:
                        p['models_count'] = result.models_count
                    break
        
        # 更新元数据
        self.data['updated'] = datetime.now(timezone.utc).isoformat()
        
        self.save_data()
        
        # 打印摘要
        self.print_summary()
        
        return self.results
    
    def print_summary(self):
        status_counts = {}
        for r in self.results:
            status_counts[r.status] = status_counts.get(r.status, 0) + 1
        
        print("\n=== 探测摘要 ===")
        for status, count in sorted(status_counts.items()):
            emoji = {"active": "✅", "degraded": "⚠️", "down": "❌", "unknown": "❓"}.get(status, "•")
            print(f"  {emoji} {status}: {count}")
        
        # 失败详情
        failed = [r for r in self.results if r.status in ('down', 'unknown')]
        if failed:
            print("\n=== 失败详情 ===")
            for r in failed:
                print(f"  ❌ {r.provider} ({r.slug}): {r.error}")
        
        # 降级详情
        degraded = [r for r in self.results if r.status == 'degraded']
        if degraded:
            print("\n=== 降级详情 ===")
            for r in degraded:
                print(f"  ⚠️ {r.provider} ({r.slug}): {r.error}")

    def validate(self) -> bool:
        """验证 providers.json 格式"""
        required_fields = ['name', 'slug', 'tier', 'website', 'api_base', 'requires_key']
        errors = []
        
        for i, p in enumerate(self.data.get('providers', [])):
            for field in required_fields:
                if field not in p:
                    errors.append(f"Provider[{i}] ({p.get('slug', 'unknown')}): 缺少必填字段 {field}")
            
            # 验证 tier
            if p.get('tier') not in ('permanent_free', 'trial_credit', 'local'):
                errors.append(f"Provider[{i}] ({p.get('slug')}): 无效 tier '{p.get('tier')}'")
            
            # 验证 URL 格式
            for url_field in ['website', 'api_base']:
                url = p.get(url_field, '')
                if url and not (url.startswith('http://') or url.startswith('https://')):
                    errors.append(f"Provider[{i}] ({p.get('slug')}): {url_field} 不是有效 URL")
        
        if errors:
            print("❌ 验证失败:")
            for e in errors:
                print(f"  - {e}")
            return False
        else:
            print(f"✅ 验证通过: {len(self.data['providers'])} 个 provider")
            return True
    
    def export_config(self, target: str):
        """导出网关配置"""
        providers = self.data.get('providers', [])
        active_providers = [p for p in providers if p.get('status') == 'active']
        
        if target == 'hermes':
            config = self._gen_hermes_config(active_providers)
        elif target == 'litellm':
            config = self._gen_litellm_config(active_providers)
        elif target == 'portkey':
            config = self._gen_portkey_config(active_providers)
        else:
            print(f"未知目标: {target}，支持: hermes, litellm, portkey")
            return
        
        output_file = Path(__file__).parent.parent / f"config_{target}.yaml"
        if yaml:
            with open(output_file, 'w') as f:
                yaml.dump(config, f, default_flow_style=False, allow_unicode=True)
        else:
            with open(output_file, 'w') as f:
                json.dump(config, f, indent=2)
        
        print(f"✅ 已导出 {target} 配置到 {output_file}")
    
    def _gen_hermes_config(self, providers):
        """生成 Hermes Agent 配置"""
        models = []
        for p in providers:
            for model in p.get('free_models', p.get('models', [])):
                models.append({
                    "model": model,
                    "provider": p['slug'],
                    "api_base": p['api_base'],
                    "api_key_env": f"{p['slug'].upper()}_API_KEY" if p.get('requires_key') else None
                })
        
        return {
            "models": models,
            "default_model": models[0]['model'] if models else None,
            "fallback_chain": [m['model'] for m in models[:5]]
        }
    
    def _gen_litellm_config(self, providers):
        """生成 LiteLLM 配置"""
        model_list = []
        for p in providers:
            for model in p.get('free_models', p.get('models', [])):
                model_list.append({
                    "model_name": model,
                    "litellm_params": {
                        "model": f"openai/{model}",
                        "api_base": p['api_base'],
                        "api_key": f"os.environ/{p['slug'].upper()}_API_KEY" if p.get('requires_key') else "dummy"
                    }
                })
        
        return {"model_list": model_list}
    
    def _gen_portkey_config(self, providers):
        """生成 Portkey 配置"""
        virtual_keys = {}
        for p in providers:
            for model in p.get('free_models', p.get('models', [])):
                virtual_keys[model] = {
                    "provider": p['slug'],
                    "api_base": p['api_base'],
                    "api_key": f"${{{p['slug'].upper()}_API_KEY}}" if p.get('requires_key') else "dummy"
                }
        
        return {"virtual_keys": virtual_keys}
    
    async def close(self):
        await self.client.aclose()


async def main():
    parser = argparse.ArgumentParser(description="Free LLM Atlas Probe")
    parser.add_argument('--all', action='store_true', help='探测所有 provider')
    parser.add_argument('--tier', choices=['permanent_free', 'trial_credit', 'local'], help='按 tier 过滤')
    parser.add_argument('--no-key', action='store_true', help='仅探测无需 Key 的')
    parser.add_argument('--validate', action='store_true', help='仅验证 JSON 格式')
    parser.add_argument('--dry-run', action='store_true', help='试运行，不写文件')
    parser.add_argument('--export-config', choices=['hermes', 'litellm', 'portkey'], help='导出网关配置')
    
    args = parser.parse_args()
    
    prober = ProviderProber(dry_run=args.dry_run)
    
    try:
        if args.validate:
            success = prober.validate()
            sys.exit(0 if success else 1)
        
        if args.export_config:
            prober.export_config(args.export_config)
            sys.exit(0)
        
        if args.all or args.tier or args.no_key:
            await prober.run(tier_filter=args.tier, no_key_only=args.no_key)
        else:
            parser.print_help()
            sys.exit(1)
    finally:
        await prober.close()


if __name__ == '__main__':
    asyncio.run(main())
# 
