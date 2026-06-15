# ADR-002: Expo Managed Workflow 채택

- **날짜:** 2026-03-01
- **상태:** 승인됨

## 맥락

React Native 프로젝트를 시작할 때 두 가지 선택지가 있었다.

| 방식 | 특징 |
|---|---|
| Expo Managed Workflow | Expo가 네이티브 코드 관리. 빌드 자동화. 빠른 개발. |
| Bare Workflow / React Native CLI | 네이티브 코드 직접 관리. 자유도 높음. 환경 설정 복잡. |

## 결정

**Expo Managed Workflow(SDK 54)를 채택한다.**

## 이유

1. **빠른 개발 사이클** — `npx expo start` 하나로 Android/iOS 동시 실행. 환경 설정 시간 절감.
2. **Expo Go로 즉시 테스트** — 실기기에 QR 코드 하나로 바로 확인 가능. APK 빌드 없이 개발.
3. **EAS Build 통합** — 클라우드 빌드로 개발 PC에 Xcode·Android SDK 없이도 APK/IPA 생성 가능.
4. **학습 목적에 적합** — 수업 기간(14주) 안에 기능 완성이 목표. 네이티브 설정보다 기능 구현에 집중.

## 트레이드오프

- 일부 네이티브 모듈 사용 불가 → 이 앱에서 필요한 기능(알림, 로컬 저장)은 모두 Expo SDK에서 지원됨
- Expo Go에서 `expo-notifications`가 SDK 53/54 버전 불일치 경고 발생 → dynamic import로 우회 처리 (ADR-003 참조)

## 결과

- `app.json` 에 Expo 설정 중앙화
- `eas.json` 으로 preview(APK)/production 빌드 프로필 분리
- Expo Go로 개발 중 실시간 확인, EAS로 발표용 APK 빌드
