# 배포 가이드

EAS Build를 사용해 Android APK / iOS IPA를 빌드하고 배포하는 방법.

---

## 사전 준비

```bash
npm install -g eas-cli
eas login
```

Expo 계정이 없으면 https://expo.dev 에서 가입 후 로그인.

---

## 1. EAS 초기화

프로젝트 루트에서 한 번만 실행:

```bash
eas build:configure
```

`eas.json` 파일이 생성됩니다.

---

## 2. Android APK 빌드

### 개발용 APK (에뮬레이터/실기기 테스트)

```bash
eas build --platform android --profile preview
```

### 릴리즈 APK (발표/배포용)

```bash
eas build --platform android --profile production
```

빌드 완료 후 Expo 대시보드(expo.dev)에서 APK 다운로드.

---

## 3. `eas.json` 설정 예시

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## 4. 실기기에 APK 설치

1. 다운로드한 `.apk` 파일을 Android 기기로 전송
2. 기기 설정 → 보안 → "출처를 알 수 없는 앱 설치" 허용
3. 파일 앱에서 APK 실행 → 설치

---

## 5. iOS 빌드 (macOS + Apple Developer 계정 필요)

```bash
eas build --platform ios --profile preview
```

> iOS 빌드는 Apple Developer Program($99/년) 가입 필요.
> 발표용 데모는 Android APK 또는 Expo Go로 대체 가능.

---

## 6. 빌드 상태 확인

```bash
eas build:list
```

또는 https://expo.dev/accounts/[계정명]/projects/morning-pages/builds 에서 확인.

---

## 발표 당일 체크리스트

- [ ] 발표 전날 APK 빌드 완료 및 실기기 설치 확인
- [ ] 앱 실행 → 일기 작성 → 저장 → 조회 흐름 테스트
- [ ] 화면 녹화 영상 백업 준비 (기기 오류 대비)
- [ ] 에뮬레이터 대기 실행 상태 유지
