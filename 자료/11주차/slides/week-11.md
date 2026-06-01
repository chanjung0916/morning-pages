---
marp: true
theme: default
paginate: true
size: 16:9
header: "Vibe Coding Project — Session 3 / Architecture & Setup"
footer: "© 2026 Project Kickoff · Week 11"
style: |
   section.fit-table table,
   section.pipeline-check table {
      font-size: 0.78em;
   }

   section.fit-table th,
   section.fit-table td,
   section.pipeline-check th,
   section.pipeline-check td {
      padding: 4px 8px;
   }

   section.fit-table p,
   section.compact-code p {
      font-size: 0.9em;
      margin-top: 0.35em;
   }

   section.compact-code :is(pre, marp-pre) {
      font-size: 0.72em;
      line-height: 1.05;
      padding: 12px;
   }

   section.prompt-compact :is(pre, marp-pre) {
      font-size: 0.57em;
      line-height: 1.12;
      padding: 10px 12px;
   }

   section.prompt-compact li,
   section.prompt-compact p {
      font-size: 0.9em;
   }

   section.pipeline-check svg[aria-label="clone to run pipeline"] {
      display: block;
      width: 82%;
      margin: 0 auto;
   }
---

# 세션 3 — 설계 & 환경 구축

> 이번 세션 종료 시 본인 리포지토리는
> **`git clone` → 한 줄 명령으로 실행 가능**해야 합니다.

---

## 오늘의 목표

1. 강의 슬라이드를 페이지씩 보며 **큰 그림 이해**
2. 모바일 앱 플랫폼 선택과 그 이유를 **ADR로 말하고 기록**
3. 아키텍처 다이어그램과 디렉토리 구조 확정
4. **빌드되는 "Hello World" 상태**까지 만들기
5. `docs/setup.md`, `docs/architecture.md` 작성
6. 실습 중 3회 점검으로 진행 상태 확인

---

## 오늘의 진행 방식

<svg viewBox="0 0 980 270" width="100%" role="img" aria-label="강의 진행 방식">
   <defs>
      <linearGradient id="g1" x1="0" x2="1">
         <stop offset="0" stop-color="#2563eb"/>
         <stop offset="1" stop-color="#7c3aed"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
         <feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#0f172a" flood-opacity="0.18"/>
      </filter>
   </defs>
   <rect x="30" y="40" width="270" height="170" rx="24" fill="#eff6ff" stroke="#2563eb" stroke-width="3" filter="url(#shadow)"/>
   <rect x="355" y="40" width="270" height="170" rx="24" fill="#f5f3ff" stroke="#7c3aed" stroke-width="3" filter="url(#shadow)"/>
   <rect x="680" y="40" width="270" height="170" rx="24" fill="#ecfdf5" stroke="#059669" stroke-width="3" filter="url(#shadow)"/>
   <path d="M310 125 H345" stroke="url(#g1)" stroke-width="8" stroke-linecap="round"/>
   <path d="M635 125 H670" stroke="#059669" stroke-width="8" stroke-linecap="round"/>
   <text x="165" y="92" text-anchor="middle" font-size="30" font-weight="700" fill="#1e3a8a">1단계</text>
   <text x="165" y="138" text-anchor="middle" font-size="28" fill="#0f172a">페이지별 이해</text>
   <text x="165" y="176" text-anchor="middle" font-size="20" fill="#334155">핵심 개념 · 왜 필요한가 · 산출물</text>
   <text x="490" y="92" text-anchor="middle" font-size="30" font-weight="700" fill="#5b21b6">2단계</text>
   <text x="490" y="138" text-anchor="middle" font-size="28" fill="#0f172a">개별 실습</text>
   <text x="490" y="176" text-anchor="middle" font-size="20" fill="#334155">AI Agent와 리포지토리 구축</text>
   <text x="815" y="92" text-anchor="middle" font-size="30" font-weight="700" fill="#047857">3회 점검</text>
   <text x="815" y="138" text-anchor="middle" font-size="28" fill="#0f172a">말하기 → 구조 → 실행</text>
   <text x="815" y="176" text-anchor="middle" font-size="20" fill="#334155">진행 상태를 짧고 자주 확인</text>
</svg>

