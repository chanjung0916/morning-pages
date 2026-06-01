# 모바일 플랫폼 상세 비교

## Flutter (Dart)

**개요**: Google 주도. 단일 코드로 iOS/Android/Web/Desktop.

**장점**:
- UI 위젯 시스템이 풍부하고 일관됨
- Hot Reload로 개발 속도 빠름
- 한 번 작성으로 양 OS 동작
- AI Agent의 학습 데이터가 많음

**단점**:
- Dart 학습 필요
- 네이티브 모듈 깊게 다루려면 결국 Kotlin/Swift 필요
- 패키지 생태계는 React Native보다 작음

**추천 도구**: VS Code + Flutter 확장, Android Studio

## React Native (TypeScript)

**개요**: Meta 주도. JavaScript 엔진 위에서 네이티브 컴포넌트 사용.

**장점**:
- JS/TS 익숙하면 진입 빠름
- 거대한 npm 생태계
- Expo 사용 시 환경 구축 매우 쉬움

**단점**:
- 네이티브 브릿지 디버깅 어려움
- 버전 업그레이드가 종종 까다로움
- 성능 민감 영역은 결국 네이티브

**추천 도구**: VS Code, Expo

## Android Native (Kotlin / Jetpack Compose)

**개요**: Android만 타겟. Compose는 선언형 UI.

**장점**:
- OS 기능 풀 액세스
- 도구(Android Studio) 성숙
- 성능과 UX 최상

**단점**:
- iOS 별도 개발 필요
- 진입 장벽이 다소 높음

## iOS Native (Swift / SwiftUI)

**개요**: iOS만 타겟. SwiftUI는 선언형 UI.

**장점**:
- Apple 생태계 깊은 통합
- 도구(Xcode) 성숙
- 성능 최상

**단점**:
- macOS 필수
- Android 별도 개발 필요

## 선택 가이드

| 상황 | 추천 |
|---|---|
| 빠르게 양 OS 모두 데모하고 싶다 | Flutter |
| 웹 개발자, JS/TS가 익숙 | React Native (Expo) |
| Android만 본격적으로 | Kotlin + Compose |
| iOS만 본격적으로, Mac 보유 | Swift + SwiftUI |
| 학습보다 결과 우선 | Flutter (Expo도 OK) |

> **선택 후 반드시 ADR-0001로 기록.**
> 발표 Q&A의 단골 질문입니다.
