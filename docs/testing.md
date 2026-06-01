# 테스트 가이드

---

## 테스트 전략

| 유형 | 도구 | 대상 |
|---|---|---|
| 단위 테스트 | Jest | Domain UseCase, 유틸 함수 |
| 컴포넌트 테스트 | React Native Testing Library | UI 컴포넌트 |
| 수동 테스트 | Expo Go / 에뮬레이터 | 전체 흐름, 오프라인 동작 |

---

## 1. 테스트 환경 설치

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

`package.json`에 추가:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "jest": {
    "preset": "jest-expo"
  }
}
```

---

## 2. 단위 테스트 실행

```bash
npm test
```

특정 파일만:

```bash
npm test -- DiaryUseCase
```

---

## 3. 핵심 테스트 시나리오

### 일기 CRUD (Must)

| # | 시나리오 | 기대 결과 |
|---|---|---|
| 1 | 제목 + 본문 작성 후 저장 | 목록에 새 항목 표시 |
| 2 | 저장된 일기 탭 | 상세 화면으로 이동, 내용 정확히 표시 |
| 3 | 일기 수정 후 저장 | 수정 내용 반영 |
| 4 | 일기 삭제 | 목록에서 제거 |
| 5 | 내용 없이 저장 시도 | 저장 불가 또는 경고 표시 |

### 주제 & 제시어

| # | 시나리오 | 기대 결과 |
|---|---|---|
| 6 | 주제 선택 | 작성 화면 상단에 해당 제시어 표시 |
| 7 | 자유 글쓰기 선택 | 제시어 없이 빈 화면 |

### 오프라인 동작

| # | 시나리오 | 기대 결과 |
|---|---|---|
| 8 | 비행기 모드에서 앱 실행 | 정상 실행 |
| 9 | 비행기 모드에서 일기 저장 | 저장 성공 |
| 10 | 비행기 모드에서 목록 조회 | 기존 일기 정상 표시 |

### 기분 기록 (Should)

| # | 시나리오 | 기대 결과 |
|---|---|---|
| 11 | 이모지 선택 후 저장 | 상세 화면에서 선택한 이모지 표시 |
| 12 | 기분 미선택 저장 | 저장 가능, 기분 항목 공백 표시 |

---

## 4. 단위 테스트 예시

```typescript
// src/domain/usecases/__tests__/SaveDiaryUseCase.test.ts
import { SaveDiaryUseCase } from '../SaveDiaryUseCase';

describe('SaveDiaryUseCase', () => {
  it('내용이 없으면 저장하지 않는다', async () => {
    const useCase = new SaveDiaryUseCase(mockRepository);
    const result = await useCase.execute({ content: '' });
    expect(result.success).toBe(false);
  });

  it('내용이 있으면 저장에 성공한다', async () => {
    const useCase = new SaveDiaryUseCase(mockRepository);
    const result = await useCase.execute({ content: '오늘 좋은 하루였다' });
    expect(result.success).toBe(true);
  });
});
```

---

## 5. 수동 테스트 체크리스트 (발표 전)

```
[ ] 앱 첫 실행 — 홈 화면 2초 내 로딩
[ ] 일기 작성 → 저장 → 목록 확인
[ ] 저장된 일기 탭 → 상세 화면 이동
[ ] 수정 → 저장 → 내용 반영 확인
[ ] 삭제 → 목록에서 제거 확인
[ ] 주제 선택 → 제시어 표시 확인
[ ] 비행기 모드 → 전체 기능 동작 확인
[ ] 앱 종료 후 재실행 → 데이터 유지 확인
```
