# Setup

새 팀원이 git clone 후 5분 안에 실행할 수 있도록 작성.

---

## 1. 사전 요구

| 도구 | 버전 | 확인 명령 |
|---|---|---|
| Node.js | 20.x LTS | `node -v` |
| npm | 10.x | `npm -v` |
| Git | 2.40+ | `git --version` |
| Expo CLI | 최신 | `npx expo --version` |
| Expo Go 앱 | 최신 | Android / iOS 스토어에서 설치 |

### Windows

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

### macOS

```bash
brew install node git
```

### Linux (Ubuntu)

```bash
sudo apt update
sudo apt install nodejs npm git
```

---

## 2. 클론

```bash
git clone https://github.com/[user]/morning-pages.git
cd morning-pages
```

---

## 3. 의존성 설치

```bash
npm install
```

---

## 4. 환경 변수

이 앱은 오프라인 로컬 저장 방식이라 `.env` 파일이 필요 없습니다.
향후 Gemini API 연동 시 `.env.example`을 복사해 사용:

```bash
cp .env.example .env
```

각 키 설명:
- `GEMINI_API_KEY` — Google AI Studio에서 발급 (현재 미사용)

---

## 5. 첫 실행

```bash
npx expo start
```

실행 후 터미널에 QR 코드가 표시됩니다.

**성공 기준:**
- Expo Go 앱으로 QR 코드 스캔 → 홈 화면 표시
- 또는 `a` 키: Android 에뮬레이터 실행
- 또는 `i` 키: iOS 시뮬레이터 실행 (macOS 전용)

---

## 6. 자주 묻는 문제

### Q1. "command not found: expo" 가 나와요
→ `npx expo start` 로 실행하세요. 전역 설치 없이 동작합니다.

### Q2. `npm install` 중 오류가 나요
→ Node.js 버전을 확인하세요. `node -v` 가 18 미만이면 20 LTS로 재설치.

### Q3. Expo Go에서 "Network response timed out" 오류
→ 개발 PC와 스마트폰이 같은 Wi-Fi에 연결되어 있는지 확인하세요.
→ 안 되면 `npx expo start --tunnel` 로 실행하세요.

### Q4. Android 에뮬레이터가 안 떠요
→ Android Studio에서 AVD Manager로 가상 기기를 먼저 생성하세요.
→ HAXM 또는 Hyper-V가 활성화되어 있는지 확인하세요.

### Q5. Windows에서 Metro 번들러가 멈춰요
→ PowerShell을 관리자 권한으로 실행하거나,
→ Windows Defender 실시간 보호에서 프로젝트 폴더를 예외로 추가하세요.
