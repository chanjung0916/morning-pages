# ADR-0001: 모바일 프레임워크 선택

## Status

Accepted

## Context

iOS와 Android 모두 동작하는 모바일 앱을 6주 안에 완성해야 한다.
팀원은 JavaScript/TypeScript 기반 웹 개발 경험이 있고 개발 환경은 Windows다.
발표용 APK 배포가 필요하다.

## Decision

**React Native (Expo managed workflow)** 를 선택한다.

## Alternatives

| 대안 | 검토 결과 |
|---|---|
| Flutter | iOS·Android 동시 지원, UI 일관성 높음. 단, 플랫폼 기본 UI 요소를 쓰지 않고 화면 전체를 직접 그려서 각 OS의 기본 UX 느낌이 달라질 수 있음 |
| Android Native (Kotlin) | OS 기능 풀 액세스, 성능 최상. 단, iOS 별도 개발 필요 |
| iOS Native (Swift) | Apple 생태계 최적화. 단, macOS와 Xcode 필수 — Windows 환경 불가 |

## Consequences

- JavaScript Bridge를 통해 iOS·Android 네이티브 컴포넌트를 단일 TypeScript 코드로 제어
- 기존 JS/TS 코드와 npm 생태계 그대로 활용 가능 (lodash, dayjs 등 웹에서 쓰던 라이브러리 재사용)
- Expo managed workflow로 네이티브 빌드 환경 없이 개발 시작 가능
- EAS Build 서비스로 Windows에서도 클라우드 APK 빌드 가능
- Metro 번들러 + Fast Refresh로 코드 변경 즉시 반영


## 60초 발표 요약

"프레임워크는 React Native(Expo)를 선택했습니다.
React Native는 TypeScript로 코드를 한 번 작성하면 iOS와 Android 앱이 동시에 만들어지고,
각 플랫폼의 버튼, 스크롤, 텍스트 입력 같은 기본 UI 요소를 그대로 사용합니다.
대안인 Flutter도 크로스플랫폼을 지원하지만,
Flutter는 iOS·Android 기본 UI 요소를 쓰지 않고 화면의 모든 것을 직접 그립니다.
그래서 플랫폼마다 다른 기본 UX 느낌이 사라지고,
사용자가 익숙한 iOS·Android 스타일과 다르게 보일 수 있습니다.
일기 앱처럼 복잡한 그래픽이나 고성능 연산이 필요 없는 가벼운 앱에서는
Flutter의 자체 렌더링 이점이 크지 않고, 플랫폼 기본 UX를 그대로 쓰는 React Native가 더 적합하다고 판단했습니다."
