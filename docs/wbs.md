# WBS (Work Breakdown Structure)

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Morning Pages — 아침 일기 앱 |
| 기간 | 2026-03-01 ~ 2026-06-17 (14주) |
| 플랫폼 | React Native (Expo SDK 54) + TypeScript |
| 담당 | 단독 개발 |

---

## 전체 일정

```
Week  1~ 2 : 기획 & 환경 설정
Week  3~ 4 : 핵심 기능 구현 (CRUD)
Week  5~ 6 : 주제/프롬프트 시스템
Week  7~ 8 : UI 개선 & 캘린더
Week  9~10 : 즐겨찾기 & 기록 화면
Week 11~12 : 설정 & 알림
Week 13~14 : 문서화 & 발표 준비
```

---

## 1단계: 기획 & 환경 설정 (1~2주)

| 작업 | 산출물 | 완료 |
|---|---|---|
| 앱 비전 및 요구사항 정의 | requirements.md | ✅ |
| 기술 스택 결정 | ADR-002 | ✅ |
| 아키텍처 설계 | ADR-003, architecture.md | ✅ |
| Expo 프로젝트 초기화 | package.json, app.json | ✅ |
| 개발 환경 설정 문서 | setup.md | ✅ |
| 폴더 구조 설계 | AGENTS.md | ✅ |

## 2단계: 핵심 기능 구현 (3~4주)

| 작업 | 산출물 | 완료 |
|---|---|---|
| Diary Entity 정의 | `src/domain/entities/Diary.ts` | ✅ |
| DiaryRepository 구현 | `src/data/repositories/DiaryRepository.ts` | ✅ |
| SaveDiaryUseCase 구현 | `src/domain/usecases/SaveDiaryUseCase.ts` | ✅ |
| DiaryContext (상태관리) | `src/application/context/DiaryContext.tsx` | ✅ |
| 홈 화면 구현 | `HomeScreen.tsx` | ✅ |
| 일기 작성 화면 | `WriteScreen.tsx` | ✅ |
| 일기 상세 화면 | `DiaryDetailScreen.tsx` | ✅ |
| AsyncStorage 저장 결정 | ADR-001 | ✅ |

## 3단계: 주제/프롬프트 시스템 (5~6주)

| 작업 | 산출물 | 완료 |
|---|---|---|
| CustomTopic 엔티티 | `CustomTopicRepository.ts` | ✅ |
| AI 프롬프트 생성 모달 | `TopicPromptModal.tsx` | ✅ |
| 오늘의 주제 배정 로직 | `getTodayTopic()` | ✅ |
| 주제 새로고침 기능 | `refreshTodayTopic()` | ✅ |
| 더미 시드 데이터 | `seedData.ts` | ✅ |

## 4단계: UI 개선 & 캘린더 (7~8주)

| 작업 | 산출물 | 완료 |
|---|---|---|
| 다크 테마 히어로 헤더 | `HomeScreen.tsx` hero 섹션 | ✅ |
| 잔디 기여 그래프 | `ContributionGraph.tsx` | ✅ |
| 캘린더 화면 | `CalendarScreen.tsx` | ✅ |
| 사이드 드로어 | `SideDrawer.tsx` | ✅ |
| 테마 컨텍스트 (다크/라이트) | `ThemeContext.tsx` | ✅ |

## 5단계: 즐겨찾기 & 기록 화면 (9~10주)

| 작업 | 산출물 | 완료 |
|---|---|---|
| 즐겨찾기 화면 | `FavoritesScreen.tsx` | ✅ |
| 과거 기록 화면 | `RecordsScreen.tsx` | ✅ |
| 연도/월 2단계 필터 | RecordsScreen 필터 로직 | ✅ |
| 카테고리 필터 | HomeScreen, FavoritesScreen | ✅ |
| 주제 배지 표시 | 각 목록 아이템 | ✅ |
| 맨 위로 버튼 | RecordsScreen | ✅ |

## 6단계: 설정 & 알림 (11~12주)

| 작업 | 산출물 | 완료 |
|---|---|---|
| 설정 화면 | `SettingsScreen.tsx` | ✅ |
| 매일 알림 기능 | `notification.ts` | ✅ |
| 다크모드 토글 | ThemeContext | ✅ |
| 폰트 크기 설정 | ThemeContext fontScale | ✅ |
| 프로필 화면 | `ProfileScreen.tsx` | ✅ |
| 주제 관리 (삭제) | SettingsScreen | ✅ |

## 7단계: 문서화 & 발표 준비 (13~14주)

| 작업 | 산출물 | 완료 |
|---|---|---|
| README 작성 | README.md | ✅ |
| AGENTS.md 작성 | AGENTS.md | ✅ |
| 아키텍처 문서 | docs/architecture.md | ✅ |
| ADR 3개 작성 | docs/adr/ | ✅ |
| setup/deploy/testing 문서 | docs/ | ✅ |
| 단위 테스트 11개 | `__tests__/` | ✅ |
| 발표 대본 작성 | docs/presentation/script.md | ✅ |
| 시연 시나리오 준비 | 30초 데모 플로우 | ✅ |

---

## 기술 스택

| 분류 | 기술 | 선택 이유 |
|---|---|---|
| 프레임워크 | React Native (Expo SDK 54) | 크로스플랫폼, 빠른 개발 |
| 언어 | TypeScript | 타입 안전성, IDE 지원 |
| 내비게이션 | expo-router | 파일 기반 라우팅, 직관적 구조 |
| 저장소 | AsyncStorage | 오프라인 완전 동작, 서버 불필요 |
| 알림 | expo-notifications | Expo 생태계 통합 |
| 캘린더 | react-native-calendars | 검증된 라이브러리 |
| 테스트 | Jest + ts-jest | TypeScript 단위 테스트 |
| 빌드 | EAS Build | 클라우드 빌드, APK 자동화 |
| AI 협업 | Claude Code (Anthropic) | 코드 생성 및 리뷰 |
