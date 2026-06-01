# Morning Pages ☀️

> 매일 아침 2~3분, 오늘의 나를 기록한다.

모바일 일기 앱 — React Native(Expo) + TypeScript + AsyncStorage

---

## 🎯 프로젝트 소개

종이 일기는 휴대가 불편하고, 일반 메모앱은 감정 기록에 특화되어 있지 않다.  
**Morning Pages**는 스마트폰으로 30초 안에 일기 작성을 시작할 수 있는 감정 일기 앱이다.

| 사용자 목표 | 매일 아침 일기를 쓰는 습관 형성 |
|---|---|
| 제품 목표 | 직관적인 UI로 30초 안에 일기 작성 시작 |
| 기술 목표 | 오프라인에서도 완전히 동작하는 로컬 저장 기반 앱 |

---

## 🏛 아키텍처

Layered Architecture + MVVM 패턴

```
Presentation (screens / components)
    ↓
Application  (ViewModel / Context)
    ↓
Domain       (UseCase / Entity)
    ↓
Data         (Repository / AsyncStorage)
```

---

## 🛠 기술 스택

| 분야 | 기술 |
|---|---|
| 프레임워크 | React Native (Expo SDK ~53) |
| 언어 | TypeScript |
| 라우팅 | expo-router (파일 기반) |
| 저장소 | AsyncStorage (오프라인 우선) |
| 상태관리 | React Context + Custom ViewModel Hook |
| 테스트 | Jest |

---

## 📁 프로젝트 구조

```
Morning_Pages/
├── app/                    # expo-router 라우트 파일
│   ├── (tabs)/             # 탭 네비게이션
│   ├── write.tsx           # 일기 작성 모달
│   ├── diary/[id].tsx      # 일기 상세
│   ├── records.tsx         # 과거 기록
│   └── favorites.tsx       # 즐겨찾기
├── src/
│   ├── domain/
│   │   ├── entities/       # Diary, Mood 타입
│   │   └── usecases/       # SaveDiaryUseCase 등
│   ├── data/
│   │   └── repositories/   # DiaryRepository (AsyncStorage)
│   ├── application/
│   │   ├── context/        # DiaryContext
│   │   └── viewmodels/     # DiaryViewModel
│   └── presentation/
│       ├── screens/        # 각 화면 컴포넌트
│       └── components/     # 공통 UI 컴포넌트
├── docs/
│   └── presentation/       # 중간 발표 슬라이드 (GitHub Pages)
└── .planning/              # 기획 문서 (비전·WBS·아키텍처)
```

---

## 🚀 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npx expo start

# 테스트 실행
npx jest
```

---

## ✅ 구현 현황

- [x] 일기 작성 / 수정 / 삭제 / 조회 (CRUD)
- [x] 기분(이모지) 기록
- [x] 즐겨찾기 토글
- [x] 과거 기록 (월별 그룹)
- [x] 사이드 드로어 네비게이션
- [x] 탭 + 스택 네비게이터
- [x] 오프라인 완전 동작 (AsyncStorage)
- [x] UseCase 단위 테스트 (Jest)
- [ ] 캘린더 뷰
- [ ] 푸시 알림
- [ ] EAS Build 배포

---

## 📊 중간 발표 자료

👉 **[발표 슬라이드 보기](https://[USERNAME].github.io/morning-pages/presentation/)**

---

## 📄 라이선스

개인 학습 프로젝트 — MIT