> **오늘은 설명보다 산출물이 중요합니다.**  
> 이해 → 실습 → 점검을 짧은 주기로 반복합니다.

---

## 페이지별로 볼 때의 질문 3개

각 슬라이드는 아래 3문장으로 정리합니다.

<svg viewBox="0 0 980 160" width="100%" role="img" aria-label="슬라이드 이해 질문 3단계">
   <defs>
      <marker id="question-flow-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
         <path d="M0,0 L0,6 L9,3 z" fill="#64748b"/>
      </marker>
   </defs>
   <rect x="35" y="42" width="210" height="76" rx="18" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/>
   <rect x="275" y="42" width="210" height="76" rx="18" fill="#ede9fe" stroke="#7c3aed" stroke-width="3"/>
   <rect x="515" y="42" width="210" height="76" rx="18" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
   <rect x="755" y="42" width="190" height="76" rx="18" fill="#fff7ed" stroke="#ea580c" stroke-width="3"/>
   <path d="M252 80 H268" stroke="#64748b" stroke-width="5" marker-end="url(#question-flow-arrow)"/>
   <path d="M492 80 H508" stroke="#64748b" stroke-width="5" marker-end="url(#question-flow-arrow)"/>
   <path d="M732 80 H748" stroke="#64748b" stroke-width="5" marker-end="url(#question-flow-arrow)"/>
   <text x="140" y="74" text-anchor="middle" font-size="23" font-weight="800" fill="#1e3a8a">핵심 개념</text>
   <text x="140" y="103" text-anchor="middle" font-size="18" fill="#334155">무엇인가?</text>
   <text x="380" y="74" text-anchor="middle" font-size="23" font-weight="800" fill="#5b21b6">프로젝트 이유</text>
   <text x="380" y="103" text-anchor="middle" font-size="18" fill="#334155">왜 필요한가?</text>
   <text x="620" y="74" text-anchor="middle" font-size="23" font-weight="800" fill="#166534">오늘 산출물</text>
   <text x="620" y="103" text-anchor="middle" font-size="18" fill="#334155">무엇으로 남길까?</text>
   <text x="850" y="74" text-anchor="middle" font-size="22" font-weight="800" fill="#9a3412">저장 위치</text>
   <text x="850" y="103" text-anchor="middle" font-size="17" fill="#334155">README · docs · ADR · 코드</text>
</svg>

| 관점 | 학생이 답해야 할 말 |
|---|---|
| 개념 | "이건 무엇인가?" |
| 이유 | "우리 앱에서 왜 필요한가?" |
| 산출물 | "어느 파일/문서에 남길 것인가?" |

---

<!-- _class: fit-table -->

## 1. 플랫폼 선택지

| 플랫폼 | 장점 | 단점 | 추천 대상 |
|---|---|---|---|
| **Flutter** | 한 코드로 양 OS, UI 풍부 | Dart 학습 | 빠른 프로토타입 |
| **React Native** | JS/TS 생태계, 익숙함 | 네이티브 모듈 시 복잡 | 웹 경험자 |
| **Android(Kotlin)** | 풀 네이티브, 도구 성숙 | iOS 별도 | Android만 타겟 |
| **iOS(Swift)** | Apple 생태계 깊이 | macOS 필수 | iOS만 타겟 |
| **Kotlin Multiplatform** | 코어 공유, 네이티브 UI | 복잡도 높음 | 중급 이상 |

→ 선택 후 **ADR-0001: 모바일 플랫폼 선택**으로 기록

---

## ADR로 말하기 — 저번 주 내용을 꺼내기

첫 번째 실습 점검은 **저번 주 ADR을 이용한 말하기 훈련**입니다.

