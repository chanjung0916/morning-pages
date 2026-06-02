# 테스트 가이드

## 테스트 실행

```bash
npx jest              # 전체 실행
npx jest --watch      # 변경 감지 자동 실행
npx jest DiaryRepo    # 특정 파일만
```

---

## 현재 테스트 현황

> 총 **11개** 통과 (2025-06-02 기준)

```
PASS src/domain/usecases/__tests__/SaveDiaryUseCase.test.ts
  ✓ 내용이 없으면 저장하지 않는다
  ✓ 공백만 있는 내용도 저장하지 않는다
  ✓ 내용이 있으면 저장에 성공한다
  ✓ 저장된 일기에 날짜가 올바르게 설정된다

PASS src/data/repositories/__tests__/DiaryRepository.test.ts
  ✓ 일기를 저장하면 AsyncStorage에 기록된다
  ✓ 저장된 일기 전체를 불러올 수 있다
  ✓ id로 특정 일기를 찾을 수 있다
  ✓ 없는 id로 조회하면 null을 반환한다
  ✓ 일기를 삭제하면 목록에서 사라진다
  ✓ 즐겨찾기 토글 — false에서 true로 변경된다
  ✓ 즐겨찾기 토글 — true에서 false로 변경된다

Test Suites: 2 passed
Tests:       11 passed
```

---

## 테스트 구조

| 파일 | 레이어 | 검증 내용 |
|---|---|---|
| `SaveDiaryUseCase.test.ts` | Domain | 빈 내용 저장 방지, 날짜 설정 규칙 |
| `DiaryRepository.test.ts` | Data | 저장·조회·삭제·즐겨찾기 CRUD |

---

## SaveDiaryUseCase 테스트

**위치:** `src/domain/usecases/__tests__/SaveDiaryUseCase.test.ts`

비즈니스 규칙 검증. AsyncStorage 없이 mock Repository로 순수하게 UseCase만 테스트.

| 테스트 | 검증 내용 |
|---|---|
| 내용이 없으면 저장하지 않는다 | `content: ''` → `success: false` |
| 공백만 있는 내용도 저장하지 않는다 | `content: '   '` → `success: false` |
| 내용이 있으면 저장에 성공한다 | 정상 내용 → `success: true`, `save()` 1회 호출 |
| 저장된 일기에 날짜가 올바르게 설정된다 | `diary.date === '2026-05-26'` |

---

## DiaryRepository 테스트

**위치:** `src/data/repositories/__tests__/DiaryRepository.test.ts`

AsyncStorage를 mock 처리하여 실제 저장 로직 검증.

| 테스트 | 검증 내용 |
|---|---|
| 일기를 저장하면 AsyncStorage에 기록된다 | `setItem` 호출 확인 |
| 저장된 일기 전체를 불러올 수 있다 | `findAll()` 결과 길이·id 확인 |
| id로 특정 일기를 찾을 수 있다 | `findById()` 정확한 항목 반환 |
| 없는 id로 조회하면 null을 반환한다 | `findById('없는id')` → `null` |
| 일기를 삭제하면 목록에서 사라진다 | `delete()` 후 해당 id 제거 확인 |
| 즐겨찾기 토글 — false → true | `favorite: false` → `true` |
| 즐겨찾기 토글 — true → false | `favorite: true` → `false` |

---

## 수동 테스트 체크리스트 (발표 전)

```
[ ] 앱 첫 실행 — 홈 화면 정상 로딩
[ ] 일기 작성 → 저장 → 목록 확인
[ ] 저장된 일기 탭 → 상세 화면 이동
[ ] 수정 → 저장 → 내용 반영 확인
[ ] 삭제 → 목록에서 제거 확인
[ ] 기분 이모지 선택 → 저장 후 표시 확인
[ ] 즐겨찾기 토글 → 즐겨찾기 탭에서 확인
[ ] 사이드 드로어 → 캘린더 이동
[ ] 사이드 드로어 → 과거 기록 이동
[ ] 비행기 모드 → 전체 기능 정상 동작
[ ] 앱 종료 후 재실행 → 데이터 유지 확인
```
