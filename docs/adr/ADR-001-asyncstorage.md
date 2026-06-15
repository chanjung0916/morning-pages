# ADR-001: 로컬 저장소로 AsyncStorage 채택

- **날짜:** 2026-03-01
- **상태:** 승인됨

## 맥락

일기 데이터를 어디에 저장할지 결정해야 했다. 후보는 세 가지였다.

| 후보 | 특징 |
|---|---|
| AsyncStorage | React Native 공식 키-값 저장소. 서버 없음. 오프라인 완전 동작. |
| SQLite (expo-sqlite) | 관계형 DB. 복잡한 쿼리 가능. 설정 복잡. |
| 서버(Firebase 등) | 클라우드 동기화 가능. 인터넷 필수. 비용 발생. |

## 결정

**AsyncStorage를 채택한다.**

## 이유

1. **오프라인 우선** — 아침 일기는 인터넷 없이도 써야 한다. 지하철, 산간 지역 모두 동작해야 함.
2. **개인 데이터 보호** — 일기는 민감 정보다. 서버로 보내지 않고 기기에만 보관하는 것이 사용자 신뢰에 유리.
3. **구현 단순성** — SQLite는 스키마 설계·마이그레이션이 필요. 일기 앱 규모에서는 오버엔지니어링.
4. **Expo Managed Workflow 호환** — expo-sqlite도 동작하지만, AsyncStorage가 더 안정적으로 Expo Go에서 동작.

## 트레이드오프

- 복잡한 JOIN 쿼리 불가 → 날짜·즐겨찾기 필터는 JS 배열로 처리 (데이터량이 적어 성능 문제 없음)
- 기기 변경 시 데이터 이전 불가 → 향후 export/import 기능으로 보완 예정

## 결과

- `src/data/repositories/DiaryRepository.ts` 가 AsyncStorage를 직접 사용
- Domain 레이어는 저장소에 의존하지 않으므로 나중에 SQLite로 교체 가능
