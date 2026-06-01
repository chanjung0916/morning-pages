# ADR-0006: 상태 관리 방식

## Status

Accepted

## Context

앱의 각 화면에서 일기 목록, 작성 중인 내용, 선택한 주제 등 상태를 관리해야 한다.
화면 수는 5~8개이며, 상태 공유가 필요한 범위는 일기 목록과 현재 선택 주제 정도다.

## Decision

**React 내장 useState + useContext** 를 사용한다.

- 화면 단위 로컬 상태: `useState`
- 전역 공유 상태(일기 목록, 선택 주제): `useContext` + ViewModel 패턴

## Alternatives

| 대안 | 검토 결과 |
|---|---|
| Redux Toolkit | 모든 상태 변경이 액션 → 리듀서 → 스토어 단방향 흐름으로 강제되어 상태 추적이 명확. 단, 상태 하나 추가 시 액션 타입·리듀서·셀렉터를 함께 정의해야 해 코드량이 많음 |
| Zustand | 경량 스토어, 보일러플레이트 적음. 단, 외부 라이브러리 의존성 추가 필요 |
| MobX | 반응형 프로그래밍 패턴으로 상태 변경 시 자동 리렌더링. 단, 데코레이터 기반 문법이 React 기본 패턴과 이질적 |

## Consequences

**긍정적**
- 외부 라이브러리 추가 없이 React 기본 도구만 사용
- 화면 5~8개 규모에서 Context 중첩 없이 충분히 관리 가능
- ViewModel에 useContext를 결합해 Layered Architecture와 자연스럽게 연결

**부정적**
- 상태가 많아지면 Context Provider 중첩이 깊어질 수 있음
- Redux Toolkit DevTools 같은 상태 변화 추적 도구 없음

## 60초 발표 요약

"상태 관리는 React 내장 useState와 useContext를 사용했습니다.
useState는 컴포넌트 단위 로컬 상태를, useContext는 일기 목록처럼
여러 화면에서 공유하는 전역 상태를 prop drilling 없이 전달합니다.
대안인 Redux Toolkit은 모든 상태 변경이 액션 → 리듀서 → 스토어 순으로
단방향 흐름을 강제해 상태 추적이 명확하지만, 상태 하나를 추가할 때마다
액션 타입·리듀서·셀렉터를 함께 정의해야 해서 화면 5~8개 규모에서는
실제 이점보다 관리 코드가 더 많아집니다.
이 프로젝트 규모에서는 React 내장 도구로 충분하다고 판단했습니다."
