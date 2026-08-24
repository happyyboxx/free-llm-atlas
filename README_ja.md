# free-llm-atlas

> **17 の無料 LLM API プロバイダー、毎日自動プローブ。構造化 JSON + ゲートウェイ設定。本番環境へのコストゼロ。**

[![GitHub Stars](https://img.shields.io/github/stars/happyyboxx/free-llm-atlas?style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Automated Probe](https://img.shields.io/github/actions/workflow/status/happyyboxx/free-llm-atlas/probe.yml?label=Daily%20Probe&style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/actions/workflows/probe.yml)
[![Providers](https://img.shields.io/badge/Providers-17-blue?style=flat-square)](data/providers.json)
[![Free Forever](https://img.shields.io/badge/Free%20Forever-17%20no%20card-success?style=flat-square)](docs/platforms/permanent-free.md)

---

## 30秒で始める

```bash
git clone https://github.com/happyyboxx/free-llm-atlas.git
cd free-llm-atlas

# 1. クレジットカード不要の無料プロバイダーを検索
cat data/providers.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for p in d['providers']:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f'  {p[\"name\"]}: {p.get(\"rate_limit\", \"N/A\")}')"

# 2. すべてのプロバイダーを即座にプローブ
pip install httpx pyyaml
python3 scripts/probe.py --all

# 3. ゲートウェイ設定をエクスポート
python3 scripts/probe.py --export-config hermes    > hermes.yaml
python3 scripts/probe.py --export-config litellm   > litellm.yaml
python3 scripts/probe.py --export-config portkey   > portkey.yaml
python3 scripts/probe.py --export-config openwebui > openwebui.yaml
```

---

## このプロジェクトが必要な理由

すべての「無料 LLM API」リストは**1週間で古くなる**。プロバイダーは制限を変更し、モデルを非推奨にし、クレジットカードを要求し、エンドポイントを閉鎖する。このプロジェクトがそれを解決する：

| 機能 | 実装方法 |
|---|---|
| **毎日の自動プローブ** | GitHub Actions が毎日 06:00 UTC に全 17 プロバイダーをプローブ |
| **構造化データ** | `providers.json` — 機械可読、Markdown テーブルではない |
| **ゲートウェイ設定** | プローブ結果から Hermes / LiteLLM / Portkey / Open WebUI YAML を自動生成 |
| **カード不要フィルター** | クレジットカード不要の 17 プロバイダー — 明確にタグ付け |
| **リアルタイムステータス** | Git 履歴 = 稼働時間ダッシュボード。どのプロバイダーがいつ劣化したかを確認 |
| **隠れた制限の公開** | TPM、RPM、同時リクエスト — 真のボトルネック |

---

## 🔑 隠れた制限（重要な洞察）

**ほとんどの「無料」リストは日次リクエスト制限のみを表示。真のボトルネックは分あたりトークン数と同時リクエスト数：**

| プロバイダー | 日次リクエスト | **TPM** | **同時** | コンテキスト | 適した用途 |
|---|---|---|---|---|---|
| Groq | 14,400 | **6,000** | 10 | 8K | 低遅延ストリーミング |
| Google AI Studio | 1,500 | **1,000,000** | 10 | 2M | 長文脈 / マルチモーダル |
| NVIDIA NIM | 1,000 | **1,000** | 5 | 1M | 推論、Function Calling |
| Cloudflare Workers AI | 100,000 | 100,000 | 20 | 8K | エッジ / Workers |
| Cohere | 1,000 | 1,000 | 5 | 4K | Embeddings / Rerank |

> **経験則**: チャットアプリでは **TPM が真の制限**。Groq の 6K TPM = 約 250 メッセージ/分。バッチ処理では日次制限が重要。

---

## 📊 一目でわかる（最新プローブから）

| カテゴリ | 数 | 用途 | トッププロバイダー |
|---|---|---|---|
| **永久無料（カード不要）** | 17 | 本番環境フォールバックチェーン | Google (Gemini 2M ctx), Groq (300+ tok/s), NIM (102 モデル), Cloudflare, Cohere |
| **試用クレジット** | 2 | プロトタイプ / 評価 | Agnes AI (テキスト), DeepSeek |
| **ローカル推論** | 0 | プライバシー / オフライン / エアギャップ | [ローカル推論](docs/platforms/local-inference.md) を参照 |
| **テスト済みエンドポイント** | 17 | すべて動作確認済み | 11 正常 / 4 劣化 / 1 ダウン / 1 不明 |

### ゼロコスト本番スタック

```yaml
# 推奨フォールバックチェーン（ゲートウェイで設定）
primary:    Groq          # 速度: 300+ tok/s, 14.4K req/day
secondary:  Google AI     # コンテキスト: 2M tokens, マルチモーダル
tertiary:   NVIDIA NIM    # 推論: Nemotron Ultra 1M ctx, Function Calling
quaternary: Cloudflare    # エッジ: Workers AI, 100K req/day
fallback:   Cohere        # Embedding/RAG: 1K req/month

→ 95% の本番ワークロードを $0 でカバー
```

---

## 🚀 使い方

### 適切なプロバイダーを見つける

```bash
# すべての永久無料、カード不要
python3 scripts/probe.py --tier permanent_free --no-key

# 現在正常なプロバイダー（最新プローブから）
cat data/providers.json | jq '.providers[] | select(.status == "active") | .name'

# Function Calling サポートがあるプロバイダー
cat data/providers.json | jq '.providers[] | select(.function_calling == true) | .name'

# コンテキスト ≥100K のプロバイダー
cat data/providers.json | jq '.providers[] | select(.context_window >= 100000) | .name'

# ストリーミング用の最高 TPM
cat data/providers.json | jq '.providers[] | select(.rate_limit.tpm > 5000) | "\(.name): \(.rate_limit.tpm) TPM"'
```

### プローブを実行

```bash
# すべての 17 プロバイダーをプローブ
python3 scripts/probe.py --all

# 永久無料層のみプローブ
python3 scripts/probe.py --tier permanent_free

# ゲートウェイにエクスポート
python3 scripts/probe.py --export-config hermes    # -> hermes.yaml
python3 scripts/probe.py --export-config litellm   # -> litellm.yaml
python3 scripts/probe.py --export-config portkey   # -> portkey.yaml
python3 scripts/probe.py --export-config openwebui # -> openwebui.yaml
```

### Python で使用

```python
import json

providers = json.load(open('data/providers.json'))['providers']

# カード不要の無料プロバイダーとその制限を取得
for p in providers:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f"{p['name']:20s} | TPM: {p.get('rate_limit', {}).get('tpm', '?'):>6} | Ctx: {p.get('context_window', '?'):>8}")

# TPM でソートしてフォールバックチェーンを構築
fallback = sorted(
    [p for p in providers if p['tier'] == 'permanent_free' and not p.get('requires_card')],
    key=lambda x: x.get('rate_limit', {}).get('tpm', 0),
    reverse=True
)
for p in fallback:
    print(f"{p['name']}: {p.get('rate_limit', {}).get('tpm', 0)} TPM | ctx={p.get('context_window', '?')}")
```

---

## 🔄 毎日の自動化

| ワークフロー | スケジュール | 出力 |
|---|---|---|
| `probe.yml` | 毎日 06:00 UTC | `data/providers.json` ステータス + 指標更新 |
| `update.yml` | 毎週月曜 00:00 UTC | 上流ソースから新しいプロバイダーを同期 |

**Git 履歴 = 稼働時間ダッシュボード。** すべてのコミットでどのプロバイダーがステータスを変更したかを表示。

---

## 📖 ドキュメント

| ドキュメント | 内容 |
|---|---|
| [永久無料層](docs/platforms/permanent-free.md) | 17 プロバイダー比較: 制限、コンテキスト、機能 |
| [試用クレジット](docs/platforms/trial-credits.md) | 2 プロバイダーのクレジット額 + 期限 |
| [ローカル推論](docs/platforms/local-inference.md) | 9 ローカルツール: VRAM 要件、モデルサポート |
| [決定木](docs/guides/decision-tree.md) | 「どのプロバイダーを使うべきか？」フローチャート |
| [ゲートウェイ設定](docs/guides/gateway-config.md) | Hermes / LiteLLM / Portkey / Open WebUI セットアップ |
| [クイックスタート](docs/guides/quickstart.md) | 5 分で始めるガイド |
| [隠れた制限](docs/guides/hidden-limits.md) | TPM vs 日次、同時リクエスト、コンテキストウィンドウ |
| [プロバイダー比較](docs/platforms/comparison.md) | 詳細テーブル: RPM、TPM、コンテキスト、機能、健康スコア |

---

## 📊 データソース

以下のソースからデータを収集・検証：

| 上流 | Stars | タイプ |
|---|---|---|
| [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | 28K+ | 毎日自動クロール |
| [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) | 17K+ | 実行可能プロキシツール |
| [mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | 6K+ | 厳格な永久無料 |
| [nejib1/Free-LLM](https://github.com/nejib1/Free-LLM) | 100+ | 43+ プロバイダートラッカー |

---

## 🛠 ゲートウェイ設定例

### Hermes Agent
```yaml
providers:
  - name: groq
    api_key: ${GROQ_API_KEY}
    base_url: https://api.groq.com/openai/v1
    models:
      - llama-3.3-70b-versatile
      - gemma2-9b-it
    priority: 1
  
  - name: google
    api_key: ${GOOGLE_API_KEY}
    base_url: https://generativelanguage.googleapis.com/v1beta
    models:
      - gemini-1.5-pro
      - gemini-1.5-flash
    priority: 2
  
  - name: nvidia
    api_key: ${NVIDIA_API_KEY}
    base_url: https://integrate.api.nvidia.com/v1
    models:
      - nemotron-3-ultra
    priority: 3
```

### LiteLLM
```yaml
model_list:
  - model_name: groq/llama-3.3-70b-versatile
    litellm_params:
      model: groq/llama-3.3-70b-versatile
      api_key: os.environ/GROQ_API_KEY
      rpm: 6000
  - model_name: google/gemini-1.5-pro
    litellm_params:
      model: google/gemini-1.5-pro
      api_key: os.environ/GOOGLE_API_KEY
      rpm: 1000000
```

### Portkey
```yaml
providers:
  - provider: groq
    api_key: ${GROQ_API_KEY}
    weight: 0.5
  - provider: google
    api_key: ${GOOGLE_API_KEY}
    weight: 0.3
  - provider: nvidia
    api_key: ${NVIDIA_API_KEY}
    weight: 0.2
strategy: fallback
```

---

## 🎯 本番前チェックリスト

無料スタックで本番投入前：

- [ ] **監視設定** — 429/レート制限エラーのアラート
- [ ] **タイムアウト設定** — 無料層は遅延のばらつきが大きい傾向
- [ ] **フォールバック実装** — 3+ プロバイダーを連鎖（上記ゼロコストスタック参照）
- [ ] **TPM を追跡、日次だけではない** — Groq 6K TPM ≠ 14.4K req/day（ストリーミング時）
- [ ] **同時負荷テスト** — Groq 無料層 10 同時 = 即座に 429
- [ ] **Embeddings キャッシュ** — Cohere 無料層は寛大だが無限ではない
- [ ] **劣化への計画** — 4 劣化 / 1 ダウンは通常；バックアップを用意

---

## 🤝 コントリビューション

PR 歓迎！[CONTRIBUTING.md](CONTRIBUTING.md) をお読みください。

- **プロバイダー追加** → `data/providers.json` を編集または Issue を作成
- **プローブ結果修正** → `scripts/probe.py` を実行し、更新された結果をコミット
- **ドキュメント改善** → `docs/` の markdown を編集

---

## ⚖️ ライセンスと免責事項

**MIT License** — [LICENSE](LICENSE) を参照。

- 無料層、レート制限、モデル可用性は**頻繁に変更** — 常に公式ドキュメントで確認
- このプロジェクトは公開情報を集約 — **API キーは提供しない**
- 商用利用の場合、各プラットフォームの利用規約を必ず確認

---

**このプロジェクトが無料 LLM API 検索の時間を節約できたら、Star ⭐ をお願いします。**