<svg viewBox="0 0 980 300" width="74%" style="display:block;margin:0 auto" role="img" aria-label="ADR 말하기 카드">
   <defs>
      <linearGradient id="adr" x1="0" x2="1" y1="0" y2="1">
         <stop offset="0" stop-color="#fef3c7"/>
         <stop offset="1" stop-color="#fde68a"/>
      </linearGradient>
   </defs>
   <rect x="40" y="35" width="900" height="225" rx="26" fill="url(#adr)" stroke="#f59e0b" stroke-width="4"/>
   <text x="90" y="92" font-size="32" font-weight="800" fill="#78350f">ADR 60초 말하기 카드</text>
   <text x="90" y="145" font-size="24" fill="#0f172a">1. 우리는 무엇을 선택했나?</text>
   <text x="90" y="185" font-size="24" fill="#0f172a">2. 다른 선택지는 무엇이었나?</text>
   <text x="90" y="225" font-size="24" fill="#0f172a">3. 우리 팀의 기준에서 왜 이 선택이 더 낫나?</text>
   <circle cx="820" cy="145" r="58" fill="#fff7ed" stroke="#ea580c" stroke-width="4"/>
   <text x="820" y="136" text-anchor="middle" font-size="30" font-weight="800" fill="#9a3412">60초</text>
   <text x="820" y="171" text-anchor="middle" font-size="18" fill="#9a3412">말로 설명</text>
</svg>

> 목표: "문서가 있다"가 아니라 **문서의 결정을 말로 방어할 수 있다**.

---

## 2. 아키텍처 — 가장 흔한 모바일 앱 레이어

<svg viewBox="0 0 980 260" width="100%" role="img" aria-label="모바일 앱 레이어드 아키텍처">
   <defs>
      <marker id="layer-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
         <path d="M0,0 L0,6 L9,3 z" fill="#64748b"/>
      </marker>
   </defs>
   <rect x="35" y="70" width="205" height="120" rx="20" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/>
   <rect x="275" y="70" width="205" height="120" rx="20" fill="#ede9fe" stroke="#7c3aed" stroke-width="3"/>
   <rect x="515" y="70" width="205" height="120" rx="20" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
   <rect x="755" y="70" width="190" height="120" rx="20" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
   <path d="M247 130 H268" stroke="#64748b" stroke-width="5" marker-end="url(#layer-arrow)"/>
   <path d="M487 130 H508" stroke="#64748b" stroke-width="5" marker-end="url(#layer-arrow)"/>
   <path d="M727 130 H748" stroke="#64748b" stroke-width="5" marker-end="url(#layer-arrow)"/>
   <text x="138" y="112" text-anchor="middle" font-size="25" font-weight="800" fill="#1e3a8a">Presentation</text>
   <text x="138" y="148" text-anchor="middle" font-size="18" fill="#334155">UI · Screen · View</text>
   <text x="378" y="112" text-anchor="middle" font-size="25" font-weight="800" fill="#5b21b6">Application</text>
   <text x="378" y="148" text-anchor="middle" font-size="18" fill="#334155">ViewModel · UseCase</text>
   <text x="618" y="112" text-anchor="middle" font-size="25" font-weight="800" fill="#166534">Domain</text>
   <text x="618" y="148" text-anchor="middle" font-size="18" fill="#334155">Entity · Service · Rule</text>
   <text x="850" y="112" text-anchor="middle" font-size="25" font-weight="800" fill="#991b1b">Data</text>
   <text x="850" y="148" text-anchor="middle" font-size="18" fill="#334155">Repository · API · DB</text>
   <text x="490" y="232" text-anchor="middle" font-size="18" fill="#475569">흐름: 화면 → 상태/흐름 → 핵심 규칙 → 외부 데이터</text>
</svg>

> AI Agent에게 "이 4개 레이어로 우리 프로젝트 구조를 잡아줘"
> 라고만 시키면 95%는 정확하게 만듭니다.

---

<!-- _class: compact-code -->

## 3. 디렉토리 구조 (Flutter 예시)

```
lib/
├── main.dart
├── app.dart
├── presentation/
│   ├── screens/
│   ├── widgets/
│   └── theme/
├── application/
│   └── view_models/
├── domain/
│   ├── entities/
│   └── services/
└── data/
    ├── repositories/
    ├── api/
    └── local/
```

→ React Native, Android도 동일한 사고 구조

---

## 아키텍처를 파일 위치로 바꾸기

