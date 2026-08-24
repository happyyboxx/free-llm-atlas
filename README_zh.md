# free-llm-atlas

> **17 个免费 LLM API 提供商，每日自动探测。结构化 JSON + 网关配置。零成本投入生产。**

[![GitHub Stars](https://img.shields.io/github/stars/happyyboxx/free-llm-atlas?style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Automated Probe](https://img.shields.io/github/actions/workflow/status/happyyboxx/free-llm-atlas/probe.yml?label=Daily%20Probe&style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/actions/workflows/probe.yml)
[![Providers](https://img.shields.io/badge/Providers-17-blue?style=flat-square)](data/providers.json)
[![Free Forever](https://img.shields.io/badge/Free%20Forever-17%20no%20card-success?style=flat-square)](docs/platforms/permanent-free.md)

---

## 30 秒快速开始

```bash
git clone https://github.com/happyyboxx/free-llm-atlas.git
cd free-llm-atlas

# 1. 找到无需信用卡的免费提供商
cat data/providers.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for p in d['providers']:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f'  ✅ {p[\"name\"]}: {p.get(\"rate_limit\", \"N/A\")}')"

# 2. 立即探测所有提供商
pip install httpx pyyaml
python3 scripts/probe.py --all

# 3. 导出网关配置
python3 scripts/probe.py --export-config hermes    > hermes.yaml
python3 scripts/probe.py --export-config litellm   > litellm.yaml
python3 scripts/probe.py --export-config portkey   > portkey.yaml
python3 scripts/probe.py --export-config openwebui > openwebui.yaml
```

---

## 为什么需要这个项目

每个"免费 LLM API"列表**一周内就会过期**。提供商会变更限额、弃用模型、要求信用卡、关闭端点。本项目解决这个问题：

| 功能 | 实现方式 |
|---|---|
| **每日自动探测** | GitHub Actions 每天 06:00 UTC 探测所有 17 个提供商 |
| **结构化数据** | `providers.json` — 机器可读，非 Markdown 表格 |
| **网关配置** | 从探测结果自动生成 Hermes / LiteLLM / Portkey / Open WebUI YAML |
| **无卡筛选** | 17 个无需信用卡的提供商 — 明确标记 |
| **实时状态** | Git 历史 = 正常运行时间仪表板。查看哪个提供商何时降级 |
| **隐藏限制曝光** | TPM、RPM、并发请求 — 真正的瓶颈 |

---

## 🔑 隐藏限制（核心洞察）

**大多数"免费"列表只展示每日请求限制。真正的瓶颈是每分钟 Token 数和并发请求：**

| 提供商 | 每日请求 | **TPM** | **并发** | 上下文 | 适用场景 |
|---|---|---|---|---|---|
| Groq | 14,400 | **6,000** | 10 | 8K | 低延迟流式 |
| Google AI Studio | 1,500 | **1,000,000** | 10 | 2M | 长上下文 / 多模态 |
| NVIDIA NIM | 1,000 | **1,000** | 5 | 1M | 推理、Function Calling |
| Cloudflare Workers AI | 100,000 | 100,000 | 20 | 8K | 边缘 / Workers |
| Cohere | 1,000 | 1,000 | 5 | 4K | Embeddings / Rerank |

> **经验法则**：聊天应用中，**TPM 才是真正限制**。Groq 的 6K TPM ≈ 250 条消息/分钟。批处理场景下每日限制更重要。

---

## 📊 一览（来自最新探测）

| 类别 | 数量 | 适用场景 | 顶级提供商 |
|---|---|---|---|
| **永久免费（无卡）** | 17 | 生产环境 fallback 链 | Google (Gemini 2M ctx), Groq (300+ tok/s), NIM (102 模型), Cloudflare, Cohere |
| **试用额度** | 2 | 原型 / 评估 | Agnes AI (文本), DeepSeek |
| **本地推理** | 0 | 隐私 / 离线 / 气隙 | 见 [本地推理](docs/platforms/local-inference.md) |
| **已测试端点** | 17 | 全部确认工作 | ✅ 11 正常 / ⚠️ 4 降级 / ❌ 1 故障 / ❓ 1 未知 |

### 零成本生产栈

```yaml
# 推荐 fallback 链（在网关中配置）
primary:    Groq          # 速度：300+ tok/s, 14.4K req/day
secondary:  Google AI     # 上下文：2M tokens, 多模态
tertiary:   NVIDIA NIM    # 推理：Nemotron Ultra 1M ctx, Function Calling
quaternary: Cloudflare    # 边缘：Workers AI, 100K req/day
fallback:   Cohere        # Embedding/RAG：1K req/month

→ 覆盖 95% 生产负载，$0 成本
```

---

## 🚀 使用方法

### 找到合适的提供商

```bash
# 所有永久免费，无卡
python3 scripts/probe.py --tier permanent_free --no-key

# 当前正常的提供商（来自最新探测）
cat data/providers.json | jq '.providers[] | select(.status == "active") | .name'

# 支持 Function Calling 的提供商
cat data/providers.json | jq '.providers[] | select(.function_calling == true) | .name'

# 上下文 ≥100K 的提供商
cat data/providers.json | jq '.providers[] | select(.context_window >= 100000) | .name'

# 最高 TPM 用于流式
cat data/providers.json | jq '.providers[] | select(.rate_limit.tpm > 5000) | "\(.name): \(.rate_limit.tpm) TPM"'
```

### 运行探测

```bash
# 探测所有 17 个提供商
python3 scripts/probe.py --all

# 仅探测永久免费层
python3 scripts/probe.py --tier permanent_free

# 导出到你的网关
python3 scripts/probe.py --export-config hermes    # → hermes.yaml
python3 scripts/probe.py --export-config litellm   # → litellm.yaml
python3 scripts/probe.py --export-config portkey   # → portkey.yaml
python3 scripts/probe.py --export-config openwebui # → openwebui.yaml
```

### Python 中使用

```python
import json

providers = json.load(open('data/providers.json'))['providers']

# 获取所有无卡免费提供商及其限额
for p in providers:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f"{p['name']:20s} | TPM: {p.get('rate_limit', {}).get('tpm', '?'):>6} | Ctx: {p.get('context_window', '?'):>8}")

# 按 TPM 排序构建 fallback 链
fallback = sorted(
    [p for p in providers if p['tier'] == 'permanent_free' and not p.get('requires_card')],
    key=lambda x: x.get('rate_limit', {}).get('tpm', 0),
    reverse=True
)
for p in fallback:
    print(f"{p['name']}: {p.get('rate_limit', {}).get('tpm', 0)} TPM | ctx={p.get('context_window', '?')}")
```

---

## 🔄 每日自动化

| 工作流 | 调度 | 输出 |
|---|---|---|
| `probe.yml` | 每日 06:00 UTC | `data/providers.json` 状态 + 指标更新 |
| `update.yml` | 每周一 00:00 UTC | 从上游源同步新提供商 |

**Git 历史 = 正常运行时间仪表板。** 每次提交显示哪些提供商状态变化。

---

## 📖 文档

| 文档 | 内容 |
|---|---|
| [永久免费层](docs/platforms/permanent-free.md) | 17 个提供商对比：限额、上下文、功能 |
| [试用额度](docs/platforms/trial-credits.md) | 2 个提供商的额度金额 + 过期 |
| [本地推理](docs/platforms/local-inference.md) | 9 个本地工具：显存需求、模型支持 |
| [决策树](docs/guides/decision-tree.md) | "我该用哪个提供商？" 流程图 |
| [网关配置](docs/guides/gateway-config.md) | Hermes / LiteLLM / Portkey / Open WebUI 设置 |
| [快速开始](docs/guides/quickstart.md) | 5 分钟上手指南 |
| [隐藏限制](docs/guides/hidden-limits.md) | TPM vs 每日、并发请求、上下文窗口 |
| [提供商对比](docs/platforms/comparison.md) | 详细表格：RPM、TPM、上下文、功能、健康分 |

---

## 📊 数据来源

聚合并验证来自以下来源的数据：

| 上游 | Stars | 类型 |
|---|---|---|
| [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | 28K+ | 每日自动爬取 |
| [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) | 17K+ | 可运行代理工具 |
| [mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | 6K+ | 严格永久免费 |
| [nejib1/Free-LLM](https://github.com/nejib1/Free-LLM) | 100+ | 43+ 提供商追踪器 |

---

## 🛠 网关配置示例

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

## 🎯 生产检查清单

使用免费栈投入生产前：

- [ ] **设置监控** — 429/限额错误报警
- [ ] **配置超时** — 免费层延迟方差通常更大
- [ ] **实现 fallback** — 链接 3+ 个提供商（见上方零成本栈）
- [ ] **追踪 TPM，不仅是每日** — Groq 6K TPM ≠ 14.4K req/day（流式场景）
- [ ] **测试并发负载** — Groq 免费层 10 并发 = 即时 429
- [ ] **缓存 Embeddings** — Cohere 免费层慷慨但非无限
- [ ] **规划降级** — 4 降级 / 1 故障是常态；准备备选

---

## 🤝 贡献

欢迎 PR！阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

- **添加提供商** → 编辑 `data/providers.json` 或提交 Issue
- **修复探测结果** → 运行 `scripts/probe.py` 并提交更新结果
- **改进文档** → 编辑 `docs/` 下的 markdown

---

## ⚖️ 许可证与免责声明

**MIT License** — 见 [LICENSE](LICENSE)。

- 免费层、限额、模型可用性**频繁变动** — 始终对照官方文档验证
- 本项目聚合公开信息 — **不提供 API Keys**
- 商业用途请务必阅读各平台 ToS

---

**如果这个项目帮你省下了寻找免费 LLM API 的时间，请 Star ⭐。**
