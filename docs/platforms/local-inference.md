# Local Inference Options Comparison

9 mainstream local LLM inference tools/platforms. Completely free, unlimited, privacy-first.

---

## 📊 Core Comparison

| Tool | Stars | Language | GUI | API Compatible | Model Formats | Hardware Accel | Best For |
|---|---|---|---|---|---|---|---|
| **Ollama** | 150k+ | Go | ❌ | ✅ OpenAI | GGUF | CPU/GPU (Metal/CUDA) | Beginners, one-command run |
| **LM Studio** | 40k+ | TS/Rust | ✅ | ✅ OpenAI | GGUF | CPU/GPU (Metal/CUDA/Vulkan) | Visual management, chat UI |
| **GPT4All** | 60k+ | C++/Py | ✅ | ✅ OpenAI | GGUF | CPU/GPU | Privacy-first, built-in store |
| **llama.cpp** | 75k+ | C++ | ❌ | ✅ OpenAI | GGUF/EXL2 | CPU/GPU (all platforms) | Core engine, extreme performance |
| **Jan.ai** | 43.8k | TypeScript | ✅ | ✅ OpenAI | GGUF | CPU/GPU (Metal/CUDA) | Open-source ChatGPT alternative |
| **KoboldCpp** | 11.3k | C++ | ✅ (KoboldAI) | ✅ OpenAI | GGUF | CPU/GPU | Roleplay/writing optimized |
| **llamafile** | 25.5k | C/C++ | ❌ | ✅ OpenAI | Single-file | CPU/GPU | **Zero-dependency distribution** |
| **Text-Gen-WebUI** | 47.5k | Python | ✅ (Gradio) | ✅ OpenAI | GGUF/EXL2/AWQ/GPTQ | CPU/GPU | Most features, supports training |
| **BentoML** | 8.7k | Python | ❌ | ✅ OpenAI | Any (packaged) | CPU/GPU | Production model serving |

---

## 🎯 Selection Guide

### Complete beginner, want simplest
→ **Ollama** `curl -fsSL https://ollama.com/install.sh | sh` then `ollama run llama3.1`

### Want graphical chat interface
→ **LM Studio** (most mature GUI) → **GPT4All** (privacy-first) → **Jan.ai** (open-source, full features)

### Roleplay / Creative writing
→ **KoboldCpp** (KoboldAI UI designed for RP)

### Zero-dependency distribution to others
→ **llamafile** (single binary, double-click to run)

### Want most features (RAG, training, quantization, multimodal)
→ **Text Generation WebUI** (oobabooga)

### Production deployment / Microservices
→ **BentoML** (model packaging, API, task queues, batch inference)

### Extreme performance / Custom compilation
→ **llama.cpp** (core engine, all upper layers build on this)

---

## 🔧 Hardware Requirements Reference

| Model Size | Recommended RAM | Recommended VRAM | Quantization |
|---|---|---|---|
| 1B-3B | 4-8 GB | 2-4 GB | Q4_K_M |
| 7B-8B | 8-16 GB | 6-10 GB | Q4_K_M / Q5_K_M |
| 13B-14B | 16-24 GB | 10-16 GB | Q4_K_M |
| 32B-35B | 32 GB+ | 20-24 GB | Q3_K_M / Q4_K_M |
| 70B-72B | 64 GB+ | 40-48 GB | Q3_K_M |
| 405B | 256 GB+ | Multi-GPU (8x H100) | Q2_K / Q3_K_M |

> **Apple Silicon Unified Memory Advantage**: M-series chips share CPU/GPU memory; 64GB/96GB/128GB unified memory can run 70B Q4.

---

## 🚀 Quick Start Commands

### Ollama (Recommended for Beginners)
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Run models
ollama run llama3.1:8b
ollama run qwen2.5:72b
ollama run deepseek-r1:70b

# API service (background)
ollama serve
# Then access http://localhost:11434/v1
```

### LM Studio
1. Download installer: https://lmstudio.ai
2. Search and download models (GGUF)
3. Click "Start Server" → `http://localhost:1234/v1`

### llamafile (Zero Dependency)
```bash
# Download single file (e.g., Llama 3.1 8B)
wget https://huggingface.co/Mozilla/Llama-3.1-8B-Instruct-llamafile/resolve/main/Llama-3.1-8B-Instruct.Q4_K_M.llamafile

# Make executable and run
chmod +x Llama-3.1-8B-Instruct.Q4_K_M.llamafile
./Llama-3.1-8B-Instruct.Q4_K_M.llamafile
# Access http://localhost:8080
```

### Jan.ai
```bash
# Download AppImage / dmg / exe
# Or Docker
docker run -d -p 1337:1337 -v jan-data:/root/.jan ghcr.io/janhq/jan
```

### KoboldCpp
```bash
# Download Release binary
# Or Docker
docker run -d -p 5001:5001 ghcr.io/lostruins/koboldcpp:latest
```

### Text Generation WebUI
```bash
# One-click install (Linux/macOS)
git clone https://github.com/oobabooga/text-generation-webui
cd text-generation-webui
./start_linux.sh  # or start_macos.sh / start_windows.bat
```

### BentoML
```bash
pip install bentoml

# Create service
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
        # Use vLLM or transformers for inference
        pass

bentoml serve service:LLMService
EOF
```

---

## 🔌 API Unification

All tools provide **OpenAI-compatible API** (`/v1/chat/completions`), directly integrable with:
- Hermes Agent
- LiteLLM
- Portkey
- Open WebUI
- Continue.dev
- Any OpenAI SDK client

```python
from openai import OpenAI

# Unified interface, just change base_url
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # Ollama
client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")  # LM Studio
client = OpenAI(base_url="http://localhost:1337/v1", api_key="jan")  # Jan.ai

response = client.chat.completions.create(
    model="llama3.1:8b",  # or any loaded model
    messages=[{"role": "user", "content": "Hello"}]
)
```

---

## ⚡ Performance Optimization Tips

| Optimization | Description |
|---|---|
| **Use GPU** | All tools support Metal (Apple) / CUDA (NVIDIA) / Vulkan (AMD/Intel) |
| **Choose right quantization** | Q4_K_M = balanced; Q5_K_M = better quality; Q2_K = extreme compression |
| **Set context length** | `--ctx-size 8192` or larger, avoid truncation |
| **Enable Flash Attention** | llama.cpp: `-fa`; Text-Gen-WebUI: check on model load |
| **Batch inference** | BentoML / vLLM support continuous batching, 10x+ throughput boost |
| **KV Cache quantization** | llama.cpp: `-ckv q4_k`, saves 50%+ VRAM |

---

*Local inference = completely free + absolute privacy + no limits. Prioritize when hardware allows.*