<svg viewBox="0 0 980 330" width="70%" style="display:block;margin:0 auto" role="img" aria-label="레이어와 파일 위치 매핑">
   <style>
      .title { font: 700 24px sans-serif; fill: #0f172a; }
      .body { font: 18px sans-serif; fill: #334155; }
      .small { font: 16px sans-serif; fill: #475569; }
   </style>
   <rect x="35" y="35" width="205" height="230" rx="20" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/>
   <rect x="275" y="35" width="205" height="230" rx="20" fill="#ede9fe" stroke="#7c3aed" stroke-width="3"/>
   <rect x="515" y="35" width="205" height="230" rx="20" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
   <rect x="755" y="35" width="190" height="230" rx="20" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
   <text x="138" y="80" text-anchor="middle" class="title">Presentation</text>
   <text x="138" y="125" text-anchor="middle" class="body">screens/</text>
   <text x="138" y="158" text-anchor="middle" class="body">widgets/</text>
   <text x="138" y="191" text-anchor="middle" class="body">theme/</text>
   <text x="378" y="80" text-anchor="middle" class="title">Application</text>
   <text x="378" y="125" text-anchor="middle" class="body">view_models/</text>
   <text x="378" y="158" text-anchor="middle" class="body">use_cases/</text>
   <text x="378" y="191" text-anchor="middle" class="body">state/</text>
   <text x="618" y="80" text-anchor="middle" class="title">Domain</text>
   <text x="618" y="125" text-anchor="middle" class="body">entities/</text>
   <text x="618" y="158" text-anchor="middle" class="body">services/</text>
   <text x="618" y="191" text-anchor="middle" class="body">rules/</text>
   <text x="850" y="80" text-anchor="middle" class="title">Data</text>
   <text x="850" y="125" text-anchor="middle" class="body">repositories/</text>
   <text x="850" y="158" text-anchor="middle" class="body">api/</text>
   <text x="850" y="191" text-anchor="middle" class="body">local/</text>
   <path d="M245 150 H268" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
   <path d="M485 150 H508" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
   <path d="M725 150 H748" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
   <text x="490" y="306" text-anchor="middle" class="small">질문: 새 화면·상태·비즈니스 규칙·API 코드는 각각 어디에 둘 것인가?</text>
</svg>

---

## 4. 환경 구축 체크리스트

| 항목 | 확인 |
|---|---|
| Git 저장소 생성 | ✅ |
| `.gitignore` (플랫폼별) | ✅ |
| README — 프로젝트 한 줄 설명 | ✅ |
| 의존성 명세 (`pubspec.yaml` 등) | ✅ |
| 첫 빌드 성공 | ✅ |
| `docs/setup.md` 작성 | ✅ |
| 에디터 권장 확장 (`.vscode/extensions.json`) | ✅ |

---

## 5. `docs/setup.md` 의 절대 조건

> **새 사람이 이 문서만 보고 5분 안에 실행할 수 있어야 한다.**

### 포함되어야 할 내용
1. 필요한 도구 버전 (Node 20.x, Flutter 3.x, JDK 17 등)
2. 클론 명령
3. 의존성 설치 명령
4. 환경 변수 설정 방법 (`.env.example` 포함)
5. 첫 실행 명령
6. 문제 해결 (FAQ 5개)

> **AI Agent에게 "윈도우/맥/리눅스 모두 따라할 수 있게" 명시 요청**

---

## 점검 1 — ADR로 말할 수 있는가?

**확인 시점**: 실습 초반, 플랫폼/상태관리/백엔드 선택을 시작하기 전

| 확인 질문 | 좋은 답변의 조건 |
|---|---|
| 지난주 ADR의 결정은 무엇인가? | 선택 항목을 한 문장으로 말함 |
| 대안은 무엇이었나? | 최소 1개 이상 비교함 |
| 왜 그 결정을 유지/변경하나? | 팀 프로젝트 기준과 연결함 |

### 학생 말하기 템플릿

> "우리 팀은 `[선택]`을 선택했습니다.  
> 대안으로는 `[대안]`이 있었지만, `[우리 기준]` 때문에 현재 선택이 더 적합합니다.  
> 그래서 오늘은 이 결정을 `ADR-0001`에 반영하고 구조를 만들겠습니다."

---

## 점검 2 — 구조를 설명할 수 있는가?

**확인 시점**: 디렉토리 구조와 `docs/architecture.md` 초안 작성 후

<svg viewBox="0 0 980 190" width="100%" role="img" aria-label="파일 위치 점검 질문">
   <defs>
      <marker id="where-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
         <path d="M0,0 L0,6 L9,3 z" fill="#64748b"/>
      </marker>
   </defs>
   <g font-size="16" text-anchor="middle">
      <rect x="30" y="25" width="210" height="50" rx="15" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
      <text x="135" y="57" font-weight="800" fill="#0f172a">새 화면은?</text>
      <path d="M135 78 V94" stroke="#64748b" stroke-width="4" marker-end="url(#where-arrow)"/>
      <rect x="30" y="105" width="210" height="50" rx="15" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/>
      <text x="135" y="137" fill="#1e3a8a">presentation/screens</text>
      <rect x="270" y="25" width="210" height="50" rx="15" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
      <text x="375" y="57" font-weight="800" fill="#0f172a">상태/흐름은?</text>
      <path d="M375 78 V94" stroke="#64748b" stroke-width="4" marker-end="url(#where-arrow)"/>
      <rect x="270" y="105" width="210" height="50" rx="15" fill="#ede9fe" stroke="#7c3aed" stroke-width="3"/>
      <text x="375" y="137" fill="#5b21b6">application/view_models</text>
      <rect x="510" y="25" width="210" height="50" rx="15" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
      <text x="615" y="57" font-weight="800" fill="#0f172a">핵심 규칙은?</text>
      <path d="M615 78 V94" stroke="#64748b" stroke-width="4" marker-end="url(#where-arrow)"/>
      <rect x="510" y="105" width="210" height="50" rx="15" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
      <text x="615" y="137" fill="#166534">domain</text>
      <rect x="750" y="25" width="200" height="50" rx="15" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
      <text x="850" y="57" font-weight="800" fill="#0f172a">API/DB는?</text>
      <path d="M850 78 V94" stroke="#64748b" stroke-width="4" marker-end="url(#where-arrow)"/>
      <rect x="750" y="105" width="200" height="50" rx="15" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/>
      <text x="850" y="137" fill="#991b1b">data</text>
   </g>
</svg>

- 파일이 "대충 생겼다"가 아니라 **위치 이유**를 설명해야 합니다.
- `docs/architecture.md`에 Mermaid 다이어그램이 있어야 합니다.
- AI Agent가 만든 구조라도 학생이 읽고 수정할 수 있어야 합니다.

---

<!-- _class: pipeline-check -->

## 점검 3 — 실행과 인수인계가 되는가?

**확인 시점**: 수업 후반, 빌드/실행/문서/Push 직전

<svg viewBox="0 0 980 260" width="100%" role="img" aria-label="clone to run pipeline">
   <defs>
      <linearGradient id="pipe" x1="0" x2="1">
         <stop offset="0" stop-color="#06b6d4"/>
         <stop offset="1" stop-color="#22c55e"/>
      </linearGradient>
   </defs>
   <path d="M110 130 H870" stroke="url(#pipe)" stroke-width="18" stroke-linecap="round"/>
   <g fill="#ffffff" stroke="#0f172a" stroke-width="3">
      <circle cx="145" cy="130" r="58"/>
      <circle cx="330" cy="130" r="58"/>
      <circle cx="515" cy="130" r="58"/>
      <circle cx="700" cy="130" r="58"/>
      <circle cx="855" cy="130" r="58"/>
   </g>
   <g font-family="sans-serif" text-anchor="middle" fill="#0f172a">
      <text x="145" y="122" font-size="20" font-weight="700">clone</text>
      <text x="145" y="150" font-size="15">받기</text>
      <text x="330" y="122" font-size="20" font-weight="700">install</text>
      <text x="330" y="150" font-size="15">설치</text>
      <text x="515" y="122" font-size="20" font-weight="700">env</text>
      <text x="515" y="150" font-size="15">설정</text>
      <text x="700" y="122" font-size="20" font-weight="700">run</text>
      <text x="700" y="150" font-size="15">실행</text>
      <text x="855" y="122" font-size="20" font-weight="700">push</text>
      <text x="855" y="150" font-size="15">공유</text>
   </g>
</svg>

| 통과 기준 | 증거 |
|---|---|
| 새 사람이 따라할 수 있음 | `docs/setup.md` |
| 현재 컴퓨터에서 실행됨 | 실행 화면 캡처 또는 콘솔 로그 |
| 팀원이 받을 수 있음 | GitHub push |

---

## 9. AI Agent 활용 — 이번 주 명령

```
1) 우리 프로젝트의 디렉토리 구조를
   레이어드 아키텍처로 만들어줘

2) docs/architecture.md 에 시스템 다이어그램(Mermaid) 포함

3) docs/setup.md 에 zero → run 절차 작성
   (윈도우/맥/리눅스 모두)

4) 아무 화면이나 1개를 만들고 빌드 성공 확인

5) ADR-0001 ~ 0003 생성
   (프레임워크, 상태관리, 백엔드 선택 이유)
```

---

<!-- _class: prompt-compact -->

## 설계 프롬프트 예시 1 — 먼저 물어보게 하기

AI가 바로 만들기 전에 **프로젝트 조건을 질문하게** 만듭니다.

```text
너는 모바일 앱 아키텍트이자 수업 조교야.

우리 프로젝트 정보:
- 앱 주제: [예: 캠퍼스 분실물 공유 앱]
- 선택 플랫폼: [Flutter / React Native / Android / iOS]
- 핵심 기능 3개: [기능1, 기능2, 기능3]
- 데이터 출처: [로컬 저장 / Firebase / REST API / 미정]
- 팀 경험: [초급 / 웹 경험 있음 / 모바일 경험 있음]

요청:
1. 설계를 시작하기 전에 빠진 정보가 있으면 질문 5개를 먼저 해줘.
2. 추측한 내용은 "가정"이라고 표시해줘.
3. 답변 후 Presentation / Application / Domain / Data 기준으로
   설계 방향을 제안해줘.
```

> 좋은 설계 프롬프트는 **정보 → 질문 → 가정 → 설계** 순서입니다.

---

<!-- _class: prompt-compact -->

## 설계 프롬프트 예시 2 — 구조와 문서 만들기

아키텍처를 **파일 구조와 문서 산출물**로 연결합니다.

```text
아래 조건으로 우리 앱의 초기 구조를 설계해줘.

조건:
- 레이어: Presentation, Application, Domain, Data
- 각 레이어의 책임을 한 문장으로 설명
- 핵심 기능 3개가 어느 레이어를 지나는지 표로 정리
- 플랫폼별 관례에 맞는 디렉토리 구조 제안

산출물:
1. 디렉토리 트리
2. docs/architecture.md 초안
3. docs/architecture.md에 넣을 Mermaid 다이어그램 코드
4. ADR-0001(플랫폼), ADR-0002(상태관리), ADR-0003(백엔드) 초안

주의:
- 실제 파일을 만들기 전 변경 계획을 먼저 보여줘.
- 수업 초급자가 설명할 수 있는 단어로 작성해줘.
```

---

<!-- _class: prompt-compact -->

## 설계 프롬프트 예시 3 — 학생 검수 요청

AI가 만든 뒤에는 **왜 이렇게 설계했는지** 검수하게 합니다.

```text
방금 만든 구조를 학생 발표 관점에서 검수해줘.

검수 기준:
1. 새 화면 파일은 어디에 추가해야 하는가?
2. 상태/흐름 코드는 어느 폴더에 있어야 하는가?
3. 핵심 비즈니스 규칙은 어느 레이어에 있어야 하는가?
4. API/DB 코드는 어디에 있어야 하는가?
5. 현재 구조에서 잘못 배치된 것으로 의심되는 파일 3개를 찾아줘.

출력 형식:
- "학생이 60초 안에 설명할 말" 5문장
- 수정이 필요한 파일/폴더 목록
- 수정 전 확인해야 할 질문
```

> 핵심: **AI가 만든 구조를 학생이 말로 방어할 수 있어야 합니다.**

---

## AI Agent에게 맡기되, 학생이 검수하기

<svg viewBox="0 0 980 320" width="84%" style="display:block;margin:0 auto" role="img" aria-label="AI Agent 활용과 학생 검수 흐름">
   <defs>
      <marker id="seq-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
         <path d="M0,0 L0,6 L9,3 z" fill="#475569"/>
      </marker>
   </defs>
   <g font-size="17" text-anchor="middle">
      <rect x="40" y="25" width="150" height="46" rx="14" fill="#dbeafe" stroke="#2563eb" stroke-width="3"/>
      <text x="115" y="55" font-weight="800" fill="#1e3a8a">Student</text>
      <rect x="285" y="25" width="150" height="46" rx="14" fill="#ede9fe" stroke="#7c3aed" stroke-width="3"/>
      <text x="360" y="55" font-weight="800" fill="#5b21b6">AI Agent</text>
      <rect x="535" y="25" width="150" height="46" rx="14" fill="#dcfce7" stroke="#16a34a" stroke-width="3"/>
      <text x="610" y="55" font-weight="800" fill="#166534">Repository</text>
      <rect x="790" y="25" width="150" height="46" rx="14" fill="#fff7ed" stroke="#ea580c" stroke-width="3"/>
      <text x="865" y="55" font-weight="800" fill="#9a3412">Docs/ADR</text>
   </g>
   <g stroke="#cbd5e1" stroke-width="3" stroke-dasharray="8 8">
      <line x1="115" y1="75" x2="115" y2="290"/>
      <line x1="360" y1="75" x2="360" y2="290"/>
      <line x1="610" y1="75" x2="610" y2="290"/>
      <line x1="865" y1="75" x2="865" y2="290"/>
   </g>
   <g font-size="15" fill="#0f172a">
      <path d="M125 100 H350" stroke="#475569" stroke-width="4" marker-end="url(#seq-arrow)"/>
      <text x="238" y="92" text-anchor="middle">구조·문서·초기 화면 요청</text>
      <path d="M370 137 H600" stroke="#475569" stroke-width="4" marker-end="url(#seq-arrow)"/>
      <text x="485" y="129" text-anchor="middle">파일 생성 및 수정</text>
      <path d="M370 174 H855" stroke="#475569" stroke-width="4" marker-end="url(#seq-arrow)"/>
      <text x="612" y="166" text-anchor="middle">다이어그램·setup 작성</text>
      <path d="M125 211 H600" stroke="#475569" stroke-width="4" marker-end="url(#seq-arrow)"/>
      <text x="362" y="203" text-anchor="middle">빌드/실행 확인</text>
      <path d="M125 248 H855" stroke="#475569" stroke-width="4" marker-end="url(#seq-arrow)"/>
      <text x="490" y="240" text-anchor="middle">결정 이유와 실행 절차 검수</text>
      <path d="M350 285 H125" stroke="#ef4444" stroke-width="4" stroke-dasharray="7 6" marker-end="url(#seq-arrow)"/>
      <text x="238" y="277" text-anchor="middle" fill="#991b1b">틀린 부분 수정 요청</text>
   </g>
</svg>

> 핵심: AI가 만들고, **학생이 설명하고 검수**합니다.

---

## 10. "이해했다"의 정의 — 이번 주

본인이 다음에 답할 수 있어야 합니다.

- [ ] 지난주 ADR의 결정을 60초 안에 말할 수 있는가?
- [ ] 우리 프로젝트의 디렉토리 구조를 머리로 그릴 수 있는가?
- [ ] 새 화면을 추가하려면 어디에 파일을 만들어야 하나?
- [ ] API 호출은 어느 레이어에서 일어나는가?
- [ ] 빌드가 실패하면 어디부터 봐야 하나?
- [ ] 왜 이 프레임워크를 선택했나? (대안 vs 이유)
- [ ] `git clone` 후 한 줄 명령으로 실행되는가?

---

## 11. 다음 세션까지

1. `docs/architecture.md`, `docs/setup.md` 작성 완료
2. ADR 최소 3개 작성
3. "Hello World" 빌드 성공 push
4. (2인 팀) 두 사람 모두 로컬에서 빌드 성공 인증
5. 다음 주 **중간 발표** 준비 시작 — 슬라이드 초안

---

## 함께 보는 자료

- `resources/01-platform-comparison.md` — 플랫폼 상세 비교
- `resources/02-architecture-patterns.md` — 모바일 앱 아키텍처 패턴
- `resources/03-setup-template.md` — `docs/setup.md` 템플릿
- `resources/04-design-prompt-examples.md` — 설계 프롬프트 예시
