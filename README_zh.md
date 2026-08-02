# free-llm-atlas

> **免费大模型图谱** — 收录 70+ 平台、43+ Provider、40+ 实测端点。提供结构化数据、自动探测脚本、可落地的网关配置。

[![GitHub Stars](https://img.shields.io/github/stars/your-username/free-llm-atlas?style=flat-square)](https://github.com/your-username/free-llm-atlas/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Automated Probe](https://img.shields.io/github/actions/workflow/status/your-username/free-llm-atlas/probe.yml?label=Probe&style=flat-square)](https://github.com/your-username/free-llm-atlas/actions/workflows/probe.yml)

---

## 📊 覆盖度概览

| 类别 | 数量 | 代表平台 |
|---|---|---|
| **永久免费层 (无需信用卡)** | 12 | Google, Groq, Cerebras, HuggingFace, Cloudflare, Cohere, Mistral, OVH, Inference.net, Z.AI, Coze, GLM |
| **试用额度类** | 11 | Fireworks, Friendli, Hyperbolic, Nebius, Novita, Replicate, Upstage, Qwen, Scaleway, Requesty, Together |
| **本地运行类** | 9 | Ollama, LM Studio, GPT4All, llama.cpp, Jan.ai, KoboldCpp, llamafile, Text Gen, BentoML |
| **实测可用端点** | 40+ | 含零Key直连、需Key、端点变更/下线 |

---

## 🗂️ 仓库结构

```
free-llm-atlas/
├── data/
│   └── providers.json          # 结构化 Provider 数据 (机器可读)
├── docs/
│   ├── index.md                # 文档站入口
│   ├── platforms/              # 平台详情页
│   ├── guides/                 # 选型指南/决策树
│   └── compliance/             # ToS 合规审查
├── scripts/
│   ├── probe.py                # 自动化探测脚本 (GitHub Actions 可运行)
│   ├── generate_docs.py        # 从 providers.json 生成文档
│   └── update_providers.py     # 从上游仓库同步 Provider 列表
├── .github/workflows/
│   ├── probe.yml               # 定时探测 (每日 06:00 UTC)
│   └── update.yml              # 定时同步上游 (每周)
├── LICENSE
├── CONTRIBUTING.md
├── README.md                   # English
└── README_zh.md                # 中文 (本文件)
```

---

## 🚀 快速开始

### 1. 查看结构化数据

```bash
# 直接看 JSON
cat data/providers.json | jq '.providers[] | select(.tier=="permanent_free") | .name'

# Python 使用
python3 -c "
import json
d = json.load(open('data/providers.json'))
for p in d['providers']:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f"{p['name']}: {p['rate_limit']}")"
```

### 2. 运行探测脚本

```bash
# 安装依赖
pip install httpx pyyaml

# 探测所有 endpoint
python3 scripts/probe.py --all

# 仅探测零 Key 平台
python3 scripts/probe.py --tier permanent_free --no-key
```

### 3. 生成网关配置

```bash
# 生成 Hermes / LiteLLM / Portkey 落地配置
python3 scripts/probe.py --export-config hermes
```

---

## 📖 文档

| 文档 | 说明 |
|---|---|
| [平台总览](docs/platforms/overview.md) | 所有平台分类汇总表 |
| [永久免费层](docs/platforms/permanent-free.md) | 12个永久免费层详细对比 |
| [试用额度](docs/platforms/trial-credits.md) | 11个试用额度平台对比 |
| [本地推理](docs/platforms/local-inference.md) | 9类本地运行方案 |
| [决策树](docs/guides/decision-tree.md) | 选型决策树 |
| [ToS 合规](docs/compliance/tos-review.md) | 服务条款合规审查 |

---

## 🔄 自动化

| 工作流 | 频率 | 产出 |
|---|---|---|
| `probe.yml` | 每日 06:00 UTC | 更新 `data/providers.json` 的 `status`、`last_probed`、`models_count` |
| `update.yml` | 每周一 00:00 UTC | 从 cheahjs/free-llm-api-resources、nejib1/Free-LLM 等上游同步新 Provider |

---

## 🤝 贡献

欢迎 PR！请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

- 新增 Provider：修改 `data/providers.json` 或提交 issue
- 修正探测结果：运行 `scripts/probe.py` 后提交更新
- 文档改进：修改 `docs/` 下对应 markdown

---

## 📜 数据来源

本项目聚合并验证了以下上游项目的数据：

| 上游项目 | Stars | 类型 |
|---|---|---|
| [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | 28,638 | 自动生成列表 (每日抓取) |
| [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) | 17,271 | 可运行代理工具 |
| [mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | 6,083 | 严格永久免费列表 |
| [nejib1/Free-LLM](https://github.com/nejib1/Free-LLM) | 108 | 43+ Provider 单一事实来源 |
| [open-free-llm-api/awesome-freellm-apis](https://github.com/open-free-llm-api/awesome-freellm-apis) | 908 | 每日自动更新 |

---

## ⚖️ 许可证

MIT License — 详见 [LICENSE](LICENSE)。

---

## ⚠️ 免责声明

- 免费额度、限流、模型可用性**随时变动**，以官方文档为准
- 本项目仅聚合公开信息，**不提供任何 API Key**，不保证服务可用性
- 商业用途请务必阅读各平台 ToS，确认合规后使用
- 探测脚本仅做**可用性采样**，不发起大量请求

---

**Star ⭐ 本项目，随时掌握免费 LLM 最新格局！**
