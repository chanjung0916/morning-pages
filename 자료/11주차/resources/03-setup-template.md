# `docs/setup.md` 템플릿

새 사람이 5분 안에 따라할 수 있도록 작성.

```markdown
# Setup

## 1. 사전 요구

| 도구 | 버전 | 확인 명령 |
|---|---|---|
| Git | 2.40+ | `git --version` |
| [플랫폼 SDK] | x.y | `[명령]` |
| Node.js | 20.x | `node -v` |
| ... | ... | ... |

### 윈도우 / macOS / 리눅스 설치

#### 윈도우
```powershell
winget install ...
```

#### macOS
```bash
brew install ...
```

#### 리눅스 (Ubuntu)
```bash
sudo apt install ...
```

## 2. 클론

```bash
git clone https://github.com/[user]/[repo].git
cd [repo]
```

## 3. 의존성 설치

```bash
[패키지 매니저] install
```

## 4. 환경 변수

`.env.example` 을 복사해서 `.env` 만들기:

```bash
cp .env.example .env
```

각 키의 의미:
- `API_KEY` — [어디서 발급받는지]
- `BASE_URL` — [기본값과 변경 시점]

## 5. 첫 실행

```bash
[실행 명령]
```

성공 시: [무엇이 보여야 하는가]

## 6. 자주 묻는 문제

### Q1. "command not found" 가 나와요
→ ...

### Q2. 빌드 중 메모리 부족
→ ...

### Q3. 시뮬레이터/에뮬레이터가 안 떠요
→ ...

### Q4. iOS 빌드 시 인증서 문제
→ ...

### Q5. Android Gradle 동기화 실패
→ ...
```

## 검증

이 문서가 잘 됐는지는 **본인이 다른 컴퓨터에서 직접 따라해보면** 확실합니다.

또는 친구에게 30초 간 보여주고 "막히는 부분이 있나?" 물어보세요.
