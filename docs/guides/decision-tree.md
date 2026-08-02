# 选型决策树

根据你的需求，快速找到最适合的免费 LLM 平台。

---

## 🎯 一问一答决策树

### Q1: 你能接受在本地运行模型吗？（有显存/内存 ≥ 8GB）
- **是** → 看 [本地运行方案](local-inference.md) → 推荐：**Ollama** (最简单) / **LM Studio** (有GUI) / **Jan.ai** (开源全能)
- **否** → 继续 Q2

### Q2: 你能接受绑定信用卡吗？（即使是免费额度）
- **否** → 看 [永久免费层](permanent-free.md) → 继续 Q3
- **是** → 看 [试用额度平台](trial-credits.md) → 继续 Q6

### Q3: 你完全不想注册账号，甚至不想要 API Key？
- **是** → **Pollinations.ai** (完全匿名，支持文生图) 或 **Kilo Code** (无需Key，346模型)
- **否** → 继续 Q4

### Q4: 你的主要使用场景是什么？

| 场景 | 首选 | 备选 |
|---|---|---|
| **极致推理速度** | **Groq** (LPU, 300+ tok/s) | Cerebras |
| **超长上下文 (1M+)** | **NVIDIA NIM** (Nemotron Ultra 1M) | OpenRouter (Nemotron Ultra 免费) |
| **中文/国内低延迟** | **Z.AI (GLM-4.5-Flash)** | 硅基流动* / 火山引擎* |
| **闭源顶级模型 (GPT-5, Claude, o4-mini)** | **GitHub Models** (免费额度含闭源) | LLM7.io* / OpenRouter* |
| **Function Calling / Agent** | **NVIDIA NIM** / **OpenRouter** | Google / Groq / Mistral |
| **多模态 (视觉/音频/视频)** | **GitHub Models** / **Google** | NVIDIA NIM / Replicate* |
| **Embedding / RAG** | **Cohere** / **Google** | HuggingFace / Mistral |
| **欧洲 GDPR 合规** | **Mistral** (法企业级) | OVHcloud (匿名) |
| **模型种类最多** | **HuggingFace** (129+) | OpenRouter (聚合) |

*需要 Key 或有额度限制

### Q5: 如果首选不可用，降级策略？

```
永久免费层主力链:
Groq (速度) → Google (多模态/中文) → NVIDIA NIM (推理/长上下文)
    → OpenRouter (聚合/兜底) → Cohere (Embedding) → Mistral (EU合规)
    → Kilo Code (无Key) → Pollinations (零门槛)
```

---

## 📋 场景化推荐配置

### 场景 A: 个人开发者，零成本，想快速跑通 Demo
```
1. Pollinations.ai (零配置测试)
2. Kilo Code (无Key，更多模型)
3. Google AI Studio (注册送 1500 RPD，Gemini 2.0 Flash)
4. Groq (注册送 14400 RPD，极速)
```

### 场景 B: 中文应用，国内部署，需低延迟
```
1. Z.AI (GLM-4.5-Flash 永久免费，200K ctx)
2. Coze (豆包/DeepSeek，Bot/Workflow 免费)
3. 硅基流动* (新用户 20M Token，速度最快)
4. 火山引擎* (500 点/天，极致速度)
5. 百炼* (千万 Token，多模态全)
```

### 场景 C: 需要 GPT-5 / Claude / o4-mini 等闭源顶级模型
```
1. GitHub Models (免费额度含 GPT-5, o4-mini, GPT-4.1)
2. LLM7.io (30 RPM 免费，带 token 120 RPM)
3. OpenRouter (14 免费模型，含 Nemotron Ultra)
4. 试用额度: Fireworks/Hyperbolic/Together ($1 顶一下)
```

### 场景 D: Agent / Function Calling / 结构化输出
```
1. NVIDIA NIM (Nemotron Ultra 推理强，Function Calling 完善)
2. OpenRouter (Nemotron Ultra 免费，多模型对比)
3. Google AI Studio (Gemini 2.0 Function Calling)
4. Groq (Llama 3.3 Function Calling)
5. Mistral (Function Calling 原生支持)
```

### 场景 E: 企业合规 / EU 数据驻留 / GDPR
```
1. Mistral La Plateforme (法国公司，EU 数据中心)
2. OVHcloud (法国云厂商，GDPR 原生)
3. Scaleway* (法国云，试用额度)
```

### 场景 F: 隐私敏感 / 离线环境 / 数据不出本地
```
1. Ollama (最简单，一键运行)
2. LM Studio (GUI 友好)
3. Jan.ai (开源，功能全：RAG/Embedding/Function Calling)
4. llama.cpp (核心引擎，极致性能)
```

---

## 🔄 组合策略：构建免费 Fallback 链

### Hermes Agent 配置示例
```yaml
# ~/.hermes/config.yaml
models:
  - model: "llama-3.3-70b-versatile"
    provider: "groq"
    api_base: "https://api.groq.com/openai/v1"
    api_key_env: "GROQ_API_KEY"
  
  - model: "gemini-1.5-flash"
    provider: "google"
    api_base: "https://generativelanguage.googleapis.com/v1beta"
    api_key_env: "GOOGLE_API_KEY"
  
  - model: "nvidia/nemotron-3-ultra-550b-a55b:free"
    provider: "openrouter"
    api_base: "https://openrouter.ai/api/v1"
    api_key_env: "OPENROUTER_API_KEY"
  
  - model: "glm-4.5-flash"
    provider: "z-ai"
    api_base: "https://api.z.ai/api/paas/v4"
    api_key_env: "ZAI_API_KEY"

fallback_chain:
  - "llama-3.3-70b-versatile"
  - "gemini-1.5-flash"
  - "nvidia/nemotron-3-ultra-550b-a55b:free"
  - "glm-4.5-flash"
```

### 生成配置脚本
```bash
# 自动从 providers.json 生成
python3 scripts/probe.py --export-config hermes
# 输出 config_hermes.yaml，直接复制到 Hermes config
```

---

## ⚡ 快速参考卡

| 我要... | 直接用这个 |
|---|---|
| 不注册、无Key、马上能用 | `curl https://text.pollinations.ai/hello` |
| 最快推理速度 | Groq (Llama 3.3 70B) |
| 最长上下文 (1M) | NVIDIA NIM (Nemotron Ultra) |
| 免费用 GPT-5 / o4-mini | GitHub Models |
| 国内最快、中文最好 | 硅基流动* / Z.AI |
| 完全本地、隐私绝对 | Ollama / Jan.ai |
| 只做 Embedding/RAG | Cohere / Google |
| 欧盟合规 | Mistral / OVHcloud |

*需信用卡验证

---

> 决策树基于 2026-08 实测数据。平台政策随时变动，以 providers.json 最新探测为准。
