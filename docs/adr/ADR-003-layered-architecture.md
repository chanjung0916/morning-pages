# ADR-003: Layered Architecture + MVVM 패턴 채택

- **날짜:** 2026-03-08
- **상태:** 승인됨

## 맥락

React Native 앱의 코드 구조를 어떻게 나눌지 결정해야 했다. 후보는 두 가지였다.

| 구조 | 특징 |
|---|---|
| 단순 구조 (screens에 모든 로직) | 빠르게 시작 가능. 코드가 커지면 관리 어려움. |
| Layered Architecture + MVVM | 책임 분리. 테스트 용이. 초기 설정이 필요. |

## 결정

**Presentation → Application → Domain → Data 4계층 구조를 채택한다.**

```
src/
├── presentation/   # 화면, 컴포넌트 (React Native)
├── application/    # Context, 상태 관리 (ViewModel 역할)
├── domain/         # UseCase, Entity (비즈니스 규칙)
└── data/           # Repository, AsyncStorage 연동
```

## 이유

1. **테스트 가능성** — Domain/Data 레이어가 React에 의존하지 않아 Jest로 순수 단위 테스트 가능
2. **단방향 의존** — Presentation은 Application을 알고, Application은 Domain을 알지만 역방향 의존 없음
3. **변경 격리** — AsyncStorage를 SQLite로 바꿔도 Data 레이어만 수정. 나머지 레이어 영향 없음
4. **AI Agent 협업** — 레이어 경계가 명확하면 AI가 파일 배치를 실수할 가능성이 줄어듦 (AGENTS.md에 명시)

## 트레이드오프

- 파일 수 증가 → 작은 기능도 Entity/UseCase/Repository 3개 파일 필요
- 초기 보일러플레이트 → 개발 초반 설정 시간 투자 필요, 이후 일관된 패턴으로 빠른 기능 추가 가능

## 결과

- `SaveDiaryUseCase`, `DiaryRepository` 가 레이어 경계에 따라 분리됨
- Domain 레이어 단위 테스트 11개 통과 (React Native 없이 Jest만으로 실행)
- AI Agent(Claude Code)와 협업 시 파일 위치 혼선 없음
