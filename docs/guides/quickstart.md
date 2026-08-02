# 快速开始指南

5 分钟从零上手免费 LLM。

---

## 🚀 3 步走

### 步骤 1: 选平台 (30 秒)

| 你的情况 | 直接用 |
|---|---|
| **完全不想注册** | [Pollinations.ai](https://text.pollinations.ai) - 打开网页直接用 |
| **想要代码调用，无Key** | [Kilo Code](https://kilo.ai) - `curl https://api.kilo.ai/api/gateway/v1/models` |
| **愿注册、想要最强免费模型** | [Google AI Studio](https://aistudio.google.com) / [Groq](https://console.groq.com) / [NVIDIA NIM](https://build.nvidia.com) |
| **想要 GPT-5 / Claude 免费** | [GitHub Models](https://github.com/marketplace/models) |
| **国内、中文、低延迟** | [Z.AI](https://z.ai) (GLM 永久免费) / [Coze](https://coze.com) |
| **本地跑、隐私绝对** | `curl -fsSL https://ollama.com/install.sh | sh` 然后 `ollama run llama3.1` |

---

### 步骤 2: 拿到 API Key (如需)

| 平台 | 获取 Key 方式 |
|---|---|
| Google AI Studio | aistudio.google.com → Get API Key |
| Groq | console.groq.com → API Keys → Create |
| NVIDIA NIM | build.nvidia.com → API Keys (需手机验证) |
| GitHub Models | GitHub Settings → Developer settings → Personal access tokens |
| OpenRouter | openrouter.ai → Keys |
| Z.AI | z.ai → API Key |
| 硅基流动/火山/百炼 | 对应控制台 → API Key (需实名) |

---

### 步骤 3: 第一行代码

#### Python (OpenAI SDK 通用)
```python
from openai import OpenAI
import os

# 选一个平台，填对应的 base_url 和 api_key
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",  # Groq
    api_key=os.environ.get("GROQ_API_KEY")      # 环境变量里放 key
)

resp = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "你好，用一句话介绍你自己"}],
    max_tokens=100
)
print(resp.choices[0].message.content)
```

#### curl (无需 SDK)
```bash
# Groq 示例
curl -X POST https://api.groq.com/openai/v1/chat/completions   -H "Authorization: Bearer $GROQ_API_KEY"   -H "Content-Type: application/json"   -d '{"model": "llama-3.3-70b-versatile", "messages": [{"role": "user", "content": "你好"}]}'

# Pollinations (无需 Key)
curl "https://text.pollinations.ai/你好，介绍一下你自己"
```

#### Node.js
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

const resp = await client.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{ role: 'user', content: '你好' }],
});
console.log(resp.choices[0].message.content);
```

---

## 🔧 进阶：配置 Fallback 链 (Hermes Agent)

如果你用 Hermes Agent，直接用自动生成的配置：

```bash
# 1. 克隆本仓库
git clone https://github.com/happyyboxx/free-llm-atlas
cd free-llm-atlas

# 2. 安装探测依赖
pip install -r scripts/requirements.txt

# 3. 生成 Hermes 配置
python3 scripts/probe.py --export-config hermes
# 生成 config_hermes.yaml

# 4. 合并到 ~/.hermes/config.yaml
# 复制 models 和 fallback_chain 部分
```

生成的配置包含所有**实测活跃**的永久免费层模型，按速度/质量排序。

---

## 📦 一键部署本地模型 (Ollama)

```bash
# 安装
curl -fsSL https://ollama.com/install.sh | sh

# 跑一个模型 (后台自动下载)
ollama run llama3.1:8b

# 或后台服务模式
ollama serve &
# 然后用 OpenAI SDK 指向 http://localhost:11434/v1
```

常用模型标签：
```bash
ollama run llama3.1:8b      # 8B 快
ollama run llama3.3:70b     # 70B 强 (需 48GB+ 内存)
ollama run qwen2.5:72b      # 中文强
ollama run deepseek-r1:70b  # 推理模型
ollama run gemma2:27b       # Google 开源
ollama run phi3.5:3.8b      # Microsoft 小而强
```

---

## ❓ 常见问题

| 问题 | 解决 |
|---|---|
| **401 Unauthorized** | Key 过期/错误，重新生成；检查环境变量名 |
| **429 Rate Limited** | 触发限流，等待或切换 fallback；Groq/Google 有较高免费额度 |
| **连接超时** | 国内访问国外 API 需代理；或用国内平台 (Z.AI/硅基流动/火山/百炼) |
| **模型不存在** | 模型 ID 变更，查看 `/models` 端点或 providers.json 最新列表 |
| **中文乱码/效果差** | 用中文优化模型：GLM (Z.AI)、Qwen (硅基流动/百炼)、Nemotron Ultra (OpenRouter/NIM) |

---

## 🎯 下一步

- 阅读 [选型决策树](decision-tree.md) 精准匹配需求
- 查看 [永久免费层详细对比](../platforms/permanent-free.md) 深度选型
- 运行 `python3 scripts/probe.py --all` 自动探测最新可用性
- Star 本项目 ⭐ 关注免费 LLM 最新动态
