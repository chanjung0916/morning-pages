# AGENTS.md — Morning Pages 에이전트 운영 헌법

> 이 파일은 AI Agent가 매 턴 자동으로 참조하는 프로젝트 헌법입니다.
> 모든 에이전트는 이 문서의 규칙을 최우선으로 따릅니다.

---

## 프로젝트 한 줄 요약

**매일 아침 2~3분, 오늘의 나를 기록하는 모바일 일기 앱**
플랫폼: React Native (Expo managed workflow) + TypeScript
저장: AsyncStorage (오프라인 완전 동작, 서버 없음)

---

## 절대 규칙 (모든 에이전트 공통)

1. **오프라인 동작 최우선** — 네트워크 없이 모든 기능이 동작해야 한다
2. **레이어 경계 준수** — Presentation → Application → Domain → Data 단방향 의존
3. **Must 완성 전 Should 금지** — 핵심 CRUD가 안 되면 추가 기능 착수 안 함
4. **파일 위치 규칙 준수** — 새 파일은 반드시 `docs/architecture.md`의 레이어 표를 확인 후 배치
5. **변경 전 계획 먼저** — 코드 작성 전에 변경할 파일 목록과 이유를 먼저 보여준다

---

## 디렉토리 & 파일 위치 규칙

| 추가할 것 | 위치 | 예시 |
|---|---|---|
| 새 화면 | `src/presentation/screens/` | `StatsScreen.tsx` |
| 재사용 컴포넌트 | `src/presentation/components/` | `MoodPicker.tsx` |
| 상태/흐름 | `src/application/viewmodels/` | `StatsViewModel.ts` |
| 전역 상태 컨텍스트 | `src/application/context/` | `SettingsContext.tsx` |
| 비즈니스 규칙 | `src/domain/usecases/` | `GetMoodStatsUseCase.ts` |
| 데이터 타입 | `src/domain/entities/` | `MoodEntry.ts` |
| 저장소 구현 | `src/data/repositories/` | `MoodRepository.ts` |
| 정적 데이터 | `src/data/` | `topics.json` |
| 유틸 함수 | `src/utils/` | `format.ts` |
| 단위 테스트 | UseCase 파일 옆 `__tests__/` | `GetMoodStatsUseCase.test.ts` |

---

## 등록된 에이전트 카탈로그

### 1. Feasibility Researcher
**파일:** `.github/agents/feasibility-researcher.agent.md`
**호출 시점:** 새 라이브러리 도입 검토, 기능 구현 가능성 불확실할 때
**출력:** 선택지 비교표 + 권장/비권장/조건부 권장 결론
**핵심 제약:** Expo managed workflow 기준, 오프라인 불가 시 반드시 명시

---

### 2. Implementation Planner
**파일:** `.github/agents/implementation-planner.agent.md`
**호출 시점:** 새 기능 개발 착수 전, 복잡한 로직 설계 필요할 때
**출력:** 사전 조건 → 구현 단계(30분~2시간 단위) → 완료 기준
**핵심 제약:** 한 단계 2시간 초과 시 더 잘게 분해, Must 미완성 시 Should 계획 금지

---

### 3. Code Reviewer
**파일:** `.github/agents/code-reviewer.agent.md`
**호출 시점:** 새 기능 구현 후 머지 전, 버그 발생 시
**출력:** 발견 사항 ([필수]/[권장]/[선택] 분류) + 총평
**핵심 체크리스트:** 오프라인 동작, AsyncStorage try-catch, FlatList keyExtractor

---

### 4. Test Writer
**파일:** `.github/agents/test-writer.agent.md`
**호출 시점:** 새 기능 구현 완료 후, 버그 재발 방지 테스트 필요 시
**출력:** 수동 테스트 체크리스트 (정상/엣지/오프라인 케이스)
**핵심 제약:** 오프라인 시나리오 반드시 포함

---

## 기술 스택 참조

| 영역 | 선택 | ADR |
|---|---|---|
| 프레임워크 | React Native (Expo ~53) | `ADR-0001` |
| 언어 | TypeScript (strict) | — |
| 저장소 | AsyncStorage | `ADR-0002` |
| 상태 관리 | useState + useContext | `ADR-0006` |
| 네비게이션 | expo-router (파일 기반) | — |
| 캘린더 | react-native-calendars | — |
| 테스트 | Jest + jest-expo | — |

---

## 현재 기능 구현 상태

### Must (핵심) — 구현 완료 ✅
- 일기 작성 (WriteScreen)
- 일기 저장 (DiaryRepository + AsyncStorage)
- 일기 목록 조회 (HomeScreen)
- 일기 상세 보기 (DiaryDetailScreen)
- 일기 수정/삭제 (DiaryDetailScreen → DiaryRepository)

### Should (추가) — 미구현 ⏳
- 기분 이모지 선택 UI (WriteScreen에 MoodPicker 컴포넌트 연결 필요)
- 캘린더 뷰 (CalendarScreen 구현됨, react-native-calendars 연동)
- 푸시 알림 (expo-notifications, 권한 흐름 미검증)
- 검색 기능

### Could (여유 시) — 미착수
- 기분 통계 차트
- 다크 모드

---

## 에이전트 사용 예시

```
# 가능성 조사가 필요할 때
@feasibility-researcher react-native-calendars가 Expo web에서 동작하는지 조사해줘

# 기능 계획이 필요할 때
@implementation-planner 푸시 알림 기능을 단계별로 계획해줘

# 코드 리뷰가 필요할 때
@code-reviewer src/presentation/screens/WriteScreen.tsx 를 리뷰해줘

# 테스트 작성이 필요할 때
@test-writer GetDiariesUseCase에 대한 테스트를 작성해줘
```

---

## 발표 Q&A 대비 문서 매핑

| 예상 질문 | 답변 근거 문서 |
|---|---|
| "왜 React Native를 선택했나요?" | `.planning/decisions/ADR-0001-platform.md` |
| "데이터는 어떻게 저장하나요?" | `.planning/decisions/ADR-0002-storage.md` |
| "상태 관리는 어떻게 하나요?" | `.planning/decisions/ADR-0006-state-management.md` |
| "환경 설정은 어떻게 하나요?" | `docs/setup.md` |
| "빌드/배포는 어떻게 하나요?" | `docs/deploy.md` |
| "테스트는 어떻게 돌리나요?" | `docs/testing.md` |
| "구조는 어떻게 되나요?" | `docs/architecture.md` |
