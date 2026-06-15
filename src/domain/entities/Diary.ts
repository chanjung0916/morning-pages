/**
 * Domain Entity: Diary
 * 일기 데이터의 핵심 모델 — 플랫폼 의존 없음
 */

export interface Diary {
  id: string;          // UUID
  date: string;        // 'YYYY-MM-DD'
  content: string;     // 일기 본문
  topicId?: string;    // 선택한 주제 ID (선택)
  favorite?: boolean;  // 즐겨찾기
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}

export interface DiaryDraft {
  date: string;
  content: string;
  topicId?: string;
}
