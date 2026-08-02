# 本地运行方案详细对比

9 类主流本地 LLM 推理工具/平台。完全免费、无限制、隐私优先。

---

## 📊 核心对比

| 工具 | Stars | 语言 | GUI | API 兼容 | 模型格式 | 硬件加速 | 适合场景 |
|---|---|---|---|---|---|---|---|
| **Ollama** | 150k+ | Go | ❌ | ✅ OpenAI | GGUF | CPU/GPU (Metal/CUDA) | 入门首选，一键运行 |
| **LM Studio** | 40k+ | TS/Rust | ✅ | ✅ OpenAI | GGUF | CPU/GPU (Metal/CUDA/Vulkan) | 可视化管理，对话界面 |
| **GPT4All** | 60k+ | C++/Py | ✅ | ✅ OpenAI | GGUF | CPU/GPU | 隐私优先，内置商店 |
| **llama.cpp** | 75k+ | C++ | ❌ | ✅ OpenAI | GGUF/EXL2 | CPU/GPU (全平台) | 核心引擎，极致性能 |
| **Jan.ai** | 43.8k | TypeScript | ✅ | ✅ OpenAI | GGUF | CPU/GPU (Metal/CUDA) | 开源 ChatGPT 替代 |
| **KoboldCpp** | 11.3k | C++ | ✅ (KoboldAI) | ✅ OpenAI | GGUF | CPU/GPU | 角色扮演/写作优化 |
| **llamafile** | 25.5k | C/C++ | ❌ | ✅ OpenAI | 单文件 | CPU/GPU | **零依赖分发** |
| **Text-Gen-WebUI** | 47.5k | Python | ✅ (Gradio) | ✅ OpenAI | GGUF/EXL2/AWQ/GPTQ | CPU/GPU | 功能最全，支持训练 |
| **BentoML** | 8.7k | Python | ❌ | ✅ OpenAI | 任意 (打包) | CPU/GPU | 生产级模型服务 |

---

## 🎯 选择指南

### 完全新手，想最简单
→ **Ollama** `curl -fsSL https://ollama.com/install.sh | sh` 然后 `ollama run llama3.1`

### 想要图形界面聊天
→ **LM Studio** (最成熟 GUI) → **GPT4All** (隐私优先) → **Jan.ai** (开源、功能全)

### 角色扮演 / 创意写作
→ **KoboldCpp** (KoboldAI UI 专为 RP 设计)

### 零依赖分发给他人
→ **llamafile** (单二进制文件，双击即运行)

### 想要功能最全 (RAG、训练、量化、多模态)
→ **Text Generation WebUI** (oobabooga)

### 生产环境部署 / 微服务
→ **BentoML** (模型打包、API、任务队列、批量推理)

### 极致性能 / 自定义编译
→ **llama.cpp** (核心引擎，所有上层工具都基于此)

---

## 🔧 硬件需求参考

| 模型大小 | 推荐内存 | 推荐显存 | 量化建议 |
|---|---|---|---|
| 1B-3B | 4-8 GB | 2-4 GB | Q4_K_M |
| 7B-8B | 8-16 GB | 6-10 GB | Q4_K_M / Q5_K_M |
| 13B-14B | 16-24 GB | 10-16 GB | Q4_K_M |
| 32B-35B | 32 GB+ | 20-24 GB | Q3_K_M / Q4_K_M |
| 70B-72B | 64 GB+ | 40-48 GB | Q3_K_M |
| 405B | 256 GB+ | 多卡 (8x H100) | Q2_K / Q3_K_M |

> **Apple Silicon 统一内存优势**：M 系列芯片 CPU/GPU 共享内存，64GB/96GB/128GB 统一内存可跑 70B Q4。

---

## 🚀 快速上手命令

### Ollama (推荐新手)
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# 运行模型
ollama run llama3.1:8b
ollama run qwen2.5:72b
ollama run deepseek-r1:70b

# API 服务 (后台运行)
ollama serve
# 然后访问 http://localhost:11434/v1
```

### LM Studio
1. 下载安装包：https://lmstudio.ai
2. 点击搜索下载模型 (GGUF)
3. 点击 "Start Server" → `http://localhost:1234/v1`

### llamafile (零依赖)
```bash
# 下载单文件 (例如 Llama 3.1 8B)
wget https://huggingface.co/Mozilla/Llama-3.1-8B-Instruct-llamafile/resolve/main/Llama-3.1-8B-Instruct.Q4_K_M.llamafile

# 赋权运行
chmod +x Llama-3.1-8B-Instruct.Q4_K_M.llamafile
./Llama-3.1-8B-Instruct.Q4_K_M.llamafile
# 访问 http://localhost:8080
```

### Jan.ai
```bash
# 下载 AppImage / dmg / exe
# 或 Docker
docker run -d -p 1337:1337 -v jan-data:/root/.jan ghcr.io/janhq/jan
```

### KoboldCpp
```bash
# 下载 Release 二进制
# 或 Docker
docker run -d -p 5001:5001 ghcr.io/lostruins/koboldcpp:latest
```

### Text Generation WebUI
```bash
# 一键安装 (Linux/macOS)
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
./start_linux.sh  # 或 start_macos.sh / start_windows.bat
```

### BentoML
```bash
pip install bentoml

# 创建服务
cat > service.py << 'EOF'
import bentoml
from bentoml.io import Text

@bentoml.service(
    resources={"gpu": 1},
    traffic={"timeout": 300},
)
class LLMService:
    def __init__(self):
        self.model = bentoml.models.HuggingFaceModel("meta-llama/Llama-3.1-8B-Instruct")
    
    @bentoml.api
    async def generate(self, prompt: str) -> str:
        # 使用 vLLM 或 transformers 推理
        pass
EOF

bentoml serve service:LLMService
```

---

## 🔌 API 统一性

所有工具都提供 **OpenAI 兼容 API** (`/v1/chat/completions`)，可直接接入：
- Hermes Agent
- LiteLLM
- Portkey
- Open WebUI
- Continue.dev
- 任何 OpenAI SDK 客户端

```python
from openai import OpenAI

# 统一接口，只需改 base_url
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # Ollama
client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")  # LM Studio
client = OpenAI(base_url="http://localhost:1337/v1", api_key="jan")  # Jan.ai

response = client.chat.completions.create(
    model="llama3.1:8b",  # 或任意已加载模型
    messages=[{"role": "user", "content": "你好"}]
)
```

---

## ⚡ 性能优化 Tips

| 优化 | 说明 |
|---|---|
| **使用 GPU** | 所有工具都支持 Metal (Apple) / CUDA (NVIDIA) / Vulkan (AMD/Intel) |
| **选择合适量化** | Q4_K_M = 平衡；Q5_K_M = 质量更好；Q2_K = 极致压缩 |
| **设置上下文长度** | `--ctx-size 8192` 或更大，避免截断 |
| **启用 Flash Attention** | llama.cpp: `-fa`；Text-Gen-WebUI: 模型加载时勾选 |
| **批量推理** | BentoML / vLLM 支持连续批处理，吞吐提升 10x+ |
| **KV Cache 量化** | llama.cpp: `-ckv q4_k`，显存省 50%+ |

---

*本地运行 = 完全免费 + 隐私绝对 + 无限制。硬件允许下，优先考虑。*
