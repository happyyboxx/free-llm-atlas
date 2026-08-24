# free-llm-atlas

> **17개 무료 LLM API 제공자, 매일 자동 프로브. 구조화된 JSON + 게이트웨이 설정. 프로덕션 제로 비용.**

[![GitHub Stars](https://img.shields.io/github/stars/happyyboxx/free-llm-atlas?style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Automated Probe](https://img.shields.io/github/actions/workflow/status/happyyboxx/free-llm-atlas/probe.yml?label=Daily%20Probe&style=flat-square)](https://github.com/happyyboxx/free-llm-atlas/actions/workflows/probe.yml)
[![Providers](https://img.shields.io/badge/Providers-17-blue?style=flat-square)](data/providers.json)
[![Free Forever](https://img.shields.io/badge/Free%20Forever-17%20no%20card-success?style=flat-square)](docs/platforms/permanent-free.md)

---

## 30초 빠른 시작

```bash
git clone https://github.com/happyyboxx/free-llm-atlas.git
cd free-llm-atlas

# 1. 신용카드 불필요한 무료 제공자 찾기
cat data/providers.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
for p in d['providers']:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f'  {p[\"name\"]}: {p.get(\"rate_limit\", \"N/A\")}')"

# 2. 즉시 모든 제공자 프로브
pip install httpx pyyaml
python3 scripts/probe.py --all

# 3. 게이트웨이 설정 내보내기
python3 scripts/probe.py --export-config hermes    > hermes.yaml
python3 scripts/probe.py --export-config litellm   > litellm.yaml
python3 scripts/probe.py --export-config portkey   > portkey.yaml
python3 scripts/probe.py --export-config openwebui > openwebui.yaml
```

---

## 이 프로젝트가 필요한 이유

모든 "무료 LLM API" 리스트는 **일주일 만에 구식이 됨**. 제공자는 제한을 변경하고, 모델을 폐기하고, 신용카드를 요구하고, 엔드포인트를 폐쇄함. 이 프로젝트가 해결:

| 기능 | 구현 방식 |
|---|---|
| **매일 자동 프로브** | GitHub Actions가 매일 06:00 UTC에 모든 17개 제공자 프로브 |
| **구조화된 데이터** | `providers.json` — 기계 판독 가능, Markdown 테이블 아님 |
| **게이트웨이 설정** | 프로브 결과에서 Hermes / LiteLLM / Portkey / Open WebUI YAML 자동 생성 |
| **카드 불필요 필터** | 신용카드 불필요한 17개 제공자 — 명확히 태그 |
| **실시간 상태** | Git 히스토리 = 업타임 대시보드. 어떤 제공자가 언제 저하되었는지 확인 |
| **숨은 제한 공개** | TPM, RPM, 동시 요청 — 진짜 병목 현상 |

---

## 🔑 숨은 제한 (핵심 인사이트)

**대부분 "무료" 리스트는 일일 요청 제한만 표시. 진짜 병목은 분당 토큰 수와 동시 요청 수:**

| 제공자 | 일일 요청 | **TPM** | **동시** | 컨텍스트 | 적합 용도 |
|---|---|---|---|---|---|
| Groq | 14,400 | **6,000** | 10 | 8K | 저지연 스트리밍 |
| Google AI Studio | 1,500 | **1,000,000** | 10 | 2M | 긴 컨텍스트 / 멀티모달 |
| NVIDIA NIM | 1,000 | **1,000** | 5 | 1M | 추론, Function Calling |
| Cloudflare Workers AI | 100,000 | 100,000 | 20 | 8K | 에지 / Workers |
| Cohere | 1,000 | 1,000 | 5 | 4K | Embeddings / Rerank |

> **경험칙**: 채팅 앱에서 **TPM이 진짜 제한**. Groq 6K TPM ≈ 분당 250 메시지. 배치 처리에선 일일 제한이 더 중요.

---

## 📊 한눈에 보기 (최신 프로브 기준)

| 카테고리 | 개수 | 용도 | 상위 제공자 |
|---|---|---|---|
| **영구 무료 (카드 불필요)** | 17 | 프로덕션 폴백 체인 | Google (Gemini 2M ctx), Groq (300+ tok/s), NIM (102 모델), Cloudflare, Cohere |
| **시험 크레딧** | 2 | 프로토타입 / 평가 | Agnes AI (텍스트), DeepSeek |
| **로컬 추론** | 0 | 프라이버시 / 오프라인 / 에어갭 | [로컬 추론](docs/platforms/local-inference.md) 참조 |
| **테스트된 엔드포인트** | 17 | 모두 작동 확인됨 | 11 정상 / 4 저하 / 1 다운 / 1 알 수 없음 |

### 제로 비용 프로덕션 스택

```yaml
# 권장 폴백 체인 (게이트웨이에서 설정)
primary:    Groq          # 속도: 300+ tok/s, 14.4K req/day
secondary:  Google AI     # 컨텍스트: 2M tokens, 멀티모달
tertiary:   NVIDIA NIM    # 추론: Nemotron Ultra 1M ctx, Function Calling
quaternary: Cloudflare    # 에지: Workers AI, 100K req/day
fallback:   Cohere        # Embedding/RAG: 1K req/month

→ 95% 프로덕션 워크로드 커버, $0 비용
```

---

## 🚀 사용법

### 적합한 제공자 찾기

```bash
# 모든 영구 무료, 카드 불필요
python3 scripts/probe.py --tier permanent_free --no-key

# 현재 정상 제공자 (최신 프로브 기준)
cat data/providers.json | jq '.providers[] | select(.status == "active") | .name'

# Function Calling 지원 제공자
cat data/providers.json | jq '.providers[] | select(.function_calling == true) | .name'

# 컨텍스트 ≥100K 제공자
cat data/providers.json | jq '.providers[] | select(.context_window >= 100000) | .name'

# 스트리밍용 최고 TPM
cat data/providers.json | jq '.providers[] | select(.rate_limit.tpm > 5000) | "\(.name): \(.rate_limit.tpm) TPM"'
```

### 프로브 실행

```bash
# 모든 17개 제공자 프로브
python3 scripts/probe.py --all

# 영구 무료 층만 프로브
python3 scripts/probe.py --tier permanent_free

# 게이트웨이에 내보내기
python3 scripts/probe.py --export-config hermes    # -> hermes.yaml
python3 scripts/probe.py --export-config litellm   # -> litellm.yaml
python3 scripts/probe.py --export-config portkey   # -> portkey.yaml
python3 scripts/probe.py --export-config openwebui # -> openwebui.yaml
```

### Python에서 사용

```python
import json

providers = json.load(open('data/providers.json'))['providers']

# 카드 불필요 무료 제공자와 제한 가져오기
for p in providers:
    if p['tier'] == 'permanent_free' and not p.get('requires_card'):
        print(f"{p['name']:20s} | TPM: {p.get('rate_limit', {}).get('tpm', '?'):>6} | Ctx: {p.get('context_window', '?'):>8}")

# TPM으로 정렬하여 폴백 체인 구성
fallback = sorted(
    [p for p in providers if p['tier'] == 'permanent_free' and not p.get('requires_card')],
    key=lambda x: x.get('rate_limit', {}).get('tpm', 0),
    reverse=True
)
for p in fallback:
    print(f"{p['name']}: {p.get('rate_limit', {}).get('tpm', 0)} TPM | ctx={p.get('context_window', '?')}")
```

---

## 🔄 매일 자동화

| 워크플로 | 스케줄 | 출력 |
|---|---|---|
| `probe.yml` | 매일 06:00 UTC | `data/providers.json` 상태 + 메트릭 업데이트 |
| `update.yml` | 매주 월요일 00:00 UTC | 상류 소스에서 새 제공자 동기화 |

**Git 히스토리 = 업타임 대시보드.** 모든 커밋이 어떤 제공자가 상태를 변경했는지 보여줌.

---

## 📖 문서

| 문서 | 내용 |
|---|---|
| [영구 무료 층](docs/platforms/permanent-free.md) | 17개 제공자 비교: 제한, 컨텍스트, 기능 |
| [시험 크레딧](docs/platforms/trial-credits.md) | 2개 제공자 크레딧 금액 + 만료 |
| [로컬 추론](docs/platforms/local-inference.md) | 9개 로컬 도구: VRAM 요구사항, 모델 지원 |
| [결정 트리](docs/guides/decision-tree.md) | "어떤 제공자를 써야 하나?" 플로차트 |
| [게이트웨이 설정](docs/guides/gateway-config.md) | Hermes / LiteLLM / Portkey / Open WebUI 설정 |
| [빠른 시작](docs/guides/quickstart.md) | 5분 시작 가이드 |
| [숨은 제한](docs/guides/hidden-limits.md) | TPM vs 일일, 동시 요청, 컨텍스트 윈도우 |
| [제공자 비교](docs/platforms/comparison.md) | 상세 테이블: RPM, TPM, 컨텍스트, 기능, 건강 점수 |

---

## 📊 데이터 소스

다음 소스에서 데이터 수집 및 검증:

| 상류 | Stars | 유형 |
|---|---|---|
| [cheahjs/free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources) | 28K+ | 매일 자동 크롤링 |
| [tashfeenahmed/freellmapi](https://github.com/tashfeenahmed/freellmapi) | 17K+ | 실행 가능한 프록시 도구 |
| [mnfst/awesome-free-llm-apis](https://github.com/mnfst/awesome-free-llm-apis) | 6K+ | 엄격한 영구 무료 |
| [nejib1/Free-LLM](https://github.com/nejib1/Free-LLM) | 100+ | 43+ 제공자 트래커 |

---

## 🛠 게이트웨이 설정 예시

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

## 🎯 프로덕션 체크리스트

무료 스택으로 프로덕션 진입 전:

- [ ] **모니터링 설정** — 429/레이트 리밋 에러 알림
- [ ] **타임아웃 설정** — 무료 층은 지연 변동이 더 큼
- [ ] **폴백 구현** — 3+ 제공자 체인 (위 제로 비용 스택 참조)
- [ ] **TPM 추적, 일일만 아님** — Groq 6K TPM ≠ 14.4K req/day (스트리밍 시)
- [ ] **동시 부하 테스트** — Groq 무료 층 10 동시 = 즉시 429
- [ ] **Embeddings 캐시** — Cohere 무료 층은 관대하지만 무한하지 않음
- [ ] **저하 계획 수립** — 4 저하 / 1 다운은 정상; 백업 준비

---

## 🤝 기여

PR 환영! [CONTRIBUTING.md](CONTRIBUTING.md) 읽기.

- **제공자 추가** → `data/providers.json` 편집 또는 이슈 생성
- **프로브 결과 수정** → `scripts/probe.py` 실행 후 업데이트된 결과 커밋
- **문서 개선** → `docs/`의 markdown 편집

---

## ⚖️ 라이선스 및 면책

**MIT License** — [LICENSE](LICENSE) 참조.

- 무료 층, 레이트 제한, 모델 가용성은 **자주 변경** — 항상 공식 문서로 확인
- 이 프로젝트는 공개 정보 집계 — **API 키 제공 안 함**
- 상업적 이용 시 각 플랫폼 이용약관 필독

---

**이 프로젝트가 무료 LLM API 검색 시간 절약해줬다면 Star ⭐ 부탁드립니다.**
